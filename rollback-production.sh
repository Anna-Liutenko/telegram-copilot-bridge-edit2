#!/bin/bash

# Telegram Translation Bot - Production Rollback Script

SERVER_IP="31.97.173.218"
SERVER_USER="root"
PRODUCTION_DIR="/opt/telegram-translation-bot"

echo "🔄 Rolling back production to previous version..."

# List available backups
echo "📋 Available backups:"
ssh $SERVER_USER@$SERVER_IP "ls -la /opt/ | grep 'telegram-translation-bot\.backup\.' | tail -5"

# Get the latest backup
LATEST_BACKUP=$(ssh $SERVER_USER@$SERVER_IP "ls -1 /opt/ | grep 'telegram-translation-bot\.backup\.' | sort | tail -1")

if [ -z "$LATEST_BACKUP" ]; then
    echo "❌ Error: No backup found!"
    echo "Available directories:"
    ssh $SERVER_USER@$SERVER_IP "ls -la /opt/ | grep telegram"
    exit 1
fi

echo "🔍 Latest backup found: $LATEST_BACKUP"
read -p "Do you want to rollback to $LATEST_BACKUP? (y/n): " confirm

if [[ $confirm != [yY] && $confirm != [yY][eE][sS] ]]; then
    echo "❌ Rollback cancelled"
    exit 0
fi

echo "🔄 Rolling back production..."

ssh $SERVER_USER@$SERVER_IP << EOF
# Stop current production service
systemctl stop telegram-translation-bot

# Preserve current database before rollback
CURRENT_DB_BACKUP=""
if [ -d $PRODUCTION_DIR/data ]; then
    CURRENT_DB_BACKUP="/opt/current-db-backup.\$(date +%Y%m%d_%H%M%S)"
    cp -r $PRODUCTION_DIR/data "\$CURRENT_DB_BACKUP"
    echo "📊 Current database backed up to \$CURRENT_DB_BACKUP"
fi

# Backup current version (in case rollback fails)
if [ -d $PRODUCTION_DIR ]; then
    mv $PRODUCTION_DIR ${PRODUCTION_DIR}.rollback-backup.\$(date +%Y%m%d_%H%M%S)
fi

# Restore from backup
cp -r /opt/$LATEST_BACKUP $PRODUCTION_DIR

# Restore current database (preserve user data)
if [ -n "\$CURRENT_DB_BACKUP" ] && [ -d "\$CURRENT_DB_BACKUP" ]; then
    rm -rf $PRODUCTION_DIR/data
    cp -r "\$CURRENT_DB_BACKUP" $PRODUCTION_DIR/data
    echo "✅ Database preserved during rollback"
fi

# Update systemd service
cp $PRODUCTION_DIR/telegram-translation-bot.service /etc/systemd/system/
systemctl daemon-reload

# Set permissions
chmod 600 $PRODUCTION_DIR/.env
chown -R root:root $PRODUCTION_DIR

# Start production service
systemctl start telegram-translation-bot

# Check status
sleep 5
systemctl status telegram-translation-bot --no-pager
EOF

if [ $? -eq 0 ]; then
    echo "✅ Rollback completed successfully!"
    echo "🔍 Production bot is running from backup: $LATEST_BACKUP"
    echo "📝 Check logs: ssh $SERVER_USER@$SERVER_IP 'journalctl -u telegram-translation-bot -f'"
else
    echo "❌ Rollback failed!"
    echo "🆘 Manual intervention may be required"
    exit 1
fi