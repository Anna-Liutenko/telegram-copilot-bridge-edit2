const { z } = require('zod');

// Language schema
const LanguageSchema = z.object({
  code: z.string().length(2).toUpperCase(),
  name: z.string()
});

// Array of languages schema
const LanguagesArraySchema = z.array(LanguageSchema);

// Session schema
const SessionSchema = z.object({
  userId: z.string(),
  selectedLanguages: LanguagesArraySchema,
  lastActive: z.date()
});

module.exports = {
  LanguageSchema,
  LanguagesArraySchema,
  SessionSchema
};