const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid'); // Для генерації унікальних ID
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Налаштування PostgreSQL
const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Ініціалізація таблиці
pool.query(`
    CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        balance NUMERIC DEFAULT 0,
        user_id VARCHAR(50) UNIQUE
    )
`)
.then(() => console.log("Table is successfully created"))
.catch(err => console.error(err));

// Ендпоінт для ініціалізації користувача
app.get('/initialize', async (req, res) => {
    try {
        // Перевіряємо, чи вже є користувач
        const existingUser = await pool.query('SELECT * FROM users LIMIT 1');
        
        if (existingUser.rows.length > 0) {
            // Якщо користувач вже існує, повертаємо його дані
            return res.json({
                userId: existingUser.rows[0].id,
                balance: existingUser.rows[0].balance
            });
        }

        // Генерація нового унікального ID
        const userId = uuidv4(); // Генерація нового UUID
        const initialBalance = 0; // Початковий баланс

        // Зберегти ID і баланс у базі даних
        await pool.query('INSERT INTO users (id, balance, user_id) VALUES ($1, $2, $3)', [userId, initialBalance, userId]);

        res.json({ userId, balance: initialBalance });
    } catch (error) {
        console.error('Error initializing user:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Ендпоінт для оновлення балансу
app.post('/update_balance', async (req, res) => {
    const { userId, newBalance } = req.body;

    try {
        await pool.query('UPDATE users SET balance = $1 WHERE id = $2', [newBalance, userId]);
        res.sendStatus(204); // No Content
    } catch (error) {
        console.error('Error updating balance:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
