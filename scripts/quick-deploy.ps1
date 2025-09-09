param(
  [string]$ServerHost = "31.97.173.218",
  [string]$User = "root",
  [string]$RemotePath = "/opt/telegram-translation-bot"
)

Write-Host ("Syncing source to {0}@{1}:{2}" -f $User, $ServerHost, $RemotePath)
scp -r src setup-webhook.js package.json ("{0}@{1}:{2}" -f $User, $ServerHost, $RemotePath)

Write-Host "Installing deps on server (if needed) and restarting service"
ssh ("{0}@{1}" -f $User, $ServerHost) ("cd {0} ; npm install --omit=dev --prefer-online --no-audit --no-fund ; systemctl restart telegram-translation-bot ; sleep 1 ; systemctl status telegram-translation-bot --no-pager -l | sed -n '1,60p'" -f $RemotePath)
