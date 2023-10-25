#!/usr/bin/env node

import { Telegraf, Markup } from "telegraf";
import { message } from "telegraf/filters";
import _ from "lodash";

import config from "./../src/config.js";
import * as fn from "./../src/functions.js";
import * as bf from "./../src/helpers.js";

const bot = new Telegraf(config.telegram_bot_token);
const binance = bf.binanceClient();

bot.start((ctx) => ctx.reply("Hallloooo"));

function checkUser(ctx) {
    if (ctx.update.message.from.id !== Number(config.telegram_chat_id)) {
        ctx.reply("WHO ARE YOUUUUUU  ??");
        return;
    }
    return true;
}

/** mengirimkan status saat ini */
bot.command("status", async (ctx) => {
    if (!checkUser(ctx)) return;
    const status = await fn.getStatus();
    ctx.replyWithHTML(status);
});

bot.command("tradingview_ta", async (ctx) => {
    if (!checkUser(ctx)) return;
    const ta = await fn.tradingViewTA();
    ctx.replyWithHTML(ta);
});

bot.command("orders", async (ctx) => {
    if (!checkUser(ctx)) return;
    const orders = await bf.getOpenOrders(binance);
    console.log(orders);

    for (const order of orders) {
        const buttons = [
            Markup.button.callback("Cancel Order", "cancelOrder-" + order.id),
        ];
        const inlineKeyboard = Markup.inlineKeyboard(buttons);
        ctx.replyWithHTML(
            `<b>open order</b>\n\nid : ${order.id}\ntype : ${
                order.type < 0 ? "SHORT" : "LONG"
            }\nqty : ${order.qty}\norderType : ${order.orderType}`,
            inlineKeyboard,
        );
    }
});

async function removeInlineKeyboard(ctx) {
    const messageId = ctx.callbackQuery.message.message_id;
    await ctx.editMessageReplyMarkup({
        reply_markup: {
            inline_keyboard: [],
        },
    });
}

bot.on("callback_query", async (ctx) => {
    if (!checkUser(ctx)) return;
    const data = _.split(ctx.callbackQuery.data, "-");
    if (data[0] == "cancelOrder") {
        // await bf.cancelOrder(binance, data[1]);
        removeInlineKeyboard(ctx);
    }
});

bot.launch();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
