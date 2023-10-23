import fs from "fs";
import "dotenv/config";

const base = "USDT";
const symbol = "OCEAN";
const config = {
    test: process.env.TEST === "true", // check untuk testnet
    paper: true, // check untuk menjalankan paper mode / tidak create order live

    percent_order: 100,
    balance: 0.5,

    leverage: "20",
    margin_type: "CROSSED",

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

    tradingview: {
        locale: "id",
        symbol: `${symbol}${base}`,
        signal_delay: 3,
        timeframe: "240",
        indicator: "PUB;0Bgj6noVlHAZK2fbozpk8pwQcgzMToCx",
        buy: {
            key: "ENTER",
            value: 1,
        },
        sell: {
            key: "EXIT",
            value: -1,
        },
    },

    stop_loss: {
        order_type: "STOP",
        min_pnl: 0.05,
        every: 0.05,
        spread: 0.08,
    },
};

export default config;
