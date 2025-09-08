class TranslationBotError extends Error {
  constructor(message, code = 'TRANSLATION_BOT_ERROR', statusCode = 500) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.statusCode = statusCode;
    
    // Captures the stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

class LanguageSetupError extends TranslationBotError {
  constructor(message) {
    super(message, 'LANGUAGE_SETUP_ERROR', 400);
  }
}

class LanguageDetectionError extends TranslationBotError {
  constructor(message) {
    super(message, 'LANGUAGE_DETECTION_ERROR', 400);
  }
}

class TranslationError extends TranslationBotError {
  constructor(message) {
    super(message, 'TRANSLATION_ERROR', 500);
  }
}

class SessionError extends TranslationBotError {
  constructor(message) {
    super(message, 'SESSION_ERROR', 400);
  }
}

class LLMError extends TranslationBotError {
  constructor(message) {
    super(message, 'LLM_ERROR', 500);
  }
}

class ValidationError extends TranslationBotError {
  constructor(message) {
    super(message, 'VALIDATION_ERROR', 400);
  }
}

module.exports = {
  TranslationBotError,
  LanguageSetupError,
  LanguageDetectionError,
  TranslationError,
  SessionError,
  LLMError,
  ValidationError
};