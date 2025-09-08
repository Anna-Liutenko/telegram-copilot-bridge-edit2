# Telegram Bot Deployment and Troubleshooting Guide

## Overview
This document outlines the steps needed to troubleshoot and fix the Telegram bot that isn't responding to commands. The issue appears to be related to missing or incorrect credentials in the environment configuration.

## Problem Analysis
Based on the code review, the following issues were identified:

1. The `.env` file contains placeholder values instead of actual credentials
2. The Telegram bot token and OpenAI API key are not properly configured
3. The bot may not be running correctly on the server

## Technical Architecture Review

### Core Components
1. **Telegram Bot Service** (`src/services/telegramBot.js`)
   - Uses Telegraf library for Telegram integration
   - Handles commands: `/start`, `/help`, `/languages`, `/clear`
   - Processes text messages for translation

2. **Configuration** (`src/config/config.js`)
   - Loads environment variables
   - Provides configuration for Telegram token and OpenAI API

3. **Environment Variables** (`.env`)
   - `TELEGRAM_BOT_TOKEN`: Required for bot authentication
   - `OPENAI_API_KEY`: Required for translation services

### Bot Initialization Flow
1. `src/index.js` initializes the TelegramBot service
2. TelegramBot constructor creates a Telegraf instance with the token
3. Bot commands and message handlers are set up
4. When `start()` is called, the bot launches and listens for messages

## Solution Steps

### 1. Update Environment Configuration
The `.env` file needs to be updated with the actual credentials:
- Telegram Bot Token: `8319299846:AAG7zyvH9P_RD6UZDbdsCF_MK-zE4vu1fVY`
- OpenAI API Key: `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`

### 2. Deploy Application to Server
After updating credentials, deploy the application to the server at `31.97.173.218` using the following steps:

1. Copy updated files to server:
   ```bash
   scp -r ./* root@31.97.173.218:/opt/telegram-translation-bot/
   ```

2. SSH into the server:
   ```bash
   ssh root@31.97.173.218
   ```

3. Set proper permissions for the environment file:
   ```bash
   chmod 600 /opt/telegram-translation-bot/.env
   ```

4. Create logs directory:
   ```bash
   mkdir -p /opt/telegram-translation-bot/logs
   ```

5. Navigate to application directory:
   ```bash
   cd /opt/telegram-translation-bot
   ```

6. Stop any existing containers:
   ```bash
   docker-compose down
   ```

7. Build and start the Docker containers:
   ```bash
   docker-compose up -d --build
   ```

### 3. Verify Deployment
After deployment, verify the application is running correctly:

1. Check container status:
   ```bash
   docker-compose ps
   ```

2. Check application logs:
   ```bash
   docker-compose logs -f
   ```

3. Test health endpoint:
   ```bash
   curl http://localhost:3000/health
   ```

### 4. Troubleshooting Common Issues

If the bot still isn't responding:

1. Check Telegram bot token validity:
   - Ensure the token `8319299846:AAG7zyvH9P_RD6UZDbdsCF_MK-zE4vu1fVY` is correct
   - Verify the bot is properly configured with BotFather

2. Check Docker container logs:
   ```bash
   docker-compose logs telegram-bot
   ```

3. Verify the bot is properly initialized:
   - Look for "Telegram bot started" message in logs
   - Check for any authentication errors

4. Test manual bot interaction:
   - Try sending a direct message to the bot on Telegram
   - Use the `/start` command to initialize the bot

## Expected Outcome
After following these steps, the Telegram bot should respond to commands such as:
- `/start` - Initialize the bot
- `/help` - Get help information
- `/languages` - See selected languages
- `/clear` - Clear language preferences
- Any text message - Get translations in selected languages

## Additional Considerations
1. Ensure the server firewall allows incoming connections on port 3000
2. Verify that the domain `anna.floripa.br` points to the server IP address
3. Check that SSL certificates are properly configured if using HTTPS
4. Monitor logs for any errors related to OpenAI API calls