/**
 * Utility functions for testing
 */

/**
 * Mock Telegram context for testing
 */
function createMockContext() {
  return {
    from: {
      id: 'test_user_id',
      first_name: 'Test',
      last_name: 'User',
      username: 'testuser'
    },
    message: {
      text: 'Hello, how are you?'
    },
    reply: (text) => {
      console.log('Bot reply:', text);
      return Promise.resolve();
    }
  };
}

/**
 * Mock session manager for testing
 */
function createMockSessionManager() {
  const sessions = new Map();
  
  return {
    getSession: (userId) => {
      return sessions.get(userId) || { selectedLanguages: [] };
    },
    setSession: (userId, sessionData) => {
      sessions.set(userId, sessionData);
    },
    clearSession: (userId) => {
      sessions.delete(userId);
    }
  };
}

module.exports = {
  createMockContext,
  createMockSessionManager
};