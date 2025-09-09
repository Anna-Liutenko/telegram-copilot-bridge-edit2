const express = require('express');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const WEBHOOK_URL = process.env.WEBHOOK_URL; // Expected to be full URL like https://domain/telegram/webhook

// Logger
const logger = require('./utils/logger');

// Services
const sessionManager = require('./services/sessionManager');
const TelegramBot = require('./services/telegramBot');

// Initialize Telegram bot
const telegramBot = new TelegramBot();

// Middleware
app.use(express.json());

// Webhook endpoint for Telegram (Express will handle incoming updates)
app.use('/telegram/webhook', telegramBot.getWebhookCallback());

// Health check endpoint
app.get('/health', async (req, res) => {
  logger.info('Health check endpoint called');
  
  try {
    // Get session count
    const sessionCount = sessionManager.getActiveSessionCount();
    
    // Check OpenAI API health
    let openaiStatus = 'healthy';
    let openaiError = null;
    try {
      const llmClient = require('./services/llmClient');
      await llmClient.callLLM('Test', { maxRetries: 0 });
    } catch (error) {
      openaiStatus = 'unhealthy';
      openaiError = error.message;
    }
    
    // Check Telegram bot status
    const telegramStatus = telegramBot.bot ? 'healthy' : 'unhealthy';
    
    const healthData = {
      overall: (openaiStatus === 'healthy' && telegramStatus === 'healthy') ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        telegram: {
          status: telegramStatus,
          details: {
            bot: {
              healthy: telegramStatus === 'healthy',
              username: telegramBot.bot?.botInfo?.username || 'unknown'
            }
          }
        },
        openai: {
          status: openaiStatus,
          details: {
            healthy: openaiStatus === 'healthy',
            error: openaiError
          }
        },
        sessions: {
          status: 'healthy',
          active_count: sessionCount
        }
      }
    };
    
    res.json(healthData);
  } catch (error) {
    logger.error('Health check failed', { error: error.message });
    res.status(500).json({
      overall: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Translation Bot is running!' });
});

// Start server
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);

  // If WEBHOOK_URL is provided, configure webhook mode using Express callback
  if (WEBHOOK_URL) {
    telegramBot.start(WEBHOOK_URL);
    logger.info(`Telegram bot configured for webhook at ${WEBHOOK_URL}`);
  } else {
    // Fallback: polling mode
    telegramBot.start();
    logger.info('Telegram bot started in polling mode');
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  logger.info('Shutting down...');
  telegramBot.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('Shutting down...');
  telegramBot.stop();
  process.exit(0);
});