# Deployment Plan: Telegram Translation Bot

## Overview
This document outlines the deployment plan for the Telegram Translation Bot application to a remote server at `ssh root@31.97.173.218` with SSL certificate configuration for `anna.floripa.br`.

## Application Architecture
The Telegram Translation Bot is a Node.js application with the following components:
- Express.js server for health checks and monitoring
- Telegraf library for Telegram bot integration
- OpenAI GPT-5-nano model for language processing
- Docker containerization support
- Environment-based configuration management

## Prerequisites
- SSH access to server: `ssh root@31.97.173.218`
- SSL certificate for domain: `anna.floripa.br`
- Telegram Bot Token
- OpenAI API Key

## Deployment Strategy

### 1. Server Preparation
- Update system packages
- Install Docker and Docker Compose
- Configure firewall rules
- Set up SSL certificate for `anna.floripa.br`

### 2. Secure Credential Management
- Establish secure process for receiving API keys and tokens
- Create environment file with required secrets:
  - `TELEGRAM_BOT_TOKEN`
  - `OPENAI_API_KEY`
- Set proper file permissions for sensitive data

### 3. Application Configuration
- Configure reverse proxy (Nginx) for SSL termination
- Set up application with secure environment variables

### 4. Container Deployment
- Build Docker image from source
- Deploy container with proper environment variables
- Set up auto-restart policies

## Detailed Deployment Steps

### Step 1: Connect to Server and Update System
```bash
# Connect to server
ssh root@31.97.173.218

# Update system packages
apt update && apt upgrade -y

# Install required packages
apt install -y docker.io docker-compose nginx certbot python3-certbot-nginx
```

### Step 2: Configure SSL Certificate
```bash
# Obtain SSL certificate for domain
certbot --nginx -d anna.floripa.br

# Certbot will automatically configure Nginx for SSL
```

### Step 3: Prepare Application Directory
```bash
# Create application directory
mkdir -p /opt/telegram-translation-bot

# Create environment file with secure permissions
 touch /opt/telegram-translation-bot/.env
 chmod 600 /opt/telegram-translation-bot/.env

# Note: Environment file will be populated with actual credentials provided securely
# Template for reference:
# cat > /opt/telegram-translation-bot/.env << EOF
# # Server Configuration
# PORT=3000
# 
# # Telegram Bot Configuration
# TELEGRAM_BOT_TOKEN=your_telegram_bot_token_here
# 
# # OpenAI Configuration
# OPENAI_API_KEY=your_openai_api_key_here
# OPENAI_MODEL=gpt-5-turbo
# 
# # Session Configuration
# SESSION_EXPIRY_TIME=86400000
# 
# # Retry Configuration
# MAX_RETRIES=3
# BASE_DELAY=1000
# EOF
```

### Step 4: Configure Nginx Reverse Proxy
```bash
# Create Nginx configuration
cat > /etc/nginx/sites-available/telegram-translation-bot << 'EOF'
server {
    listen 80;
    server_name anna.floripa.br;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name anna.floripa.br;

    ssl_certificate /etc/letsencrypt/live/anna.floripa.br/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/anna.floripa.br/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 86400;
    }
}
EOF

# Enable the site
ln -s /etc/nginx/sites-available/telegram-translation-bot /etc/nginx/sites-enabled/

# Test and reload Nginx
nginx -t && systemctl reload nginx
```

### Step 5: Deploy Application with Docker
```bash
# Create docker-compose file
cat > /opt/telegram-translation-bot/docker-compose.yml << 'EOF'
version: '3.8'

services:
  telegram-bot:
    build: .
    container_name: telegram-translation-bot
    ports:
      - "3000:3000"
    env_file:
      - .env
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped
EOF

# Copy application files to server (run from local machine)
# scp -r ./* root@31.97.173.218:/opt/telegram-translation-bot/
```

### Step 5: Secure Credential Transfer

To securely provide your API keys and tokens:

1. **Option 1: Secure Messaging App**
   - Use a secure messaging application like Signal to send credentials

2. **Option 2: Password Manager**
   - Use a password manager with secure sharing capabilities

3. **Option 3: Temporary File Sharing**
   - Use a secure file sharing service with expiration

### Step 6: Finalize Deployment
```bash
# On the server, navigate to application directory
cd /opt/telegram-translation-bot

# After receiving credentials securely, populate environment file
# Edit /opt/telegram-translation-bot/.env with actual tokens

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
- Firewall should restrict unnecessary ports
- Environment variables are stored securely with proper file permissions (600)
- SSL encryption for all external communications
- Credentials are provided through secure channel
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