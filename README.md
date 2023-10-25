**Binance Future Trading Automation with Telegram**

This repository contains a simple Binance trading automation script that can be used to send and receive Telegram commands to place and manage trades, as well as receive notifications about trades and account balances.

**Requirements**

* Node.js
* Binance Future API key
* Telegram bot token

**Installation**

1. Clone the repository:

```
git clone https://github.com/mohamad-supangat/binance-auto.git
```

2. Install the requirements:

```
npm install
```

3. Create a Telegram bot and get a bot token.

4. Create a Binance API key and enable future trading permissions.

**Configuration**

Copy the `.env.example` to `.env` file and edit the following settings:

* `BINANCE_API_KEY`: Your Binance API key.
* `BINANCE_API_SECRET`: Your Binance API secret.
* `TELEGRAM_BOT_TOKEN`: Your Telegram bot token.
* `TELEGRAM_CHAT_ID`: Your Telegram chat ID.

**Usage**

To start the bot, simply run the following command:

```
npm run start:telegram
```

The bot will start listening for Telegram commands.

**Telegram commands**

The bot supports the following Telegram commands, copy and paste to botFather:
```
status - get balance, symbol price, future position
tradingview_ta - get tradingview technical analitycs recommendations
orders - get all open orders
```
**Disclaimer**

Please use this script at your own risk. Automated trading can be risky, and there is no guarantee of profits.

**Additional notes**

This script is just a basic example for personal project, and you can customize it to fit your own trading needs. For example, you can add support for multiple trading pairs, different order types, and more complex trading strategies.

