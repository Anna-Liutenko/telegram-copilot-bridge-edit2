const logger = require('../utils/logger');

class SessionManager {
  constructor() {
    // In-memory storage for sessions
    this.sessions = new Map();
    logger.info('Session manager initialized');
  }

  /**
   * Get a chat's session data
   * @param {string} chatId - The chat's ID
   * @returns {object} - The chat's session data
   */
  getSession(chatId) {
    const session = this.sessions.get(chatId);
    
    // If session exists and is not expired, return it
    if (session && !this.isSessionExpired(session)) {
      // Update last active time
      session.lastActive = new Date();
      return session;
    }
    
    // Return default session data if no valid session exists
    return {
      chatId: chatId,
      selectedLanguages: [],
      lastActive: new Date(),
      authenticated: false // Add authentication status
    };
  }

  /**
   * Set a chat's session data
   * @param {string} chatId - The chat's ID
   * @param {object} sessionData - The session data to store
   */
  setSession(chatId, sessionData) {
    this.sessions.set(chatId, {
      ...sessionData,
      chatId: chatId,
      lastActive: new Date()
    });
    // Session updated
  }

  /**
   * Clear a chat's session
   * @param {string} chatId - The chat's ID
   */
  clearSession(chatId) {
    this.sessions.delete(chatId);
    // Session cleared
  }

  /**
   * Check if a session has expired
   * @param {object} session - The session to check
   * @returns {boolean} - Whether the session has expired
   */
  isSessionExpired(session) {
    const now = new Date();
    const expiryTime = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    return (now - new Date(session.lastActive)) > expiryTime;
  }

  /**
   * Get all active sessions
   * @returns {Map} - All active sessions
   */
  getActiveSessions() {
    const now = new Date();
    const expiryTime = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    
    // Filter out expired sessions
    for (const [chatId, session] of this.sessions) {
      if ((now - new Date(session.lastActive)) > expiryTime) {
        this.sessions.delete(chatId);
      }
    }
    
    return this.sessions;
  }

  /**
   * Get the number of active sessions
   * @returns {number} - The number of active sessions
   */
  getActiveSessionCount() {
    return this.getActiveSessions().size;
  }

  /**
   * Authenticate a chat session
   * @param {string} chatId - The chat's ID
   */
  authenticateSession(chatId) {
    const session = this.getSession(chatId);
    session.authenticated = true;
    this.setSession(chatId, session);
    // Session authenticated
  }

  /**
   * Clear all sessions (for fresh start)
   */
  clearAllSessions() {
    this.sessions.clear();
    // All sessions cleared
  }
}

module.exports = new SessionManager();