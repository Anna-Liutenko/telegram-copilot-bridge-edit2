const llmClient = require('./llmClient');
const sessionManager = require('./sessionManager');
const { LanguagesArraySchema } = require('../utils/validation');
const { LanguageSetupError, LanguageDetectionError, TranslationError } = require('../utils/errors');
const logger = require('../utils/logger');

class TranslationService {
  /**
   * Process user input to set up languages
   * @param {string} chatId - The chat's ID
   * @param {string} userInput - The user's natural language request for languages
   * @returns {Promise<object>} - The processed languages
   */
  async setupLanguages(chatId, userInput) {
    // Create the prompt for language processing
    const prompt = `
You are a language extraction assistant. Your task is to identify ALL languages a user wants to use and return them as a JSON array.

CRITICAL REQUIREMENTS:
1. Extract ALL languages mentioned by the user (not just one)
2. Always return a JSON array, even for one language
3. Each language object must have: {"code": "XX", "name": "Language"}
4. Use two-letter ISO 639-1 codes in uppercase
5. Return ONLY the JSON array, no other text

Examples:
User: "English, Russian, Serbian"
Response: [{"code": "EN", "name": "English"}, {"code": "RU", "name": "Russian"}, {"code": "SR", "name": "Serbian"}]

User: "I want to use Russian, English, and Japanese"
Response: [{"code": "RU", "name": "Russian"}, {"code": "EN", "name": "English"}, {"code": "JA", "name": "Japanese"}]

User: "Spanish and French"
Response: [{"code": "ES", "name": "Spanish"}, {"code": "FR", "name": "French"}]

User input: "${userInput}"
JSON array:`;

    try {
      // Call LLM with text response and parse manually (JSON mode seems problematic with gpt-4o-mini)
      const response = await llmClient.callLLM(prompt, { 
        jsonResponse: false, 
        temperature: 0,
        maxRetries: 2 
      });
      
      // Remove debug logging in production
      
      // Parse JSON from text response
      let languagesData;
      try {
        // Try to extract JSON array from text response
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          languagesData = JSON.parse(jsonMatch[0]);
        } else {
          // Fallback: try to parse the entire response
          languagesData = JSON.parse(response);
        }
      } catch (parseError) {
        logger.error('Failed to parse JSON from OpenAI response', { response, parseError: parseError.message });
        throw new Error('Invalid JSON response from OpenAI');
      }
      
      // Handle potential response wrapping - sometimes OpenAI returns { languages: [...] } instead of [...]
      if (languagesData && typeof languagesData === 'object' && !Array.isArray(languagesData)) {
        // Check if response has common wrapper keys
        if (languagesData.languages) {
          languagesData = languagesData.languages;
        } else if (languagesData.result) {
          languagesData = languagesData.result;
        } else if (languagesData.data) {
          languagesData = languagesData.data;
        } else if (languagesData.response) {
          languagesData = languagesData.response;
        } else if (languagesData.code && languagesData.name) {
          // Single language object returned instead of array - wrap it in array
          languagesData = [languagesData];
        }
      }
      
      // Validate the response
      const languages = LanguagesArraySchema.parse(languagesData);
      
      // Validate number of languages (2-3)
      if (languages.length < 2 || languages.length > 3) {
        throw new LanguageSetupError(`Please select exactly 2-3 languages for translation. You selected ${languages.length} languages.`);
      }
      
      // Save to session
      const session = sessionManager.getSession(chatId);
      session.selectedLanguages = languages;
      sessionManager.setSession(chatId, session);
      // Languages configured - no logging needed in production
      
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
   * @param {string} chatId - The chat's ID
   * @param {string} userInput - The user's input
   * @returns {Promise<object>} - The translation results
   */
  async processTranslation(chatId, userInput) {
    try {
      // Processing translation
      // Get chat's session
      const session = sessionManager.getSession(chatId);
      
      // If no languages are set up, treat input as language setup
      if (!session.selectedLanguages || session.selectedLanguages.length === 0) {
        // Setting up languages
        const languages = await this.setupLanguages(chatId, userInput);
        return {
          type: 'language_setup',
          message: 'Languages have been set up successfully!',
          languages: languages
        };
      }
      
      // Detect source language
      // Detecting source language
      const sourceLanguage = await this.detectSourceLanguage(userInput);
      
      // Translate to each selected language
      // Translating text
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