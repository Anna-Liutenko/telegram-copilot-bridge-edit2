# Application Deployment Plan

## Overview
This document outlines the deployment plan for the Telegram Translation Bot to the server at `root@31.97.173.218`. The deployment will include setting up the necessary environment, copying application files, configuring SSL certificates, and starting the application using Docker.

## Prerequisites
- SSH access to server: `root@31.97.173.218`
- Telegram Bot Token: [SECURELY PROVIDED]
- OpenAI API Key: [SECURELY PROVIDED]
- SSL certificate for domain: `anna.floripa.br`

## Deployment Steps

### 1. Prepare Environment
The deployment script will automatically create the `.env` file with the provided credentials on the server.

### 2. Run Pre-Deployment Verification
Before deployment, we will run the verification script to ensure all files are in place:
```bash
node verify-deployment.js
```

This script verifies:
- All essential deployment files exist
- Dockerfile has correct content
- docker-compose.yml has correct content
- Nginx configuration is correct
- Environment variables are properly configured
- Deployment scripts contain necessary commands

The script will output whether all files are present and correctly configured before proceeding with deployment.

### 3. Deploy Using Automated Script
Execute the deployment script:
```bash
chmod +x deploy.sh
./deploy.sh
```

This script will:
- Create deployment directory on server at `/opt/telegram-translation-bot/`
- Copy application files to server
- Install required packages (Docker, Docker Compose, Nginx, Certbot)
- Set proper permissions for environment file (600)
- Create logs directory
- Configure Nginx reverse proxy
- Obtain SSL certificate for domain `anna.floripa.br`
- Build and start Docker containers
- Verify deployment success

### 4. Manual Verification Steps (if needed)
If the automated deployment fails, we can manually execute these steps:

1. Connect to server:
```bash
ssh root@31.97.173.218
```

2. Update system packages:
```bash
apt update && apt upgrade -y
```

3. Install required packages:
```bash
apt install -y docker.io docker-compose nginx certbot python3-certbot-nginx
```

4. Copy application files to server (from local machine):
```bash
scp -r ./* root@31.97.173.218:/opt/telegram-translation-bot/
```

5. Set proper permissions for environment file:
```bash
chmod 600 /opt/telegram-translation-bot/.env
```

6. Configure Nginx reverse proxy:
```bash
cp /opt/telegram-translation-bot/nginx.conf /etc/nginx/sites-available/telegram-translation-bot
ln -s /etc/nginx/sites-available/telegram-translation-bot /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
```

7. Obtain SSL certificate:
```bash
certbot --nginx -d anna.floripa.br
```

8. Deploy application with Docker:
```bash
cd /opt/telegram-translation-bot
docker-compose up -d
```

9. Check logs:
```bash
docker-compose logs -f
```

## Post-Deployment Verification
After deployment, the following checks will be performed:
- Application health check via `/health` endpoint
- Container status verification with `docker-compose ps`
- Log inspection with `docker-compose logs`
- End-to-end functionality test

### Pre-Deployment Verification
Before deployment, we will run the verification script to ensure all files are in place:
```bash
node verify-deployment.js
```

## Monitoring and Maintenance
- Application logs: `/opt/telegram-translation-bot/logs/`
- Docker logs: `docker-compose logs`
- Nginx logs: `/var/log/nginx/`
- System logs: `/var/log/syslog/`

## Security Considerations
- Environment variables stored with proper file permissions (600)
- Application runs as non-root user inside container
- SSL encryption for all external communications
- Regular security updates for system packages

## Rollback Plan
If deployment fails:
1. Stop and remove containers: `docker-compose down`
2. Restore previous version from backup
3. Re-run deployment process