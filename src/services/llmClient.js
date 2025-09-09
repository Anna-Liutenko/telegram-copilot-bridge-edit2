const OpenAI = require('openai');
const { z } = require('zod');
const config = require('../config/config');
const { LLMError } = require('../utils/errors');
const logger = require('../utils/logger');
const { validateAndRepairJSON } = require('../utils/jsonUtils');

class LLMClient {
  constructor() {
    this.openai = new OpenAI({
      apiKey: config.openai.apiKey,
    });
    this.model = config.openai.model;
    this.maxRetries = config.retry.maxRetries;
    this.baseDelay = config.retry.baseDelay;
  }

  /**
   * Call LLM with retry logic and error handling
   * @param {string} prompt - The prompt to send to the LLM
   * @param {object} options - Additional options for the LLM call
   * @returns {Promise<string>} - The response from the LLM
   */
  async callLLM(prompt, options = {}) {
    const { 
      model = this.model, 
      maxRetries = this.maxRetries, 
      jsonResponse = false,
      temperature = 0.3
    } = options;

    for (let i = 0; i <= maxRetries; i++) {
      try {
        const requestParams = {
          model: model,
          messages: [{ role: 'user', content: prompt }],
          ...(jsonResponse ? { response_format: { type: 'json_object' } } : {})
        };

        // Add temperature parameter
        requestParams.temperature = temperature;

        const response = await this.openai.chat.completions.create(requestParams);

        let content = response.choices[0].message.content.trim();
        
        // If JSON response is expected, validate and repair if necessary
        if (jsonResponse) {
          content = validateAndRepairJSON(content);
        }
        
        return content;
      } catch (error) {
        logger.error(`LLM call failed (attempt ${i + 1}/${maxRetries + 1}):`, { error: error.message });
        
        // If this was the last attempt, throw the error
        if (i === maxRetries) {
          throw new LLMError(`LLM call failed after ${maxRetries + 1} attempts: ${error.message}`);
        }
        
        // Exponential backoff
        const delay = Math.pow(2, i) * this.baseDelay;
        logger.info(`Retrying in ${delay}ms...`);
        await this.sleep(delay);
      }
    }
  }

  /**
   * Sleep for a specified number of milliseconds
   * @param {number} ms - The number of milliseconds to sleep
   * @returns {Promise<void>}
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = new LLMClient();