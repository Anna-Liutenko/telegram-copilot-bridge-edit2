const { Telegraf } = require('telegraf');
const express = require('express');

// Use environment variables directly from process.env (set by systemd)
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const PORT = process.env.PORT || 3000;

console.log('BOT_TOKEN exists:', !!BOT_TOKEN);
console.log('BOT_TOKEN length:', BOT_TOKEN ? BOT_TOKEN.length : 0);

if (!BOT_TOKEN) {
  console.error('No TELEGRAM_BOT_TOKEN found in environment');
  process.exit(1);
}

const app = express();
app.use(express.json());

const bot = new Telegraf(BOT_TOKEN);

// Simple handlers
bot.start((ctx) => {
  console.log('START command received from user:', ctx.from.id);
  ctx.reply('Hello! This is a debug bot. Type anything to test.');
});

bot.on('text', (ctx) => {
  console.log('Text message received:', ctx.message.text);
  ctx.reply(`Echo: ${ctx.message.text}`);
});

bot.catch((err, ctx) => {
  console.error('Bot error:', err);
});

// Health endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', bot_token_length: BOT_TOKEN.length });
});

// Webhook endpoint
app.use('/telegram/webhook', bot.webhookCallback());

// Start server
app.listen(PORT, () => {
  console.log(`Debug bot server running on port ${PORT}`);
  console.log('Setting webhook...');
  
  bot.telegram.setWebhook('https://anna.floripa.br/telegram/webhook')
    .then(() => console.log('Webhook set successfully'))
    .catch(err => console.error('Webhook setup failed:', err));
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down...');
  process.exit(0);
});