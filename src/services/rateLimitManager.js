const config = require('../config/config');
const logger = require('../utils/logger');

class RateLimitManager {
  constructor() {
    // In-memory storage for user message counts
    this.userUsage = new Map(); // userId -> { count: number, resetTime: Date }
    logger.info('Rate limit manager initialized');
  }

  /**
   * Check if user has exceeded daily message limit
   * @param {string} userId - The user's ID
   * @returns {boolean} - True if user has exceeded limit
   */
  isUserLimitExceeded(userId) {
    if (!config.rateLimit.enabled) {
      return false;
    }

    const usage = this.getUserUsage(userId);
    return usage.count >= config.rateLimit.dailyMessageLimit;
  }

  /**
   * Get user's current usage for today
   * @param {string} userId - The user's ID
   * @returns {object} - Usage object with count and resetTime
   */
  getUserUsage(userId) {
    const now = new Date();
    const resetTime = this.getNextResetTime(now);
    
    let usage = this.userUsage.get(userId);
    
    // If no usage record exists or it's past reset time, create/reset
    if (!usage || now >= usage.resetTime) {
      usage = {
        count: 0,
        resetTime: resetTime
      };
      this.userUsage.set(userId, usage);
    }
    
    return usage;
  }

  /**
   * Increment user's message count
   * @param {string} userId - The user's ID
   * @returns {object} - Updated usage object
   */
  incrementUserUsage(userId) {
    const usage = this.getUserUsage(userId);
    usage.count += 1;
    this.userUsage.set(userId, usage);
    
    // Only log when user approaches limit (90% or higher)
    if (usage.count >= config.rateLimit.dailyMessageLimit * 0.9) {
      logger.info(`User ${userId} approaching limit: ${usage.count}/${config.rateLimit.dailyMessageLimit}`);
    }
    return usage;
  }

  /**
   * Get next reset time based on configured reset hour
   * @param {Date} now - Current date/time
   * @returns {Date} - Next reset time
   */
  getNextResetTime(now) {
    const resetTime = new Date(now);
    resetTime.setUTCHours(config.rateLimit.resetHour, 0, 0, 0);
    
    // If reset time has already passed today, set for tomorrow
    if (resetTime <= now) {
      resetTime.setUTCDate(resetTime.getUTCDate() + 1);
    }
    
    return resetTime;
  }

  /**
   * Get remaining messages for user
   * @param {string} userId - The user's ID
   * @returns {number} - Number of remaining messages
   */
  getRemainingMessages(userId) {
    const usage = this.getUserUsage(userId);
    return Math.max(0, config.rateLimit.dailyMessageLimit - usage.count);
  }

  /**
   * Get time until reset for user
   * @param {string} userId - The user's ID
   * @returns {string} - Human readable time until reset
   */
  getTimeUntilReset(userId) {
    const usage = this.getUserUsage(userId);
    const now = new Date();
    const timeDiff = usage.resetTime.getTime() - now.getTime();
    
    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }

  /**
   * Clean up expired usage records (maintenance)
   */
  cleanupExpiredRecords() {
    const now = new Date();
    let cleaned = 0;
    
    for (const [userId, usage] of this.userUsage.entries()) {
      if (now >= usage.resetTime) {
        this.userUsage.delete(userId);
        cleaned++;
      }
    }
    
    // Maintenance completed silently
  }

  /**
   * Get current statistics
   * @returns {object} - Statistics object
   */
  getStatistics() {
    return {
      totalUsers: this.userUsage.size,
      dailyLimit: config.rateLimit.dailyMessageLimit,
      enabled: config.rateLimit.enabled
    };
  }
}

module.exports = new RateLimitManager();