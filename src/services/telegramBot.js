const { Telegraf } = require('telegraf');
const config = require('../config/config');
const translationService = require('./translationService');
const sessionManager = require('./sessionManager');
const rateLimitManager = require('./rateLimitManager');
const userEmojiService = require('./userEmojiService');
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
      const welcomeMessage = `🤖 **Welcome to Translation Bot!**

I help you translate messages between languages quickly and easily.

🎯 **Quick Start:**
1. Tell me which 2-3 languages you want to use
   Example: "English, Russian, Japanese"

2. Send any message and I'll translate it automatically!

💡 **Examples:**
• "I want English, Spanish, French"
• "Russian, Korean, Japanese"  
• "English and German"

Type /help for detailed instructions or just send me your languages to get started! 🚀`;

      ctx.reply(welcomeMessage, { parse_mode: 'Markdown' });
    });

    // Handle /auth command for group authentication
    this.bot.command('auth', async (ctx) => {
      const chatId = ctx.chat.id.toString();
      const session = await sessionManager.getSession(chatId);
      
      if (config.auth.enabled) {
        // Extract the code word from the command (e.g., "/auth translate")
        const args = ctx.message.text.split(' ');
        if (args.length > 1) {
          const providedCode = args[1].toLowerCase();
          if (providedCode === config.auth.codeWord.toLowerCase()) {
            await sessionManager.authenticateSession(chatId);
            ctx.reply(`🔓 Access granted! Welcome to the Translation Bot.
            
Type /help to see all available commands or just tell me which 2-3 languages you want to use.

Example: "English, Russian, Japanese"`);
            return;
          }
        }
        
        // Wrong code or no code provided
        const chatType = ctx.chat.type;
        if (chatType === 'private') {
          ctx.reply(`🔒 Please use: /auth ${config.auth.codeWord}`);
        } else {
          ctx.reply(`🔒 Please use: /auth ${config.auth.codeWord}`);
        }
      } else {
        ctx.reply(`🔓 Authentication is disabled for this bot.`);
      }
    });

    // Handle /help command
    this.bot.help((ctx) => {
      const helpMessage = `📖 **Translation Bot Help**

🚀 **Getting Started:**
1. First, set up your languages by telling me which 2-3 languages you want to use
   Example: "English, Russian, Japanese"

2. Send any text and I'll translate it to your selected languages
   Example: "Hello world!"

📋 **Available Commands:**
/start - Welcome message and setup instructions
/help - Show this help message
/languages - Show your current language settings
/clear or /reset - Clear language settings and start over

💬 **How to Use:**
• **Set Languages:** Just type languages you want to use in plain text
  Examples: 
  - "I want English, Spanish, French"
  - "Russian, Korean, Japanese"
  - "English and German"

• **Translate Text:** After setting languages, send any message
  The bot will detect the source language and translate to others

• **Change Languages:** Send new languages anytime to update settings

✨ **Features:**
• Auto-detect source language
• Support for 2-3 languages per chat
• Clean output format (language code + translation)
• Each chat has independent language settings

Need help? Just ask! 🤖`;

      ctx.reply(helpMessage, { parse_mode: 'Markdown' });
    });

    // Handle /languages command
    this.bot.command('languages', async (ctx) => {
      const chatId = ctx.chat.id.toString();
      
      // Check authentication if enabled
      if (config.auth.enabled) {
        const session = await sessionManager.getSession(chatId);
        if (!session.authenticated) {
          const chatType = ctx.chat.type;
          if (chatType === 'private') {
            ctx.reply(`🔒 Please enter the code word to use this bot.`);
          } else {
            ctx.reply(`🔒 This bot requires authentication in group chats. Please provide the code word.`);
          }
          return;
        }
      }
      
      const session = await sessionManager.getSession(chatId);
      if (session.selectedLanguages && session.selectedLanguages.length > 0) {
        const languages = session.selectedLanguages.map(lang => `${lang.name} (${lang.code})`).join(', ');
        ctx.reply(`Your selected languages: ${languages}`);
      } else {
        ctx.reply('You have not set up any languages yet. Please tell me which 2-3 languages you want to use for translation.');
      }
    });

    // Handle /clear command
    this.bot.command('clear', async (ctx) => {
      const chatId = ctx.chat.id.toString();
      
      // Check authentication if enabled
      if (config.auth.enabled) {
        const session = await sessionManager.getSession(chatId);
        if (!session.authenticated) {
          const chatType = ctx.chat.type;
          if (chatType === 'private') {
            ctx.reply(`🔒 Please enter the code word to use this bot.`);
          } else {
            ctx.reply(`🔒 This bot requires authentication in group chats. Please provide the code word.`);
          }
          return;
        }
      }
      
      const session = await sessionManager.getSession(chatId);
      // Keep authentication status, only clear language settings
      const clearedSession = {
        ...session,
        selectedLanguages: [],
        lastActive: new Date()
      };
      await sessionManager.setSession(chatId, clearedSession);
      ctx.reply('Your language preferences have been cleared. Please tell me which 2-3 languages you want to use for translation.');
    });

    // Handle /reset command
    this.bot.command('reset', async (ctx) => {
      const chatId = ctx.chat.id.toString();
      
      // Check authentication if enabled
      if (config.auth.enabled) {
        const session = await sessionManager.getSession(chatId);
        if (!session.authenticated) {
          const chatType = ctx.chat.type;
          if (chatType === 'private') {
            ctx.reply(`🔒 Please enter the code word to use this bot.`);
          } else {
            ctx.reply(`🔒 This bot requires authentication in group chats. Please provide the code word.`);
          }
          return;
        }
      }
      
      const session = await sessionManager.getSession(chatId);
      // Keep authentication status, only clear language settings
      const clearedSession = {
        ...session,
        selectedLanguages: [],
        lastActive: new Date()
      };
      await sessionManager.setSession(chatId, clearedSession);
      ctx.reply('Your language preferences have been cleared. Please tell me which 2-3 languages you want to use for translation.');
    });

    // Handle text messages
    this.bot.on('text', async (ctx) => {
      const chatId = ctx.chat.id.toString();
      const userId = ctx.from.id.toString();
      
      try {
        const userInput = ctx.message.text;
        
        // Check authentication if enabled
        if (config.auth.enabled) {
          const session = await sessionManager.getSession(chatId);
          
          // If not authenticated, check if this is the code word
          if (!session.authenticated) {
            if (userInput.trim().toLowerCase() === config.auth.codeWord.toLowerCase()) {
              await sessionManager.authenticateSession(chatId);
              ctx.reply(`🔓 Access granted! Welcome to the Translation Bot.
              
Type /help to see all available commands or just tell me which 2-3 languages you want to use.

Example: "English, Russian, Japanese"`);
              return;
            } else {
              // Determine chat type for different messages
              const chatType = ctx.chat.type;
              if (chatType === 'private') {
                ctx.reply(`🔒 Please enter the code word to use this bot.`);
              } else {
                ctx.reply(`🔒 This bot requires authentication in group chats. Please provide the code word.`);
              }
              return;
            }
          }
        }
        
        // Check rate limiting for the user
        if (config.rateLimit.enabled) {
          if (await rateLimitManager.isUserLimitExceeded(userId)) {
            const remaining = await rateLimitManager.getRemainingMessages(userId);
            const timeUntilReset = await rateLimitManager.getTimeUntilReset(userId);
            
            ctx.reply(`🚫 Daily message limit reached!

You have used all ${config.rateLimit.dailyMessageLimit} messages for today.
Remaining messages: ${remaining}
Reset in: ${timeUntilReset}

Come back tomorrow to continue using the translation bot! 🌅`);
            return;
          }
          
          // Increment user usage for any message that will consume tokens
          await rateLimitManager.incrementUserUsage(userId);
        }
        
        // Show typing animation immediately and keep it alive during processing
        ctx.telegram.sendChatAction(chatId, 'typing').catch(() => {});
        const keepTyping = setInterval(() => {
          ctx.telegram.sendChatAction(chatId, 'typing').catch(() => {});
        }, 5000); // Refresh typing animation every 5 seconds (optimized)
        
        try {
          // Process the translation
          const result = await translationService.processTranslation(chatId, userInput);
          
          // Clear typing animation
          clearInterval(keepTyping);
          
          // Log only critical events in production
          if (result.type === 'language_setup') {
            logger.info('Languages configured', { chatId, languages: result.languages.map(l => l.code) });
          }
          
          // Send appropriate response based on result type
          if (result.type === 'language_setup') {
            const languages = result.languages.map(lang => `${lang.name} (${lang.code})`).join(', ');
            ctx.reply(`✅ ${result.message}\n\nLanguages set: ${languages}`);
          } else if (result.type === 'translation') {
            // Получаем имя пользователя и эмодзи
            const username = ctx.from.first_name || ctx.from.username || 'Anonymous';
            const userEmoji = await userEmojiService.getUserEmoji(chatId, userId, username);
            
            let response = `${userEmoji} from ${username}\n\n`;
            
            for (const translation of result.translations) {
              // Skip the source language entirely
              if (translation.skipped) {
                continue;
              }
              response += `${translation.language.code}: ${translation.text}\n`;
            }
            
            // Remove the last newline
            response = response.trim();
            
            ctx.reply(response);
          }
        } catch (processingError) {
          // Clear typing animation on error
          clearInterval(keepTyping);
          throw processingError;
        }
      } catch (error) {
        logger.error('Error processing message', { chatId, userId, error: error.message, stack: error.stack });
        
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
  async start(webhookUrl) {
    // Enable graceful stop
    process.once('SIGINT', () => this.bot.stop('SIGINT'));
    process.once('SIGTERM', () => this.bot.stop('SIGTERM'));

    if (webhookUrl) {
      // Configure webhook to the full external URL. Express handles the path.
      try {
        await this.bot.telegram.setWebhook(webhookUrl);
        logger.info(`Telegram bot webhook set to ${webhookUrl}`);
      } catch (err) {
        logger.error('Failed to set Telegram webhook', { error: err.message });
      }
      // Do not call bot.launch with webhook server since Express handles HTTP
    } else {
      // Polling mode
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
    return this.bot.webhookCallback();
  }
}

module.exports = TelegramBot;