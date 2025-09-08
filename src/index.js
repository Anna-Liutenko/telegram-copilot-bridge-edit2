const express = require('express');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Logger
const logger = require('./utils/logger');

// Services
const sessionManager = require('./services/sessionManager');
const TelegramBot = require('./services/telegramBot');

// Initialize Telegram bot
const telegramBot = new TelegramBot();

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  logger.info('Health check endpoint called');
  
  // Get session count
  const sessionCount = sessionManager.getActiveSessionCount();
  
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    sessions: sessionCount
  });
});

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Translation Bot is running!' });
});

// Start server
app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
  
  // Start Telegram bot
  telegramBot.start();
  logger.info('Telegram bot started');
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