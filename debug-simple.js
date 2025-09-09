const { Telegraf } = require('telegraf');

const BOT_TOKEN = '8474377445:AAEifXw5TmkDQw6pvFE09NnsbWw6XCDgp-k';

console.log('Bot token length:', BOT_TOKEN.length);

const bot = new Telegraf(BOT_TOKEN);

bot.start((ctx) => {
  console.log('START received from:', ctx.from.username);
  ctx.reply('Hello! Debug bot is working!');
});

bot.on('text', (ctx) => {
  console.log('Text received:', ctx.message.text);
  ctx.reply(`You said: ${ctx.message.text}`);
});

console.log('Starting bot...');

bot.launch({
  dropPendingUpdates: true
}).then(() => {
  console.log('Bot launched successfully');
}).catch(err => {
  console.error('Launch failed:', err);
});

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));