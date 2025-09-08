# Webhook Setup Guide

This guide explains how to configure and use webhooks for the Telegram Translation Bot.

## Why Use Webhooks?

Webhooks provide a more reliable and efficient way to receive updates from Telegram compared to polling, especially in production environments. They are particularly useful when:

1. Deploying the bot in a containerized environment
2. Running the bot behind a firewall or NAT
3. Wanting to reduce latency in message processing
4. Handling high volumes of messages

## Configuration

### Environment Variables

To enable webhook mode, you need to set the following environment variables in your `.env` file:

```bash
# Webhook Configuration (Optional - for production deployment)
WEBHOOK_URL=https://yourdomain.com
WEBHOOK_PORT=3000
```

- `WEBHOOK_URL`: The public URL where your bot is accessible (HTTPS required)
- `WEBHOOK_PORT`: The port on which the webhook server will listen (optional, defaults to 3000)

### Prerequisites

1. A public HTTPS URL (required by Telegram)
2. Your domain must be accessible from the internet
3. Proper SSL certificate (Telegram requires HTTPS)

## Setup Process

### 1. Configure Environment Variables

Add the webhook configuration to your `.env` file:

```bash
WEBHOOK_URL=https://yourdomain.com
WEBHOOK_PORT=3000
```

### 2. Deploy Your Bot

Deploy your bot to a server with a public IP address and domain name.

### 3. Register Webhook with Telegram

Run the webhook setup script:

```bash
npm run setup:webhook
```

This will register your webhook URL with Telegram's API.

## Testing Webhooks

You can test your webhook configuration using:

```bash
npm run test:webhook
```

This script will:
1. Check your bot's information
2. Show current webhook settings
3. Set up the webhook
4. Verify the webhook configuration

## Troubleshooting

### Common Issues

1. **"Bad Request: bad webhook: HTTPS certificate chain broken"**
   - Ensure your SSL certificate is valid and includes the full certificate chain

2. **"Bad Request: bad webhook: Failed to resolve host"**
   - Check that your domain is accessible from the internet

3. **Webhook not receiving updates**
   - Verify the webhook URL is correct
   - Check server logs for errors
   - Ensure the server is running and accessible

### Checking Webhook Status

You can manually check your webhook status with Telegram's API:

```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getWebhookInfo"
```

### Removing Webhook

To switch back to polling mode, you can remove the webhook:

```bash
curl "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/deleteWebhook"
```

## Fallback to Polling

If webhook configuration is not provided, the bot will automatically fall back to polling mode, which is suitable for development and testing environments.

## Security Considerations

1. Always use HTTPS for webhooks
2. Implement proper authentication for your webhook endpoint
3. Validate incoming requests to ensure they're from Telegram
4. Use a firewall to restrict access to your webhook endpoint