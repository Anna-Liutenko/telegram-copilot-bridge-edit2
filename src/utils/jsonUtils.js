const { repair } = require('jsonrepair');

/**
 * Extract JSON from a string that may contain markdown code blocks
 * @param {string} str - The string to extract JSON from
 * @returns {string|null} - The extracted JSON string or null if not found
 */
function extractJSONFromString(str) {
  // Try to match JSON in markdown code blocks
  const jsonMatch = str.match(/```(?:json)?\s*({.*?})\s*```/s);
  if (jsonMatch) {
    return jsonMatch[1];
  }
  
  // Try to match JSON array in markdown code blocks
  const jsonArrayMatch = str.match(/```(?:json)?\s*(\[.*?\])\s*```/s);
  if (jsonArrayMatch) {
    return jsonArrayMatch[1];
  }
  
  // Try to find JSON object directly
  const objectMatch = str.match(/{.*}/s);
  if (objectMatch) {
    return objectMatch[0];
  }
  
  // Try to find JSON array directly
  const arrayMatch = str.match(/\[.*\]/s);
  if (arrayMatch) {
    return arrayMatch[0];
  }
  
  return null;
}

/**
 * Validate and repair JSON string
 * @param {string} jsonString - The JSON string to validate and repair
 * @returns {object} - The parsed JSON object
 */
function validateAndRepairJSON(jsonString) {
  try {
    // First, try to parse as-is
    return JSON.parse(jsonString);
  } catch (parseError) {
    try {
      // If that fails, try to extract JSON from markdown code blocks
      const extractedJSON = extractJSONFromString(jsonString);
      if (extractedJSON) {
        return JSON.parse(extractedJSON);
      }
      
      // If that fails, try to repair the JSON
      const repaired = repair(jsonString);
      return JSON.parse(repaired);
    } catch (repairError) {
      throw new Error(`Failed to parse or repair JSON: ${parseError.message}, Repair error: ${repairError.message}`);
    }
  }
}

/**
 * Validate JSON against a Zod schema
 * @param {object} data - The data to validate
 * @param {object} schema - The Zod schema to validate against
 * @returns {object} - The validated data
 */
function validateAgainstSchema(data, schema) {
  try {
    return schema.parse(data);
  } catch (validationError) {
    throw new Error(`Schema validation failed: ${validationError.message}`);
  }
}

module.exports = {
  extractJSONFromString,
  validateAndRepairJSON,
  validateAgainstSchema
};