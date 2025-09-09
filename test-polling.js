const { Telegraf } = require('telegraf');

// Use the token directly
const BOT_TOKEN = '8474377445:AAEifXw5TmkDQw6pvFE09NnsbWw6XCDgp-k';

console.log('Starting polling test...');

const bot = new Telegraf(BOT_TOKEN);

// Simple handlers
bot.start((ctx) => {
  console.log('START command received from user:', ctx.from.id);
  ctx.reply('Hello from polling bot!');
});

bot.on('text', (ctx) => {
  console.log('Text message received:', ctx.message.text);
  ctx.reply(`Echo: ${ctx.message.text}`);
});

bot.catch((err, ctx) => {
  console.error('Bot error:', err);
});

// Start in polling mode
bot.launch()
  .then(() => console.log('Bot launched in polling mode'))
  .catch(err => console.error('Launch failed:', err));

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down...');
  bot.stop();
  process.exit(0);
});