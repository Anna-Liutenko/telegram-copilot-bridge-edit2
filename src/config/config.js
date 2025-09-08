module.exports = {
  // Server configuration
  port: process.env.PORT || 3000,
  
  // Telegram configuration
  telegramToken: process.env.TELEGRAM_BOT_TOKEN,
  
  // OpenAI configuration
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: process.env.OPENAI_MODEL || 'gpt-5-turbo', // Using GPT-5-nano as specified in design
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
  }
};