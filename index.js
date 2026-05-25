process.env.NTBA_FIX_350 = 1;

const express = require("express");
const TelegramBot = require("node-telegram-bot-api");
const axios = require("axios");

const app = express();

// 🔑 DEINE DATEN (so gelassen wie du wolltest)
const BOT_TOKEN = "8861172445:AAFIn2lUkconc4VGBra67nwlLLEdpTAKT58";
const API_KEY = "XBRR5XP-7G1MJBV-GKWY9CD-GH2ZNYV";

// 🤖 BOT
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// ❗ ERROR HANDLING
bot.on("polling_error", (error) => {
    console.log("Polling error:", error.message);
});

// 💎 PRODUKTE
const products = {
    d1: { name: "1 Tag", price: 5.5 },
    w1: { name: "1 Woche", price: 14 },
    m1: { name: "1 Monat", price: 25 },
    y1: { name: "1 Jahr", price: 65 },
    life: { name: "Für immer", price: 110 }
};

// 💰 DEINE WALLETS
const wallets = {
    btc: "bc1qyu8d0355ux5kvf6gx25p6j4uszd0rsw0p3s04l",
    ltc: "LRseqGpzdVnqsfj39g4QKDtFi7F6PfGjYc"
};

// 📋 MENU
function mainMenu(chatId, msgId = null) {
    const text = `
💎 CRYPTO SHOP

📅 1 Tag — 5.50$
🍺 1 Woche — 14$
🌙 1 Monat — 25$
🎄 1 Jahr — 65$
🔥 Für immer — 110$

👇 Wähle:
`;

    const keyboard = {
        inline_keyboard: [
            [{ text: "📅 1 Tag", callback_data: "buy_d1" }],
            [{ text: "🍺 1 Woche", callback_data: "buy_w1" }],
            [{ text: "🌙 1 Monat", callback_data: "buy_m1" }],
            [{ text: "🎄 1 Jahr", callback_data: "buy_y1" }],
            [{ text: "🔥 Lifetime", callback_data: "buy_life" }]
        ]
    };

    if (msgId) {
        bot.editMessageText(text, {
            chat_id: chatId,
            message_id: msgId,
            reply_markup: keyboard
        });
    } else {
        bot.sendMessage(chatId, text, {
            reply_markup: keyboard
        });
    }
}

// ▶ START
bot.onText(/\/start/, (msg) => {
    mainMenu(msg.chat.id);
});

// 🔘 BUTTONS
bot.on("callback_query", async (q) => {
    const chatId = q.message.chat.id;
    const msgId = q.message.message_id;
    const data = q.data;

    if (data === "back") return mainMenu(chatId, msgId);

    if (data.startsWith("buy_")) {
        const key = data.replace("buy_", "");
        const p = products[key];

        return bot.editMessageText(`
🛒 ${p.name}
💰 ${p.price}$

Wähle Coin:
`, {
            chat_id: chatId,
            message_id: msgId,
            reply_markup: {
                inline_keyboard: [
                    [{ text: "₿ Bitcoin", callback_data: `pay_btc_${key}` }],
                    [{ text: "Ł Litecoin", callback_data: `pay_ltc_${key}` }],
                    [{ text: "🔙 Zurück", callback_data: "back" }]
                ]
            }
        });
    }

    // 💰 ZAHLUNG
    if (data.startsWith("pay_")) {
        const parts = data.split("_");
        const coin = parts[1];
        const key = parts[2];
        const p = products[key];

        const address = wallets[coin];

        const qr = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${address}`;

        await bot.editMessageText(`
💰 ZAHLUNG

📦 ${p.name}
💵 ${p.price}$

🪙 ${coin.toUpperCase()}

📬 Adresse:
\`${address}\`

📋 Tippen zum kopieren

⚠️ Sende den Betrag manuell!
`, {
            chat_id: chatId,
            message_id: msgId,
            parse_mode: "Markdown",
            reply_markup: {
                inline_keyboard: [
                    [{ text: "🔙 Zurück", callback_data: "back" }]
                ]
            }
        });

        bot.sendPhoto(chatId, qr);
    }
});

// 🌐 SERVER (HOSTING FIX)
app.get("/", (req, res) => {
    res.send("Bot läuft 😈");
});

// 🔥 PORT FIX (WICHTIG)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("🔥 Server läuft auf Port " + PORT);
});