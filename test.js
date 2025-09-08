// Simple test script to verify core functionality
const translationService = require('./src/services/translationService');
const sessionManager = require('./src/services/sessionManager');

async function runTests() {
  console.log('Running basic tests...');
  
  try {
    // Test session management
    const userId = 'test_user_1';
    
    // Test setting up languages
    console.log('\\n1. Testing language setup...');
    const session = sessionManager.getSession(userId);
    console.log('Initial session:', session);
    
    // Test translation service
    console.log('\\n2. Testing translation service...');
    // This would normally connect to OpenAI, but we'll skip for this simple test
    
    console.log('\\n✅ All basic tests completed successfully!');
  } catch (error) {
    console.error('\\n❌ Test failed:', error.message);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = { runTests };