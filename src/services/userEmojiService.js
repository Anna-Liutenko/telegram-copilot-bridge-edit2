const sessionManager = require('./sessionManager');

class UserEmojiService {
  constructor() {
    // Нейтральные эмодзи для присвоения пользователям
    this.availableEmojis = [
      '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '🟤', '⚫', '⚪',
      '🔸', '🔹', '🔶', '🔷', '🔺', '🔻', '⭐', '🌟', '✨',
      '🔥', '⚡', '🌈', '🎯', '🎪', '🎨', '🎵', '🎶', '🎤',
      '🍀', '🌺', '🌸', '🌼', '🌻', '🌷', '🌹', '🏆', '🎖️',
      '💎', '⭕', '❌', '✅', '🔔', '💫', '🔮', '🎭', '🎬',
      '📍', '🎲', '🎯', '🔑', '🗝️', '💰', '🔰', '⚽', '🏀',
      '🚀', '✈️', '🎈', '🎊', '🎁', '🎀', '🏅', '🎃', '🎂'
    ];
  }

  /**
   * Получить эмодзи для пользователя в конкретном чате
   * @param {string} chatId - ID чата
   * @param {string} userId - ID пользователя
   * @param {string} username - Имя пользователя (для логирования)
   * @returns {Promise<string>} - Эмодзи пользователя
   */
  async getUserEmoji(chatId, userId, username) {
    try {
      const session = await sessionManager.getSession(chatId);
      
      // Инициализируем объект для хранения эмодзи пользователей, если его нет
      if (!session.userEmojis) {
        session.userEmojis = {};
      }

      // Если у пользователя уже есть эмодзи в этом чате, возвращаем его
      if (session.userEmojis[userId]) {
        return session.userEmojis[userId];
      }

      // Получаем список уже используемых эмодзи в этом чате
      const usedEmojis = Object.values(session.userEmojis);
      
      // Находим первое свободное эмодзи
      let assignedEmoji = null;
      for (const emoji of this.availableEmojis) {
        if (!usedEmojis.includes(emoji)) {
          assignedEmoji = emoji;
          break;
        }
      }

      // Если все эмодзи заняты, используем случайное (маловероятно для обычных чатов)
      if (!assignedEmoji) {
        const randomIndex = Math.floor(Math.random() * this.availableEmojis.length);
        assignedEmoji = this.availableEmojis[randomIndex];
      }

      // Сохраняем эмодзи для пользователя
      session.userEmojis[userId] = assignedEmoji;
      await sessionManager.setSession(chatId, session);

      return assignedEmoji;
    } catch (error) {
      console.error('Error getting user emoji:', error);
      // Возвращаем дефолтное эмодзи в случае ошибки
      return '🔴';
    }
  }

  /**
   * Очистить эмодзи пользователей в чате (для админских команд)
   * @param {string} chatId - ID чата
   */
  async clearChatEmojis(chatId) {
    try {
      const session = await sessionManager.getSession(chatId);
      session.userEmojis = {};
      await sessionManager.setSession(chatId, session);
    } catch (error) {
      console.error('Error clearing chat emojis:', error);
    }
  }

  /**
   * Получить статистику использования эмодзи в чате
   * @param {string} chatId - ID чата
   * @returns {Promise<object>} - Статистика использования эмодзи
   */
  async getChatEmojiStats(chatId) {
    try {
      const session = await sessionManager.getSession(chatId);
      if (!session.userEmojis) {
        return { total: 0, used: 0, available: this.availableEmojis.length };
      }

      const usedCount = Object.keys(session.userEmojis).length;
      return {
        total: this.availableEmojis.length,
        used: usedCount,
        available: this.availableEmojis.length - usedCount
      };
    } catch (error) {
      console.error('Error getting emoji stats:', error);
      return { total: this.availableEmojis.length, used: 0, available: this.availableEmojis.length };
    }
  }
}

module.exports = new UserEmojiService();