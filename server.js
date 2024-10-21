const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid'); // Генерація UUID
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
        balance DECIMAL NOT NULL DEFAULT 0
    )
`)
.then(() => console.log("Table is successfully created"))
.catch(err => console.error(err));

// Ендпоінт для ініціалізації користувача
app.get('/initialize', async (req, res) => {
    try {
        const userId = uuidv4(); // Генерація нового UUID
        const initialBalance = 0; // Початковий баланс

        // Зберегти ID і баланс у базі даних
        await pool.query('INSERT INTO users (id, balance) VALUES ($1, $2)', [userId, initialBalance]);

        res.json({ userId, balance: initialBalance });
    } catch (error) {
        console.error('Error initializing user:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Ендпоінт для отримання балансу
app.get('/balance/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const result = await pool.query('SELECT balance FROM users WHERE id = $1', [userId]);
        if (result.rows.length > 0) {
            res.json({ balance: result.rows[0].balance });
        } else {
            res.json({ balance: 0 });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});

// Оновити баланс
app.post('/balance', async (req, res) => {
    const { userId, amount } = req.body;
    try {
        const result = await pool.query('SELECT balance FROM users WHERE id = $1', [userId]);
        let newBalance;

        if (result.rows.length > 0) {
            newBalance = parseFloat(result.rows[0].balance) + amount;
            await pool.query('UPDATE users SET balance = $1 WHERE id = $2', [newBalance, userId]);
        } else {
            newBalance = amount;
            await pool.query('INSERT INTO users (id, balance) VALUES ($1, $2)', [userId, newBalance]);
        }

        res.json({ balance: newBalance });
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
