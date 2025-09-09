# Deployment script for Telegram Translation Bot (PowerShell version)

# Server information
$SERVER_IP = "31.97.173.218"
$SERVER_USER = "root"
$DOMAIN = "anna.floripa.br"

Write-Host "Starting deployment of Telegram Translation Bot to $SERVER_USER@$SERVER_IP"

# Check local .env file (optional)
if (-not (Test-Path ".env")) {
    Write-Host "Note: .env file not found locally. Will attempt to use existing .env on server if present."
} else {
    # Check if required environment variables are set
    $envContent = Get-Content ".env" -Raw
    if (-not ($envContent -match "TELEGRAM_BOT_TOKEN") -or -not ($envContent -match "OPENAI_API_KEY")) {
        Write-Host "Warning: TELEGRAM_BOT_TOKEN or OPENAI_API_KEY not found in local .env file."
        Write-Host "Please ensure your .env file contains these values."
    }
}

# Create deployment directory
Write-Host "Creating deployment directory on server..."
ssh "$SERVER_USER@$SERVER_IP" "mkdir -p /opt/telegram-translation-bot"

# Copy application files to server
Write-Host "Copying application files to server..."
scp -r ./* "${SERVER_USER}@${SERVER_IP}:/opt/telegram-translation-bot/"

# Copy .env separately if present
if (Test-Path ".env") {
    Write-Host "Copying .env to server..."
    scp ".env" "${SERVER_USER}@${SERVER_IP}:/opt/telegram-translation-bot/.env"
} else {
    Write-Host "Skipping .env copy (not found locally)."
}

# Connect to server and run setup commands
Write-Host "Setting up application on server..."
# Use a single-quoted here-string to prevent local expansion, then replace a placeholder
$setupScript = @'
# Update system packages
apt update && apt upgrade -y

# Install Node.js 18, nginx, certbot, git
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs nginx certbot python3-certbot-nginx git

# Set proper permissions for environment file
if [ -f /opt/telegram-translation-bot/.env ]; then
    chmod 600 /opt/telegram-translation-bot/.env
else
    echo "Warning: /opt/telegram-translation-bot/.env not found on server. The app may fail to start without required secrets."
fi

# Create logs directory
mkdir -p /opt/telegram-translation-bot/logs

# Install app dependencies
cd /opt/telegram-translation-bot
npm ci --only=production || npm install --omit=dev --no-audit --no-fund

# Install PM2 for process management (optional fallback)
npm install -g pm2 || true

# Setup systemd service
cp /opt/telegram-translation-bot/telegram-translation-bot.service /etc/systemd/system/telegram-translation-bot.service
systemctl daemon-reload
systemctl enable telegram-translation-bot
systemctl restart telegram-translation-bot || systemctl start telegram-translation-bot

# Copy Nginx configuration
cp /opt/telegram-translation-bot/nginx.conf /etc/nginx/sites-available/telegram-translation-bot
ln -sf /etc/nginx/sites-available/telegram-translation-bot /etc/nginx/sites-enabled/

# Test and reload Nginx
nginx -t && systemctl reload nginx

# Obtain SSL certificate
certbot --nginx -d DOMAIN_PLACEHOLDER --non-interactive --agree-tos --email admin@DOMAIN_PLACEHOLDER || true

echo "Deployment completed successfully!"
echo "Application is running at https://DOMAIN_PLACEHOLDER"
echo "Check logs: journalctl -u telegram-translation-bot -f"
'@
$setupScript = $setupScript.Replace('DOMAIN_PLACEHOLDER', $DOMAIN)

# Execute the setup script on the remote server
$setupScript | ssh "$SERVER_USER@$SERVER_IP" 'bash -s'

if ($LASTEXITCODE -eq 0) {
    Write-Host "Deployment script completed!"
    Write-Host "Your Telegram Translation Bot should now be running at https://$DOMAIN"
} else {
    Write-Host "Deployment failed!"
    exit 1
}