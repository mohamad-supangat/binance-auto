#!/usr/bin/env node

import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import config from "./../src/config.js";
import * as fn from "./../src/functions.js";

const bot = new Telegraf(config.telegram_bot_token);

// send current status
const status = await fn.getStatus();
bot.telegram.sendMessage(config.telegram_chat_id, status, {
    parse_mode: "HTML",
});

const ta = await fn.tradingViewTA();
bot.telegram.sendMessage(config.telegram_chat_id, ta, {
    parse_mode: "HTML",
});
