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
    log: [] // memory of interactions with the user
};

// Start command
bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, `Привіт, я ${botPersonality.name})))`);
});

// Text message processing
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;

    // Ignore user commands
    if (msg.text.startsWith('/')) return;

    // Response generation via OpenAI
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: `Ти — ${botPersonality.name}, дружелюбний і сучасний AI-друг користувача. У тебе є своє життя: ти веселий, любиш меми, жартувати та завжди підтримуєш хорошу атмосферу.`,
                },
                {
                    role: "user",
                    content: msg.text
                },
            ],
        });

        const botReply = response.choices[0].message.content;

        // We keep the "memory" of the interaction
        botPersonality.log.push(
            {
                user: msg.text,
                bot: botReply,
            },
        );

        // Send response
        bot.sendMessage(chatId, botReply);
    } catch (error) {
        console.error("Response error: ", error);
        bot.sendMessage(chatId, "Мбда..");
    }
});

// Scheduler and other functionalities
schedule.scheduleJob('0 9 * * *', () => {
    bot.sendMessage("bestfriend_openAI_Bot", "Добрий ранок, ти як?");
});

schedule.scheduleJob('0 21 * * *', async () => {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                {
                    role: "system",
                    content: "Ти сучасний і веселий AI-друг. Згенеруй цікаву думку, мем чи запитання для користувача."
                },
            ],
        });

        const dynamicThought = response.choices[0].message.content;
        bot.sendMessage("bestfriend_openAI_Bot", dynamicThought);
    } catch (error) {
        console.error("Random evening message text generation error: ", error);
        bot.sendMessage("bestfriend_openAI_Bot", "Щось пішло не так, але наступного разу все буде 😊");
    }
});

schedule.scheduleJob('*/15 * * * *', async () => {
    const randomMessages = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                role: "system",
                content: "Почни розмову з цікавої теми. Ти добрий та турботливий друг."
            },
        ],
    });

    const message = randomMessages.choices[Math.floor(Math.random() * randomMessages.choices.length)];
    bot.sendMessage("bestfriend_openAI_Bot", message.content);
    
    const nextInterval = Math.random() * (120 - 90) + 90;
    setTimeout(() => {}, nextInterval * 60 * 1000);
});

console.log(`${botPersonality.name} is ready!`);
