import moment from "moment";
import Binance from "binance-api-node";
import config from "./config.js";
import marketData from "./data/market.js";
import _ from "lodash";

import { AsciiTable3 } from "ascii-table3";

export function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
/**
 * mendapatkan jam dan tanggal sekarang
 * @returns {string} current date time string
 */
export function currentTime() {
    return moment().format("YYYY-MM-DD HH:mm:ss");
}

/**
 * @param {any} log
 */
export function sendLog(log, params = null) {
    if (params) {
        console.log(currentTime(), log, params);
    } else {
        console.log(currentTime(), log);
    }
}

/**
 * @returns {object}  binance client
 */
export function binanceClient() {
    const binance = Binance.default({
        httpFutures: config.test
            ? "https://testnet.binancefuture.com"
            : "https://fapi.binance.com",
        wsFutures: config.test
            ? "wss://stream.binancefuture.com"
            : "wss://fstream.binance.com",
        apiKey: config.test ? config.test_APIKEY : config.APIKEY,
        apiSecret: config.test ? config.test_APISECRET : config.APISECRET,
    });

    return binance;
}

/**
 * melakukan setting leverage dan margin type
 * @param {any} client
 */
export async function setLeverage(client) {
    try {
        await client.futuresLeverage({
            symbol: config.symbol,
            leverage: config.leverage,
        });
        sendLog("init leverage");
    } catch (e) {
        sendLog("failed to set leverage");
    }
    try {
        await client.futuresMarginType({
            symbol: config.symbol,
            marginType: config.margin_type,
        });
        sendLog("init margin type");
    } catch (e) {
        sendLog("failed to set margin type");
    }
}

/** current price
 * @returns {string}
 */
export async function currentPrice(client) {
    const prices = await client.futuresPrices();
    return Number(prices[config.symbol]);
}

/**
 * fungsi untuk membuat order baru
 * @param {any} type 1 or -1
 * @param {any} qty
 * @param {any} price
 */
export async function submitOrder(
    client,
    type,
    qty,
    price,
    orderType = null,
    params = {},
) {
    try {
        // jika tidak menyertakan order type maka ambil dari config;
        if (!orderType) {
            orderType = config.order_type;
        }
        const side = type == 1 ? "BUY" : "SELL";
        qty = roundToPrecision("qty", qty);

        sendLog(orderType, {
            type,
            side,
            qty,
            price,
        });

        if (config.paper) return;

        let orderData = {
            symbol: config.symbol,
            side: side,
            type: orderType,
            quantity: qty,
            ...params,
        };

        // jika bertipe market jangan masukan price
        if (!orderType.includes("MARKET")) {
            price = roundToPrecision("price", price);
            price = roundToTickSize(type, price);
            orderData["price"] = price;
        }

        const order = await client.futuresOrder(orderData);

        console.log(order);

        return order;
    } catch (e) {
        console.log(e);
        // this.submit_order(type, qty, price);
    }
}

/**
 * melakukan stop loss order
 * @param {any} positionType
 * @param {any} qty
 * @param {any} price
 */
export async function submitStopLossOrder(client, positionType, qty, price) {
    try {
        const orderType = config.stop_loss.order_type;
        const type = positionType == -1 ? 1 : -1;
        return submitOrder(client, type, qty, price, orderType, {
            stopPrice: price,
        });
    } catch (e) {
        console.log(e);
        // this.submit_order(type, qty, price);
    }
}
/**
 * melakukan take profit order
 * @param {any} positionType
 * @param {any} qty
 * @param {any} price
 */
export async function submitTakeProfitOrder(client, positionType, qty, price) {
    try {
        const orderType = config.take_profit.order_type;
        const type = positionType == -1 ? 1 : -1;
        return submitOrder(client, type, qty, price, orderType, {
            stopPrice: price,
        });
    } catch (e) {
        console.log(e);
        // this.submit_order(type, qty, price);
    }
}
/**
 * rounded ke preccision dari bawaan binance
 * @param {any} type
 * @param {any} value
 * @returns {}
 */
export function roundToPrecision(type, value) {
    const precision = marketData(config.symbol);

    value = Number(
        Number(value).toFixed(type == "qty" ? precision.qty : precision.price),
    );
    return value;
}

/**
 * Mengkonversi value agar menjadi kelipatan tick size pada data market
 * @param {any} type 1 untuk buy dan -1 untuk sell
 * @param {any} value
 * @returns {}
 */
export function roundToTickSize(type, value) {
    const market = marketData(config.symbol);
    value = Number(value - type * (value % Number(market.tick)));
    return value;
}
/* Mendapatkan data qty */
export function generateQty(price) {
    const qty = (config.balance / price) * config.leverage;
    return roundToPrecision("qty", qty);
}

/**
 * @param {any} type posisi yang sedang berjalan 1 buy - sell
 * @param {any} entry_price
 * @param {any} target_profit
 * @param {any} qty
 * @returns {}
 */
