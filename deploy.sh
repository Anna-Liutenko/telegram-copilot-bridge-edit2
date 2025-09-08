#!/bin/bash

# Deployment script for Telegram Translation Bot

# Server information
SERVER_IP="31.97.173.218"
SERVER_USER="root"
DOMAIN="anna.floripa.br"

echo "Starting deployment of Telegram Translation Bot to $SERVER_USER@$SERVER_IP"

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "Error: .env file not found. Please create .env file with your credentials."
    echo "You can copy .env.example to .env and fill in your credentials."
    exit 1
fi

# Check if required environment variables are set
if [ -z "$TELEGRAM_BOT_TOKEN" ] || [ -z "$OPENAI_API_KEY" ]; then
    echo "Warning: TELEGRAM_BOT_TOKEN or OPENAI_API_KEY not set in environment."
    echo "Please ensure your .env file contains these values."
fi

# Create deployment directory
echo "Creating deployment directory on server..."
ssh $SERVER_USER@$SERVER_IP "mkdir -p /opt/telegram-translation-bot"

# Copy application files to server
echo "Copying application files to server..."
scp -r ./* $SERVER_USER@$SERVER_IP:/opt/telegram-translation-bot/

# Connect to server and run setup commands
echo "Setting up application on server..."
ssh $SERVER_USER@$SERVER_IP << 'EOF'
# Update system packages
apt update && apt upgrade -y

# Install required packages
apt install -y docker.io docker-compose nginx certbot python3-certbot-nginx

# Set proper permissions for environment file
chmod 600 /opt/telegram-translation-bot/.env

# Create logs directory
mkdir -p /opt/telegram-translation-bot/logs

# Copy Nginx configuration
cp /opt/telegram-translation-bot/nginx.conf /etc/nginx/sites-available/telegram-translation-bot
ln -sf /etc/nginx/sites-available/telegram-translation-bot /etc/nginx/sites-enabled/

# Test and reload Nginx
nginx -t && systemctl reload nginx

# Obtain SSL certificate
certbot --nginx -d anna.floripa.br --non-interactive --agree-tos --email admin@anna.floripa.br

# Build and start Docker containers
cd /opt/telegram-translation-bot
docker-compose up -d

# Check if deployment was successful
if [ $? -eq 0 ]; then
    echo "Deployment completed successfully!"
    echo "Application is running at https://anna.floripa.br"
    echo "Check logs with: docker-compose logs -f"
else
    echo "Deployment failed!"
    exit 1
fi
EOF

if [ $? -eq 0 ]; then
    echo "Deployment script completed!"
    echo "Your Telegram Translation Bot should now be running at https://anna.floripa.br"
else
    echo "Deployment failed!"
    exit 1
fi