import { Telegraf } from "telegraf";
import { message } from "telegraf/filters";
import config from "./config.js";
import * as bf from "./helpers.js";

const bot = new Telegraf(config.telegram_bot_token);
const binance = bf.binanceClient();

bot.start((ctx) => ctx.reply("Hallloooo"));
/* bot.help((ctx) => ctx.reply("Send me a sticker")); */

function checkUser(ctx) {
    if (ctx.update.message.from.id !== Number(config.telegram_chat_id)) {
        ctx.reply("WHO ARE YOUUUUUU  ??");
        return false;
    }

    return true;
}

/** mengirimkan status saat ini */
bot.command("status", async (ctx) => {
    if (!checkUser(ctx)) return true;

    const balance = await bf.getBalance(binance);
    const currentPrice = await bf.currentPrice(binance);
    const position = await bf.getPosition(binance);

    ctx.replyWithHTML(`balance : <b>${balance}</b>`);
    ctx.replyWithHTML(
        `<b>Market ${config.market}</b>\n\ncurrent price : <b>${currentPrice}</b>`,
    );

    if (position) {
        ctx.replyWithHTML(
            `position : ${position.type} - ${position.qty}\nentry : ${position.entryPrice}\nmark : ${position.markPrice}\nliquidation : ${position.liquidationPrice}\npnl : <b>${position.pnl}</b>`,
        );
    }
});
bot.launch();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
