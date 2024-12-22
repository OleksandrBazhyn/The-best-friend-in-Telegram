import dotenv from 'dotenv';
dotenv.config();
import TelegramBot from 'node-telegram-bot-api';
import OpenAI from 'openai';
import schedule from 'node-schedule';
import { botHobbies } from './getBotHobbies.js';

// Telegram and OpenAI API tokens
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const OPENAI_API_TOKEN = process.env.OPENAI_API_TOKEN;

// OpenAI API initialization
const openai = new OpenAI({
    apiKey: OPENAI_API_TOKEN,
});

// Telegram bot initialization
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: true });

// The bot's "life" memory
const botPersonality = {
    name: "Гліб",
    mood: "веселий",
    hobbies: botHobbies,
    log: [], // memory of interactions with the user
};

let lastInteractionTime = Date.now(); // time of the last interaction (initialized as now)

// Start command
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, `Привіт, я ${botPersonality.name})))`);
    lastInteractionTime = Date.now(); // update last interaction time
});

// Text message processing
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;

    // Ignore user commands
    if (msg.text.startsWith('/')) return;

    // Response generation via OpenAI
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `Ти — ${botPersonality.name}, дружелюбний і сучасний AI-друг користувача. У тебе є своє життя: ти веселий, любиш меми, жартувати та завжди підтримуєш хорошу атмосферу.`,
                },
                {
                    role: "user",
                    content: msg.text,
                },
            ],
        });

        const botReply = response.choices[0].message.content;

        // We keep the "memory" of the interaction
        botPersonality.log.push({
            user: msg.text,
            bot: botReply,
        });

        // Send response
        bot.sendMessage(chatId, botReply);

        // Update the time of the last interaction
        lastInteractionTime = Date.now();
    } catch (error) {
        console.error("Response error: ", error);
        bot.sendMessage(chatId, "Мбда..");
    }
});

// Scheduler for regular messages
schedule.scheduleJob('*/15 * * * *', async () => {
    // Get the current time and calculate the elapsed time since last interaction
    const currentTime = Date.now();
    const elapsedTime = (currentTime - lastInteractionTime) / 1000 / 60; // elapsed time in minutes

    // Calculate the next message interval based on the elapsed time since the last interaction
    const nextInterval = Math.random() * (120 - 90) + 90; // between 90 and 120 minutes

    if (elapsedTime >= nextInterval) {
        const randomMessages = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "Почни розмову з цікавої теми. Ти добрий та турботливий друг.",
                },
            ],
        });

        const message = randomMessages.choices[Math.floor(Math.random() * randomMessages.choices.length)];
        bot.sendMessage("bestfriend_openAI_Bot", message.content);

        // Update the last interaction time after sending the message
        lastInteractionTime = Date.now();
    }
});

console.log(`${botPersonality.name} is ready!`);
