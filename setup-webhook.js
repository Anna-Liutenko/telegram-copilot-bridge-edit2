const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Get bot token and webhook URL from environment variables
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEBHOOK_URL = process.env.WEBHOOK_URL; // full URL like https://domain/telegram/webhook

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
    console.log(`Setting webhook to: ${WEBHOOK_URL}`);
    const fetchRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: WEBHOOK_URL })
    });
    const data = await fetchRes.json();
    if (data.ok) {
      console.log('✅ Webhook setup successful!');
      console.log('Webhook info:', data);
    } else {
      console.error('❌ Webhook setup failed:', data);
    }
  } catch (error) {
    console.error('❌ Error setting up webhook:', error.message);
  }
}

async function getWebhookInfo() {
  try {
    const fetchRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`);
    const data = await fetchRes.json();
    if (data.ok) {
      console.log('Current webhook info:');
      console.log(JSON.stringify(data.result, null, 2));
    } else {
      console.error('Error getting webhook info:', data);
    }
  } catch (error) {
    console.error('Error getting webhook info:', error.message);
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