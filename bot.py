const TelegramBot = require('node-telegram-bot-api');
const { Client } = require('pg');

// Вставте ваш токен бота
const token = 'YOUR_TELEGRAM_BOT_TOKEN';
const bot = new TelegramBot(token, { polling: true });

const client = new Client({
    host: 'your_render_postgres_host',
    port: 5432,
    user: 'your_db_user',
    password: 'your_db_password',
    database: 'your_db_name',
});

client.connect()
    .then(() => console.log('Connected to PostgreSQL'))
    .catch(err => console.error('Connection error', err.stack));

async function addPoints(userId, points) {
    const res = await client.query(`
        INSERT INTO user_points (user_id, points)
        VALUES ($1, $2)
        ON CONFLICT (user_id) DO UPDATE SET points = user_points.points + $2
        RETURNING *;
    `, [userId, points]);
    return res.rows[0];
}

bot.onText(/\/mine/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id.toString();

    const minedPoints = 10;
    const result = await addPoints(userId, minedPoints);
    bot.sendMessage(chatId, `Ви намайнили ${minedPoints} поінтів! Загальний баланс: ${result.points}`);
});
