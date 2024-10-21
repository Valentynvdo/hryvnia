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
        const { userId } = req.query; // Отримуємо userId з запиту

        if (userId) {
            // Якщо userId передано, перевіряємо, чи існує користувач
            const existingUser = await pool.query('SELECT * FROM users WHERE user_id = $1', [userId]);

            if (existingUser.rows.length > 0) {
                // Якщо користувач існує, повертаємо його дані
                return res.json({
                    userId: existingUser.rows[0].user_id,
                    balance: existingUser.rows[0].balance
                });
            }
        }

        // Якщо користувача не існує або userId не передано, створюємо нового
        const newUserId = uuidv4(); // Генерація нового UUID
        const initialBalance = 0; // Початковий баланс

        // Зберегти ID і баланс у базі даних
        await pool.query('INSERT INTO users (id, balance, user_id) VALUES ($1, $2, $3)', [uuidv4(), initialBalance, newUserId]);

        res.json({ userId: newUserId, balance: initialBalance });
    } catch (error) {
        console.error('Error initializing user:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Ендпоінт для отримання балансу за ID користувача
app.get('/get_balance/:id', async (req, res) => {
    const userId = req.params.id;
    try {
        const result = await pool.query('SELECT balance FROM users WHERE user_id = $1', [userId]);
        if (result.rows.length > 0) {
            return res.json({ balance: result.rows[0].balance });
        } else {
            return res.status(404).send('User not found');
        }
    } catch (error) {
        console.error('Error fetching balance:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Ендпоінт для оновлення балансу
app.post('/update_balance', async (req, res) => {
    const { userId, newBalance } = req.body;

    try {
        const result = await pool.query('UPDATE users SET balance = $1 WHERE user_id = $2', [newBalance, userId]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

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
