const llmClient = require('./llmClient');
const sessionManager = require('./sessionManager');
const { LanguagesArraySchema } = require('../utils/validation');
const { LanguageSetupError, LanguageDetectionError, TranslationError } = require('../utils/errors');
const logger = require('../utils/logger');

class TranslationService {
  /**
   * Process user input to set up languages
   * @param {string} userId - The user's ID
   * @param {string} userInput - The user's natural language request for languages
   * @returns {Promise<object>} - The processed languages
   */
  async setupLanguages(userId, userInput) {
    // Create the prompt for language processing
    const prompt = `
You are a language extraction assistant. Your task is to identify the languages a user wants to use and return them in a structured JSON format.

Instructions:
1. Extract all languages mentioned by the user
2. For each language, provide:
   - "code": Two-letter ISO 639-1 code in uppercase
   - "name": Full English language name with capital first letter
3. Return ONLY a JSON array of language objects
4. Do not include any other text or explanations

Examples:
User: "I want to use Russian, English, and maybe Japanese"
Response: [{"code": "RU", "name": "Russian"}, {"code": "EN", "name": "English"}, {"code": "JA", "name": "Japanese"}]

User: "I need Spanish and French"
Response: [{"code": "ES", "name": "Spanish"}, {"code": "FR", "name": "French"}]

User: "${userInput}"
Response:`;

    try {
      // Call LLM with JSON response format
      const response = await llmClient.callLLM(prompt, { jsonResponse: true });
      
      // Validate the response
      const languages = LanguagesArraySchema.parse(response);
      
      // Save to session
      const session = sessionManager.getSession(userId);
      session.selectedLanguages = languages;
      sessionManager.setSession(userId, session);
      logger.info(`Languages set up for user ${userId}`, { languages });
      
      return languages;
    } catch (error) {
      throw new LanguageSetupError(`Failed to setup languages: ${error.message}`);
    }
  }

  /**
   * Detect the source language of text
   * @param {string} text - The text to analyze
   * @returns {Promise<string>} - The detected language code
   */
  async detectSourceLanguage(text) {
    // Create the prompt for language detection
    const prompt = `
You are a language detection assistant. Your task is to identify the language of the provided text.

Instructions:
1. Identify the language of the text provided by the user
2. Respond ONLY with the two-letter ISO 639-1 language code in uppercase
3. Do not include any other text or explanations

Examples:
Text: "Hello, how are you?"
Response: EN

Text: "Привет, как дела?"
Response: RU

Text: "안녕하세요, 어떻게 지내세요?"
Response: KO

Text: "${text}"
Response:`;

    try {
      // Call LLM
      const response = await llmClient.callLLM(prompt);
      
      // Extract just the language code (in case LLM adds extra text)
      const languageCode = response.substring(0, 2).toUpperCase();
      
      // Validate it's a two-letter code
      if (languageCode.length !== 2 || !/^[A-Z]{2}$/.test(languageCode)) {
        throw new Error('Invalid language code format');
      }
      
      return languageCode;
    } catch (error) {
      throw new LanguageDetectionError(`Failed to detect source language: ${error.message}`);
    }
  }

  /**
   * Translate text to a target language
   * @param {string} text - The text to translate
   * @param {string} targetLanguageCode - The target language code
   * @returns {Promise<string>} - The translated text
   */
  async translateText(text, targetLanguageCode) {
    // Create the prompt for translation
    const prompt = `
You are a professional translator. Your task is to translate the provided text to the specified language.

Instructions:
1. Translate the text to the language with code: ${targetLanguageCode}
2. Output ONLY the translated text
3. Do not add the language code prefix or any other explanations
4. Preserve the original meaning and tone as closely as possible

Text to translate: "${text}"
Translated text:`;

    try {
      // Call LLM
      const response = await llmClient.callLLM(prompt);
      return response;
    } catch (error) {
      throw new TranslationError(`Failed to translate text: ${error.message}`);
    }
  }

  /**
   * Process a translation request through the full pipeline
   * @param {string} userId - The user's ID
   * @param {string} userInput - The user's input
   * @returns {Promise<object>} - The translation results
   */
  async processTranslation(userId, userInput) {
    try {
      logger.info(`Processing translation for user ${userId}`);
      // Get user's session
      const session = sessionManager.getSession(userId);
      
      // If no languages are set up, treat input as language setup
      if (!session.selectedLanguages || session.selectedLanguages.length === 0) {
        logger.info(`Setting up languages for user ${userId}`);
        const languages = await this.setupLanguages(userId, userInput);
        return {
          type: 'language_setup',
          message: 'Languages have been set up successfully!',
          languages: languages
        };
      }
      
      // Detect source language
      logger.info(`Detecting source language for user ${userId}`);
      const sourceLanguage = await this.detectSourceLanguage(userInput);
      
      // Translate to each selected language
      logger.info(`Translating text for user ${userId} to ${session.selectedLanguages.length} languages`);
      const translations = [];
      for (const language of session.selectedLanguages) {
        // Skip if source and target are the same
        if (language.code === sourceLanguage) {
          translations.push({
            language: language,
            text: userInput,
            skipped: true
          });
          continue;
        }
        
        // Translate the text
        const translatedText = await this.translateText(userInput, language.code);
        translations.push({
          language: language,
          text: translatedText,
          skipped: false
        });
      }
      
      return {
        type: 'translation',
        sourceLanguage: sourceLanguage,
        translations: translations
      };
    } catch (error) {
      throw new TranslationError(`Failed to process translation: ${error.message}`);
    }
  }
}

module.exports = new TranslationService();