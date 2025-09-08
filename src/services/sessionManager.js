const logger = require('../utils/logger');

class SessionManager {
  constructor() {
    // In-memory storage for sessions
    this.sessions = new Map();
    logger.info('Session manager initialized');
  }

  /**
   * Get a user's session data
   * @param {string} userId - The user's ID
   * @returns {object} - The user's session data
   */
  getSession(userId) {
    const session = this.sessions.get(userId);
    
    // If session exists and is not expired, return it
    if (session && !this.isSessionExpired(session)) {
      // Update last active time
      session.lastActive = new Date();
      return session;
    }
    
    // Return default session data if no valid session exists
    return {
      userId: userId,
      selectedLanguages: [],
      lastActive: new Date()
    };
  }

  /**
   * Set a user's session data
   * @param {string} userId - The user's ID
   * @param {object} sessionData - The session data to store
   */
  setSession(userId, sessionData) {
    this.sessions.set(userId, {
      ...sessionData,
      userId: userId,
      lastActive: new Date()
    });
    logger.info(`Session set for user ${userId}`);
  }

  /**
   * Clear a user's session
   * @param {string} userId - The user's ID
   */
  clearSession(userId) {
    this.sessions.delete(userId);
    logger.info(`Session cleared for user ${userId}`);
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
    for (const [userId, session] of this.sessions) {
      if ((now - new Date(session.lastActive)) > expiryTime) {
        this.sessions.delete(userId);
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
}

module.exports = new SessionManager();