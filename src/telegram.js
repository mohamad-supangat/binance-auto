import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import config from "./config.js";
import * as fn from "./functions.js";

const bot = new Telegraf(config.telegram_bot_token);

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

bot.launch();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
