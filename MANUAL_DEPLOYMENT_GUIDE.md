# Manual Deployment Guide for Telegram Translation Bot

This guide provides step-by-step instructions for manually deploying the Telegram Translation Bot to your server when the automated deployment script fails due to connectivity issues.

## Prerequisites

1. SSH access to your server
2. Telegram Bot Token: `8319299846:AAG7zyvH9P_RD6UZDbdsCF_MK-zE4vu1fVY`
3. OpenAI API Key: `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`

## Troubleshooting Server Connectivity

Before proceeding with deployment, verify that you can connect to your server:

1. Check if the server is online:
   ```bash
   ping 31.97.173.218
   ```

2. Test SSH connection:
   ```bash
   ssh root@31.97.173.218
   ```

If these fail, check:
- Server status with your hosting provider
- Firewall settings on the server
- Network connectivity from your location
- Correctness of the IP address and credentials

## Manual Deployment Steps

### Step 1: Prepare Local Files

1. Ensure you have the following files in your project directory:
   - Dockerfile
   - docker-compose.yml
   - nginx.conf
   - .env (already created with your credentials)
   - All files in the src/ directory

2. Verify the .env file contains:
   ```
   # Server Configuration
   PORT=3000

   # Telegram Bot Configuration
   TELEGRAM_BOT_TOKEN=8319299846:AAG7zyvH9P_RD6UZDbdsCF_MK-zE4vu1fVY

   # OpenAI Configuration
   OPENAI_API_KEY=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
   OPENAI_MODEL=gpt-5-turbo

   # Session Configuration
   SESSION_EXPIRY_TIME=86400000

   # Retry Configuration
   MAX_RETRIES=3
   BASE_DELAY=1000
   ```

### Step 2: Connect to Server and Prepare Environment

1. Connect to your server:
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

4. Exit the server session:
   ```bash
   exit
   ```

### Step 3: Copy Application Files to Server

From your local machine, copy the application files to the server:
```bash
scp -r ./* root@31.97.173.218:/opt/telegram-translation-bot/
```

### Step 4: Configure Application on Server

1. Connect to your server:
   ```bash
   ssh root@31.97.173.218
   ```

2. Set proper permissions for the environment file:
   ```bash
   chmod 600 /opt/telegram-translation-bot/.env
   ```

3. Create logs directory:
   ```bash
   mkdir -p /opt/telegram-translation-bot/logs
   ```

### Step 5: Configure Nginx Reverse Proxy

1. Copy the Nginx configuration:
   ```bash
   cp /opt/telegram-translation-bot/nginx.conf /etc/nginx/sites-available/telegram-translation-bot
   ```

2. Create a symbolic link to enable the site:
   ```bash
   ln -sf /etc/nginx/sites-available/telegram-translation-bot /etc/nginx/sites-enabled/
   ```

3. Test Nginx configuration:
   ```bash
   nginx -t
   ```

4. If the test passes, reload Nginx:
   ```bash
   systemctl reload nginx
   ```

### Step 6: Obtain SSL Certificate

1. Request an SSL certificate for your domain:
   ```bash
   certbot --nginx -d anna.floripa.br --non-interactive --agree-tos --email admin@anna.floripa.br
   ```

### Step 7: Deploy Application with Docker

1. Navigate to the application directory:
   ```bash
   cd /opt/telegram-translation-bot
   ```

2. Build and start the Docker containers:
   ```bash
   docker-compose up -d
   ```

3. Check the logs to verify the application is running:
   ```bash
   docker-compose logs -f
   ```

### Step 8: Verify Deployment

1. Check container status:
   ```bash
   docker-compose ps
   ```

2. Test the application health endpoint (once SSL is configured):
   ```bash
   curl -k https://anna.floripa.br/health
   ```

## Troubleshooting Common Issues

### SSH Connection Issues
- Verify server IP address and SSH port
- Check if SSH service is running on the server
- Confirm firewall rules allow SSH connections

### Docker Issues
- Ensure Docker is installed and running:
  ```bash
  systemctl status docker
  ```
- Check Docker permissions:
  ```bash
  usermod -aG docker $USER
  ```

### Nginx Issues
- Check Nginx error logs:
  ```bash
  tail -f /var/log/nginx/error.log
  ```
- Verify configuration syntax:
  ```bash
  nginx -t
  ```

### SSL Certificate Issues
- Check certificate status:
  ```bash
  certbot certificates
  ```
- Manually renew if needed:
  ```bash
  certbot renew
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

If you continue to experience issues, please check:
1. Server status with your hosting provider
2. Firewall settings on the server
3. Network connectivity from your location
4. Correctness of the IP address and credentials