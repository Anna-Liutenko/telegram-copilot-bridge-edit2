# Telegram Translation Bot

A Node.js translation bot that provides real-time translation services across multiple languages using the GPT-5-nano model.

## Features

- Real-time translation across multiple languages
- Support for English, Russian, and Korean
- Three-stage translation pipeline: language setup, source language detection, and translation
- JSON validation and error handling for LLM responses
- Session persistence for user language preferences
- Telegram integration for user interactions
- Docker support for easy deployment

## Prerequisites

- Node.js 14 or higher
- npm or yarn
- Telegram Bot Token (from BotFather)
- OpenAI API Key

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd telegram-copilot-bridge-edit2
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Configure your environment variables in the `.env` file:
   - `TELEGRAM_BOT_TOKEN`: Your Telegram bot token
   - `OPENAI_API_KEY`: Your OpenAI API key

## Usage

### Development

```bash
npm run dev
```

### Production

```bash
npm start
```

## Docker

To run the bot in a Docker container:

1. Build the Docker image:
   ```bash
   docker build -t telegram-translation-bot .
   ```

2. Run the container:
   ```bash
   docker run -d --name telegram-translation-bot --env-file .env -p 3000:3000 telegram-translation-bot
   ```

## How to Use the Bot

1. Start a conversation with your bot on Telegram
2. Tell the bot which languages you want to use, for example: "I want to use English, Russian, and Korean"
3. Send any text message to the bot and it will translate it to all your selected languages

### Commands

- `/start` - Start the bot and get instructions
- `/help` - Get help information
- `/languages` - See your currently selected languages
- `/clear` - Clear your language preferences

## Architecture

The bot follows a three-stage translation pipeline:

1. **Language Setup**: Convert natural language language requests to structured JSON
2. **Source Language Detection**: Identify the language of text to be translated
3. **Translation**: Translate text between specified languages

## Error Handling

The bot includes comprehensive error handling:
- LLM response validation and repair
- Retry logic with exponential backoff
- Custom error types for different failure modes
- Detailed logging for debugging

## License

ISC