# Port Conflict Resolution Guide

## Problem
When deploying the Telegram Translation Bot, you may encounter the following error:
```
Error starting userland proxy: listen tcp4 0.0.0.0:3000: bind: address already in use
```

This error occurs when port 3000 is already being used by another process on the server.

## Solutions

### Solution 1: Change Port Mapping in docker-compose.yml

Modify the `docker-compose.yml` file to use a different host port:

```yaml
version: '3.8'

services:
  telegram-bot:
    build: .
    container_name: telegram-translation-bot
    ports:
      - "3001:3000"  # Changed from "3000:3000" to "3001:3000"
    env_file:
      - .env
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped
```

### Solution 2: Update Nginx Configuration

If you change the host port, you must also update the Nginx configuration to point to the new port:

In `nginx.conf`, change:
```nginx
proxy_pass http://localhost:3000;
```

To:
```nginx
proxy_pass http://localhost:3001;
```

Then reload Nginx:
```bash
sudo systemctl reload nginx
```

### Solution 3: Use Environment Variables (Recommended)

Use environment variables for flexible port configuration:

1. Modify `docker-compose.yml`:
```yaml
version: '3.8'

services:
  telegram-bot:
    build: .
    container_name: telegram-translation-bot
    ports:
      - "${HOST_PORT:-3000}:${CONTAINER_PORT:-3000}"
    env_file:
      - .env
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped
```

2. Create or update `.env` file with port configuration:
```env
HOST_PORT=3001
CONTAINER_PORT=3000
```

### Solution 4: Identify and Stop Conflicting Processes

If you prefer to keep using port 3000:

1. Identify the process using port 3000:
```bash
sudo lsof -i :3000
# or
sudo netstat -tulpn | grep :3000
```

2. Stop the conflicting process:
```bash
sudo kill -9 <PID>
```

Where `<PID>` is the process ID from the previous command.

### Solution 5: Use Ephemeral Ports

Remove the port mapping entirely and let Docker assign an ephemeral port:

```yaml
version: '3.8'

services:
  telegram-bot:
    build: .
    container_name: telegram-translation-bot
    ports:
      - "3000"  # Only specify container port, Docker assigns host port
    env_file:
      - .env
    volumes:
      - ./logs:/app/logs
    restart: unless-stopped
```

To find the assigned port:
```bash
docker-compose port telegram-bot 3000
```

## Prevention

To prevent future port conflicts:

1. Always check if a port is in use before starting services:
```bash
netstat -tulpn | grep :3000
```

2. Use different ports for different environments (development, staging, production)

3. Document port usage in your project README

4. Consider using Docker networks for inter-container communication instead of exposing ports unnecessarily