# Deployment script for Telegram Translation Bot (PowerShell version)

# Server information
$SERVER_IP = "31.97.173.218"
$SERVER_USER = "root"
$DOMAIN = "anna.floripa.br"

Write-Host "Starting deployment of Telegram Translation Bot to $SERVER_USER@$SERVER_IP"

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "Error: .env file not found. Please create .env file with your credentials."
    Write-Host "You can copy .env.example to .env and fill in your credentials."
    exit 1
}

# Check if required environment variables are set
$envContent = Get-Content ".env" -Raw
if (-not ($envContent -match "TELEGRAM_BOT_TOKEN") -or -not ($envContent -match "OPENAI_API_KEY")) {
    Write-Host "Warning: TELEGRAM_BOT_TOKEN or OPENAI_API_KEY not found in .env file."
    Write-Host "Please ensure your .env file contains these values."
}

# Create deployment directory
Write-Host "Creating deployment directory on server..."
ssh "$SERVER_USER@$SERVER_IP" "mkdir -p /opt/telegram-translation-bot"

# Copy application files to server
Write-Host "Copying application files to server..."
scp -r ./* "${SERVER_USER}@${SERVER_IP}:/opt/telegram-translation-bot/"

# Connect to server and run setup commands
Write-Host "Setting up application on server..."
# Use a script block to avoid variable substitution issues in heredoc
$setupScript = @"
# Update system packages
apt update && apt upgrade -y

# Install required packages
apt install -y docker.io docker-compose nginx certbot python3-certbot-nginx

# Set proper permissions for environment file
chmod 600 /opt/telegram-translation-bot/.env

# Create logs directory
mkdir -p /opt/telegram-translation-bot/logs

# Check if configured port is already in use
CONFIGURED_PORT=\${HOST_PORT:-3000}
echo "Checking if port \$CONFIGURED_PORT is already in use..."
if lsof -Pi :\${CONFIGURED_PORT} -sTCP:LISTEN -t >/dev/null; then
    echo "Port \$CONFIGURED_PORT is already in use. Attempting to resolve conflict..."
    
    # Check if it's a Docker container
    if docker ps | grep -q "\${CONFIGURED_PORT}->\${CONFIGURED_PORT}"; then
        echo "Stopping existing Docker container using port \$CONFIGURED_PORT..."
        docker stop \$(docker ps | grep "\${CONFIGURED_PORT}->\${CONFIGURED_PORT}" | awk '{print \$1}')
    else
        # Kill the process using the configured port
        echo "Killing process using port \$CONFIGURED_PORT..."
        kill -9 \$(lsof -t -i:\${CONFIGURED_PORT})
    fi
    
    # Wait a moment for the port to be released
    sleep 5
fi

# Copy Nginx configuration
cp /opt/telegram-translation-bot/nginx.conf /etc/nginx/sites-available/telegram-translation-bot
ln -sf /etc/nginx/sites-available/telegram-translation-bot /etc/nginx/sites-enabled/

# Test and reload Nginx
nginx -t && systemctl reload nginx

# Obtain SSL certificate
certbot --nginx -d $DOMAIN --non-interactive --agree-tos --email admin@$DOMAIN

# Build and start Docker containers
cd /opt/telegram-translation-bot
docker-compose up -d

# Check if deployment was successful
if [ \$? -eq 0 ]; then
    echo "Deployment completed successfully!"
    echo "Application is running at https://$DOMAIN"
    echo "Check logs with: docker-compose logs -f"
else
    echo "Deployment failed!"
    exit 1
fi
"@

# Execute the setup script on the remote server
$setupScript | ssh "$SERVER_USER@$SERVER_IP" 'bash -s'

if ($LASTEXITCODE -eq 0) {
    Write-Host "Deployment script completed!"
    Write-Host "Your Telegram Translation Bot should now be running at https://$DOMAIN"
} else {
    Write-Host "Deployment failed!"
    exit 1
}