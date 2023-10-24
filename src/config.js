import fs from "fs";
import "dotenv/config";
import _ from "lodash";

const base = "USDT";
const symbol = "OCEAN";
const config = {
    test: _.get(process.env, "TEST", "true") === "true", // check untuk testnet
    paper: true, // check untuk menjalankan paper mode / tidak create order live

    percent_order: 100,
    balance: 0.5,

    leverage: "20",
    margin_type: "CROSSED",

    market: `${symbol}/${base}`,
    symbol: `${symbol}${base}`,
    base_asset: base,

    // pengaturan api key
    test_APIKEY: _.get(process.env, "TEST_BINANCE_API_KEY"),
    test_APISECRET: _.get(process.env, "TEST_BINANCE_API_SECRET"),

    // live api key
    APIKEY: _.get(process.env, "BINANCE_API_KEY"),
    APISECRET: _.get(process.env, "BINANCE_API_SECRET"),

    // pengaturan telegram
    telegram_bot_token: _.get(process.env, "TELEGRAM_BOT_TOKEN"),
    telegram_chat_id: _.get(process.env, "TELEGRAM_CHAT_ID"),

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
        order_type: _.get(process.env, "STOP_LOSS_ORDER_TYPE", "STOP"),
        min_pnl: Number(_.get(process.env, "STOP_LOSS_MIN_PNL", 0.05)),
        every: Number(_.get(process.env, "STOP_LOSS_EVERY", 0.02)),
        spread: Number(_.get(process.env, "STOP_LOSS_SPREAD", 0.08)),
    },
};

export default config;
