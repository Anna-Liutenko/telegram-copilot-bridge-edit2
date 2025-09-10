#!/bin/bash

# Telegram Translation Bot - Production Deployment Script

SERVER_IP="31.97.173.218"
SERVER_USER="root"
STAGING_DIR="/opt/telegram-translation-bot-staging"
PRODUCTION_DIR="/opt/telegram-translation-bot"

echo "🚀 Starting production deployment from staging..."

# Verify staging is working
echo "🔍 Verifying staging environment..."
ssh $SERVER_USER@$SERVER_IP "systemctl is-active telegram-translation-bot-staging" > /dev/null
if [ $? -ne 0 ]; then
    echo "❌ Error: Staging service is not running!"
    echo "Please ensure staging is working before promoting to production."
    exit 1
fi

# Backup production database
echo "💾 Creating production database backup..."
ssh $SERVER_USER@$SERVER_IP << 'EOF'
mkdir -p /opt/backups/production
if [ -f /opt/telegram-translation-bot/data/bot.db ]; then
    cp /opt/telegram-translation-bot/data/bot.db /opt/backups/production/bot.db.$(date +%Y%m%d_%H%M%S)
    echo "✅ Database backup created"
else
    echo "ℹ️  No existing database to backup"
fi
EOF

echo "🔄 Promoting staging to production..."

ssh $SERVER_USER@$SERVER_IP << 'EOF'
# Stop production service
systemctl stop telegram-translation-bot

# Backup current production code
if [ -d /opt/telegram-translation-bot ]; then
    mv /opt/telegram-translation-bot /opt/telegram-translation-bot.backup.$(date +%Y%m%d_%H%M%S)
fi

# Copy staging to production (excluding data directory to preserve database)
cp -r /opt/telegram-translation-bot-staging /opt/telegram-translation-bot

# Preserve production database if it exists
BACKUP_DIR=$(ls -1d /opt/telegram-translation-bot.backup.* 2>/dev/null | head -1)
if [ -n "$BACKUP_DIR" ] && [ -d "$BACKUP_DIR/data" ]; then
    echo "📊 Preserving production database..."
    rm -rf /opt/telegram-translation-bot/data
    cp -r "$BACKUP_DIR/data" /opt/telegram-translation-bot/
    echo "✅ Production database preserved"
else
    echo "ℹ️  No existing production database found, using fresh database"
fi

# Copy production .env (preserve production settings)
BACKUP_DIR=$(ls -1d /opt/telegram-translation-bot.backup.* 2>/dev/null | head -1)
if [ -n "$BACKUP_DIR" ] && [ -f "$BACKUP_DIR/.env" ]; then
    cp "$BACKUP_DIR/.env" /opt/telegram-translation-bot/
    echo "✅ Production .env file restored from $BACKUP_DIR"
else
    echo "⚠️  Warning: No production .env found, using staging .env"
fi

# Update systemd service
cp /opt/telegram-translation-bot/telegram-translation-bot.service /etc/systemd/system/
systemctl daemon-reload

# Ensure production port in .env
sed -i 's/PORT=3001/PORT=3000/g' /opt/telegram-translation-bot/.env
sed -i 's|staging/telegram/webhook|telegram/webhook|g' /opt/telegram-translation-bot/.env

# Set permissions
chmod 600 /opt/telegram-translation-bot/.env
chown -R root:root /opt/telegram-translation-bot

# Start production service
systemctl start telegram-translation-bot

# Check status
sleep 5
systemctl status telegram-translation-bot --no-pager
EOF

if [ $? -eq 0 ]; then
    echo "✅ Production deployment completed successfully!"
    echo "🔍 Production bot is running on port 3000"
    echo "📝 Check logs: ssh $SERVER_USER@$SERVER_IP 'journalctl -u telegram-translation-bot -f'"
    echo "🗑️  Clean up: You can remove staging after verifying production works"
else
    echo "❌ Production deployment failed!"
    echo "🔄 You may need to restore from backup"
    exit 1
fi