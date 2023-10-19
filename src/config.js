import fs from "fs";
import "dotenv/config";

const base = "USDT";
const symbol = "OCEAN";
const config = {
    test: process.env.TEST === "true", // check untuk testnet
    paper: true, // check untuk menjalankan paper mode / tidak create order live

    market: `${symbol}/${base}`,
    symbol: `${symbol}${base}`,
    base_asset: base,

    // pengaturan api key
    test_APIKEY: process.env.TEST_BINANCE_API_KEY,
    test_APISECRET: process.env.TEST_BINANCE_API_SECRET,

    // live api key
    APIKEY: process.env.BINANCE_API_KEY,
    APISECRET: process.env.BINANCE_API_SECRET,

    // pengaturan telegram
    telegram_bot_token: process.env.TELEGRAM_BOT_TOKEN,
    telegram_chat_id: process.env.TELEGRAM_CHAT_ID,
};

export default config;
