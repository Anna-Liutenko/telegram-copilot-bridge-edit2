const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Get bot token from environment variables
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'https://yourdomain.com';

if (!BOT_TOKEN) {
  console.error('TELEGRAM_BOT_TOKEN is not set in environment variables');
  process.exit(1);
}

// Test functions
async function getBotInfo() {
  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`);
    const data = await res.json();
    console.log('Bot Info:', data);
    return data;
  } catch (error) {
    console.error('Error getting bot info:', error.message);
  }
}

async function getWebhookInfo() {
  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`);
    const data = await res.json();
    console.log('Webhook Info:', data);
    return data;
  } catch (error) {
    console.error('Error getting webhook info:', error.message);
  }
}

async function setWebhook() {
  try {
    const url = `${WEBHOOK_URL}/telegram/webhook`;
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    const data = await res.json();
    console.log('Set Webhook Response:', data);
    return data;
  } catch (error) {
    console.error('Error setting webhook:', error.message);
  }
}

async function deleteWebhook() {
  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/deleteWebhook`, { method: 'POST' });
    const data = await res.json();
    console.log('Delete Webhook Response:', data);
    return data;
  } catch (error) {
    console.error('Error deleting webhook:', error.message);
  }
}

// Main function
async function main() {
  console.log('Testing Telegram Bot Webhook Implementation\n');
  
  // Get bot info
  await getBotInfo();
  
  console.log('\n--- Current Webhook Info ---');
  await getWebhookInfo();
  
  console.log('\n--- Setting Webhook ---');
  await setWebhook();
  
  console.log('\n--- Updated Webhook Info ---');
  await getWebhookInfo();
}

// Run the test
main();