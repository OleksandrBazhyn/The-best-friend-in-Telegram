require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const { Configuration, OpenAIApi } = require('openai');
const schedule = require('node-schedule');
const { botHobbies } = require('./getBotHobbies')

// Telegram and OpenAI API tokens
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const OPENAI_API_TOKEN = process.env.OPENAI_API_TOKEN;

// OpenAI API initialization
const openai = new OpenAIApi(new Configuration({
    apiKey: OPENAI_API_TOKEN,
}));

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
        const response = await openai.createChatCompletion({
            model: "gpt-4o",
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

        const botReply = response.data.choices[0].message.content;

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

// Planner for "messages from life"
schedule.scheduleJob('0 9 * * *', () => { // Message at 9:00
    bot.sendMessage("bestfriend_openAI_Bot", "Добрий ранок, ти як?")
});

schedule.scheduleJob('0 21 * * *', async () => { // Message at 21:00
    try {
        const response = await openai.createChatCompletion({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "Ти сучасний і веселий AI-друг. Згенеруй цікаву думку, мем чи запитання для користувача."
                },
            ],
        });

        const dynamicThought = response.data.choices[0].message.content;
        bot.sendMessage("bestfriend_openAI_Bot", dynamicThought);
    } catch (error) {
        console.error("Random evening message text generation error: ", error);
        bot.sendMessage("bestfriend_openAI_Bot", "Щось пішло не так, але наступного разу все буде 😊");
    }
});

schedule.scheduleJob('*/15 * * * *', async () => {
    const randomMessages = await openai.createChatCompletion({
        model: "gpt-4o",
        messages: [
            {
                role: "system",
                content: "Почни розмову з цікавої теми. Ти добрий та турботливий друг."
            },
        ],
    });
    
    const message = randomMessages[Math.floor(Math.random() * randomMessages.length)];
    
    bot.sendMessage("bestfriend_openAI_Bot", message);
    
    const nextInterval = Math.random() * (120 - 90) + 90;
    setTimeout(sendRandomMessage, nextInterval * 60 * 1000);
    
    bot.sendMessage("bestfriend_openAI_Bot", randomActions[Math.floor(Math.random() * randomActions.length)]);
});

console.log(`${botPersonality.name} is ready!`);