export function generateExitPrice(type, entry_price, target_profit, qty) {
    let price;

    // jika unutk posisi buy exit price =
    // entry price + target_profit / qty = nilai > entry price

    // jika untuk posisi sell hasil harus < dari entry price
    if (type == 1) {
        price = Number(entry_price) + Number(target_profit) / Number(qty);
    } else {
        price = Number(entry_price) - Number(target_profit) / Number(qty);
    }
    // console.log(price);
    // console.log(type, entry_price, target_profit, qty);
    // if (type == 1) {
    //   price = entry_price * (roe / config.leverage + 1);
    // } else {
    //   price = entry_price * (1 - roe / config.leverage);
    // }

    return roundToPrecision("price", price);
}

/* mengambil semua data position pada binance */
export async function getPosition(client) {
    try {
        let position_data = await client.futuresPositionRisk(),
            markets = Object.keys(position_data);

        // console.log(position_data);
        for (let market of markets) {
            let obj = position_data[market],
                size = Number(obj.positionAmt);
            if (size == 0 || obj.symbol != config.symbol) continue;
            return mapPosition(obj);
        }

        return null;
    } catch (e) {
        console.log(e);
        // return await getPosition(client);
    }
}

/**
 * Mengambil data main order / order membeli LIMIT / MARKET
 * @returns {}
 */
export async function getMainOrders(client) {
    const orders = await getOpenOrders(client);
    return _.filter(
        orders,
        (order) => order.orderType == "LIMIT" || order.orderType == "MARKET",
    );
}

/**
 * Mendapatkan data take profit orders
 * @returns {}
 */
export async function getTakeProfitOrders(client) {
    const orders = await getOpenOrders(client);
    return _.filter(orders, (order) => order.orderType.includes("TAKE_PROFIT"));
}

/**
 * Mendapatkan semua data stop loss orders
 * @returns {}
 */
export async function getStopOrders(client) {
    const orders = await getOpenOrders(client);
    return _.filter(orders, (order) => order.orderType.includes("STOP"));
}

export function mapPosition(position) {
    // console.log(position);
    let positionQty = Number(position.positionAmt);
    let positionType = positionQty < 0 ? -1 : 1;
    positionQty = Math.abs(positionQty);
    const entryPrice = Number(position.entryPrice);
    return {
        type: positionType,
        qty: positionQty,
        entryPrice: entryPrice,
        markPrice: Number(position.markPrice),
        symbol: position.symbol,
        pnl: Number(position.unRealizedProfit),
        liquidationPrice: position.liquidationPrice,
        initialMargin: (positionQty * entryPrice) / Number(position.leverage),
        isolatedMargin: position.isolatedMargin,
        isolatedWallet: position.isolatedWallet,
    };
}

function mapOrder(order) {
    return {
        id: order.orderId,
        status: order.status,
        orderType: order.type,
        type: order.side == "BUY" ? 1 : -1,
        symbol: order.symbol,
        price: Number(order.price),
        executedQty: Number(order.executedQty),
        qty: Number(order.origQty),
        stopPrice: Number(order.stopPrice),
    };
}
/* Mendapatkan semua data open orders */
export async function getOpenOrders(client) {
    try {
        const orders = await client.futuresOpenOrders({
            symbol: config.symbol,
        });
        return _.map(orders, (order) => mapOrder(order));
    } catch (e) {
        console.log(e);
        // return await getOpenOrders(client);
    }
}

/* membatalkan semua pesanan order yang belum tereksekusi */
export async function cancelAllOrder(client) {
    try {
        return client.futuresCancelAllOpenOrders({
            symbol: config.symbol,
        });
    } catch (e) {
        // console.log(e);
        return cancelAllOrder(client);
    }
}

/**
 * Membatalkan openorder berdasarkan id
 * @param {any} orderId
 */
export async function cancelOrder(client, orderId) {
    try {
        return client.futuresCancelOrder({
            symbol: config.symbol,
            orderId: orderId,
        });
    } catch (e) {
        console.log(e);
        // return cancelOrder(client, orderId);
    }
}

/**
 * menghitung harga dari presentase yang di jumlahkan
 * @param {any} type
 * @param {any} price
 * @returns {}
 */
export function generateDiscountPrice(type, price) {
    price = Number(price);
    const discount = (price * config.discount) / 100;
    let target_price = type == 1 ? price - discount : price + discount;
    return roundToPrecision("price", target_price);
}

function mapTradeHistory(trade) {
    return {
        timestamp: trade.time,
        type: trade.side == "SELL" ? -1 : 1,
        qty: Number(trade.qty),
        price: Number(trade.price),
        pnl: Number(trade.realizedPnl),
        time: moment.unix(Number(trade.time / 1000)).format("LLL"),
    };
}
export async function tradesHistory(client, params = {}) {
    try {
        const trades = await client.futuresUserTrades({
            symbol: config.symbol,
            ...params,
        });
        // console.log(trades);
        return trades.map((x) => mapTradeHistory(x));
    } catch (e) {
        return await tradesHistory(params);
    }
}

export async function getBalance(client) {
    const balances = await client.futuresAccountBalance();

    for (const balance of balances) {
        if (config.base_asset == balance.asset) {
            return Number(balance.balance);
        }
    }
}

export function genTable(rows = [], title = null) {
    return new AsciiTable3(title).setStyle("unicode-single").addRowMatrix(rows);
}
