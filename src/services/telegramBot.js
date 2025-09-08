const { Telegraf } = require('telegraf');
const config = require('../config/config');
const translationService = require('./translationService');
const sessionManager = require('./sessionManager');
const { TranslationBotError } = require('../utils/errors');
const logger = require('../utils/logger');

class TelegramBot {
  constructor() {
    // Initialize Telegraf with the bot token
    this.bot = new Telegraf(config.telegramToken);
    
    // Set up the bot commands and message handlers
    this.setupBot();
  }

  /**
   * Set up the bot commands and message handlers
   */
  setupBot() {
    // Handle /start command
    this.bot.start((ctx) => {
      logger.info('Bot started', { userId: ctx.from.id });
      ctx.reply('Welcome to the Translation Bot! Please tell me which 2-3 languages you want to use for translation. For example: "I want to use English, Russian, and Korean"');
    });

    // Handle /help command
    this.bot.help((ctx) => {
      ctx.reply('Send me a message and I will translate it to your selected languages. To change languages, just tell me which languages you want to use.');
    });

    // Handle /languages command
    this.bot.command('languages', (ctx) => {
      const userId = ctx.from.id.toString();
      const session = sessionManager.getSession(userId);
      
      if (session.selectedLanguages && session.selectedLanguages.length > 0) {
        const languages = session.selectedLanguages.map(lang => `${lang.name} (${lang.code})`).join(', ');
        ctx.reply(`Your selected languages: ${languages}`);
      } else {
        ctx.reply('You have not set up any languages yet. Please tell me which 2-3 languages you want to use for translation.');
      }
    });

    // Handle /clear command
    this.bot.command('clear', (ctx) => {
      const userId = ctx.from.id.toString();
      sessionManager.clearSession(userId);
      ctx.reply('Your language preferences have been cleared. Please tell me which 2-3 languages you want to use for translation.');
    });

    // Handle /reset command
    this.bot.command('reset', (ctx) => {
      const userId = ctx.from.id.toString();
      sessionManager.clearSession(userId);
      ctx.reply('Your language preferences have been cleared. Please tell me which 2-3 languages you want to use for translation.');
    });

    // Handle text messages
    this.bot.on('text', async (ctx) => {
      try {
        const userId = ctx.from.id.toString();
        const userInput = ctx.message.text;
        logger.info('Processing user message', { userId, message: userInput });
        
        // Process the translation
        const result = await translationService.processTranslation(userId, userInput);
        logger.info('Translation processed successfully', { userId, resultType: result.type });
        
        // Send appropriate response based on result type
        if (result.type === 'language_setup') {
          const languages = result.languages.map(lang => `${lang.name} (${lang.code})`).join(', ');
          ctx.reply(`✅ ${result.message}\n\nLanguages set: ${languages}`);
        } else if (result.type === 'translation') {
          let response = `Translated from ${result.sourceLanguage}:\n\n`;
          
          for (const translation of result.translations) {
            if (translation.skipped) {
              response += `⏭️ ${translation.language.name} (${translation.language.code}): [Original text]\n`;
            } else {
              response += `🔄 ${translation.language.name} (${translation.language.code}):\n${translation.text}\n\n`;
            }
          }
          
          ctx.reply(response);
        }
      } catch (error) {
        logger.error('Error processing message', { userId, error: error.message, stack: error.stack });
        
        // Handle custom errors
        if (error instanceof TranslationBotError) {
          ctx.reply(`❌ Error: ${error.message}`);
        } else {
          ctx.reply('Sorry, I encountered an error while processing your request. Please try again.');
        }
      }
    });

    // Handle errors
    this.bot.catch((err, ctx) => {
      console.error('Bot error:', err);
      ctx.reply('Sorry, something went wrong. Please try again later.');
    });
  }

  /**
   * Start the bot in either polling or webhook mode
   * @param {string} webhookUrl - Optional webhook URL for webhook mode
   * @param {number} port - Port for webhook server (only used in webhook mode)
   */
  start(webhookUrl, port) {
    // Enable graceful stop
    process.once('SIGINT', () => this.bot.stop('SIGINT'));
    process.once('SIGTERM', () => this.bot.stop('SIGTERM'));
    
    if (webhookUrl && port) {
      // Launch the bot in webhook mode
      this.bot.launch({
        webhook: {
          domain: webhookUrl,
          port: port
        }
      });
      logger.info(`Telegram bot started in webhook mode at ${webhookUrl}`);
    } else {
      // Launch the bot in polling mode (default)
      this.bot.launch();
      logger.info('Telegram bot started in polling mode');
    }
  }

  /**
   * Stop the bot
   */
  stop() {
    this.bot.stop();
    logger.info('Telegram bot stopped');
  }
  
  /**
   * Get the bot's webhook callback middleware
   * @returns {Function} Express middleware for handling webhooks
   */
  getWebhookCallback() {
    return this.bot.webhookCallback('/telegram/webhook');
  }
}

module.exports = TelegramBot;