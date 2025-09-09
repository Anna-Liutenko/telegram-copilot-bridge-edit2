module.exports = {
  // Server configuration
  port: process.env.PORT || 3000,
  
  // Telegram configuration
  telegramToken: process.env.TELEGRAM_BOT_TOKEN,
  
  // OpenAI configuration
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini', // Using GPT-4o-mini for better stability
  },
  
  // Supported languages (based on user preferences)
  supportedLanguages: ['EN', 'RU', 'KO'],
  
  // Session configuration
  session: {
    expiryTime: process.env.SESSION_EXPIRY_TIME || 24 * 60 * 60 * 1000, // 24 hours
  },
  
  // Retry configuration for LLM calls
  retry: {
    maxRetries: process.env.MAX_RETRIES || 3,
    baseDelay: process.env.BASE_DELAY || 1000, // 1 second
  },
  
  // Webhook configuration
  webhook: {
    url: process.env.WEBHOOK_URL,
    port: process.env.WEBHOOK_PORT
  },
  
  // Authentication configuration
  auth: {
    codeWord: process.env.CODE_WORD || 'translate',
    enabled: process.env.AUTH_ENABLED !== 'false' // Default to true
  },
  
  // Rate limiting configuration
  rateLimit: {
    enabled: process.env.RATE_LIMIT_ENABLED !== 'false', // Default to true
    dailyMessageLimit: parseInt(process.env.DAILY_MESSAGE_LIMIT) || 50, // 50 messages per day per user
    resetHour: parseInt(process.env.RATE_LIMIT_RESET_HOUR) || 0 // Reset at midnight UTC
  }
};