# Telegram Translation Bot Deployment Guide

This document provides instructions for deploying the Telegram Translation Bot to a remote server with SSL certificate configuration.

## Prerequisites

1. SSH access to server: `ssh root@31.97.173.218`
2. SSL certificate for domain: `anna.floripa.br`
3. Telegram Bot Token
4. OpenAI API Key

## Deployment Steps

### 1. Prepare Environment Variables

Create a `.env` file based on the `.env.example` template:

```bash
cp .env.example .env
```

Edit the `.env` file and add your actual credentials:

```
# Server Configuration
PORT=3000

# Telegram Bot Configuration
TELEGRAM_BOT_TOKEN=your_actual_telegram_bot_token_here

# OpenAI Configuration
OPENAI_API_KEY=your_actual_openai_api_key_here
OPENAI_MODEL=gpt-5-turbo

# Session Configuration
SESSION_EXPIRY_TIME=86400000

# Retry Configuration
MAX_RETRIES=3
BASE_DELAY=1000
```

### 2. Deploy Using Automated Script

#### On Linux/Mac:
```bash
chmod +x deploy.sh
./deploy.sh
```

#### On Windows (PowerShell):
```powershell
.\deploy.ps1
```

#### On Windows (Command Prompt):
```cmd
powershell .\deploy.ps1
```

### 3. Manual Deployment Steps

If you prefer to deploy manually, follow these steps:

#### Step 1: Connect to Server and Update System
```bash
# Connect to server
ssh root@31.97.173.218

# Update system packages
apt update && apt upgrade -y

# Install required packages
apt install -y docker.io docker-compose nginx certbot python3-certbot-nginx
```

#### Step 2: Copy Application Files
Copy all application files to the server:
```bash
# Run this from your local machine
scp -r ./* root@31.97.173.218:/opt/telegram-translation-bot/
```

#### Step 3: Configure SSL Certificate
```bash
# On the server, obtain SSL certificate for domain
certbot --nginx -d anna.floripa.br
```

#### Step 4: Configure Nginx Reverse Proxy
```bash
# Copy the provided nginx.conf to the appropriate location
cp /opt/telegram-translation-bot/nginx.conf /etc/nginx/sites-available/telegram-translation-bot
ln -s /etc/nginx/sites-available/telegram-translation-bot /etc/nginx/sites-enabled/

# Test and reload Nginx
nginx -t && systemctl reload nginx
```

#### Step 5: Deploy Application with Docker
```bash
# Navigate to application directory
cd /opt/telegram-translation-bot

# Set proper permissions for environment file
chmod 600 .env

# Build and start containers
docker-compose up -d

# Check logs
docker-compose logs -f
```

## Monitoring and Maintenance

### Health Checks
- Application exposes `/health` endpoint
- Monitor container status with `docker-compose ps`
- Check logs with `docker-compose logs`

### SSL Certificate Renewal
- Certbot automatically sets up renewal cron job
- Test renewal with `certbot renew --dry-run`

### Application Updates
1. Pull latest code from repository
2. Rebuild Docker image: `docker-compose build`
3. Restart containers: `docker-compose up -d`

## Security Considerations

- Application runs as non-root user inside container
- Environment variables are stored securely with proper file permissions (600)
- SSL encryption for all external communications
- Regular security updates for system packages

## Troubleshooting

### Common Issues
1. **Bot not responding**: Check Telegram token validity
2. **Translation failures**: Verify OpenAI API key and quota
3. **Connection issues**: Check firewall and network configuration
4. **SSL errors**: Verify certificate validity and renewal

### Log Locations
- Application logs: `/opt/telegram-translation-bot/logs/`
- Docker logs: `docker-compose logs`
- Nginx logs: `/var/log/nginx/`
- System logs: `/var/log/syslog`