const axios = require('axios');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Get bot token and webhook URL from environment variables
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEBHOOK_URL = process.env.WEBHOOK_URL;

if (!BOT_TOKEN) {
  console.error('Error: TELEGRAM_BOT_TOKEN is not set in environment variables');
  process.exit(1);
}

if (!WEBHOOK_URL) {
  console.error('Error: WEBHOOK_URL is not set in environment variables');
  console.log('Please set WEBHOOK_URL in your .env file to enable webhook mode');
  process.exit(1);
}

async function setupWebhook() {
  try {
    const webhookEndpoint = `${WEBHOOK_URL}/telegram/webhook`;
    console.log(`Setting webhook to: ${webhookEndpoint}`);
    
    const response = await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
      url: webhookEndpoint
    });
    
    if (response.data.ok) {
      console.log('✅ Webhook setup successful!');
      console.log('Webhook info:', response.data);
    } else {
      console.error('❌ Webhook setup failed:', response.data);
    }
  } catch (error) {
    console.error('❌ Error setting up webhook:', error.response?.data || error.message);
  }
}

async function getWebhookInfo() {
  try {
    const response = await axios.get(`https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`);
    
    if (response.data.ok) {
      console.log('Current webhook info:');
      console.log(JSON.stringify(response.data.result, null, 2));
    } else {
      console.error('Error getting webhook info:', response.data);
    }
  } catch (error) {
    console.error('Error getting webhook info:', error.response?.data || error.message);
  }
}

async function main() {
  console.log('Telegram Bot Webhook Setup\n');
  
  // Show current webhook info
  await getWebhookInfo();
  
  console.log('\n--- Setting up webhook ---');
  await setupWebhook();
  
  console.log('\n--- Verifying webhook ---');
  await getWebhookInfo();
}

// Run the setup
main();