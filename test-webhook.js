const axios = require('axios');
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
    const response = await axios.get(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`);
    console.log('Bot Info:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error getting bot info:', error.response?.data || error.message);
  }
}

async function getWebhookInfo() {
  try {
    const response = await axios.get(`https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`);
    console.log('Webhook Info:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error getting webhook info:', error.response?.data || error.message);
  }
}

async function setWebhook() {
  try {
    const url = `${WEBHOOK_URL}/telegram/webhook`;
    const response = await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
      url: url
    });
    console.log('Set Webhook Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error setting webhook:', error.response?.data || error.message);
  }
}

async function deleteWebhook() {
  try {
    const response = await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/deleteWebhook`);
    console.log('Delete Webhook Response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error deleting webhook:', error.response?.data || error.message);
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