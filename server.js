const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
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
    CREATE TABLE IF NOT EXISTS balances (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(50) NOT NULL,
        balance DECIMAL NOT NULL
    )
`)
.then(() => console.log("Table is successfully created"))
.catch(err => console.error(err));

// Отримати баланс
app.get('/balance/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const result = await pool.query('SELECT balance FROM balances WHERE user_id = $1', [userId]);
        if (result.rows.length > 0) {
            res.json({ balance: result.rows[0].balance });
        } else {
            res.json({ balance: 0 }); // Якщо не знайдено, повертаємо 0
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
        const result = await pool.query('SELECT balance FROM balances WHERE user_id = $1', [userId]);
        let newBalance;

        if (result.rows.length > 0) {
            newBalance = parseFloat(result.rows[0].balance) + amount;
            await pool.query('UPDATE balances SET balance = $1 WHERE user_id = $2', [newBalance, userId]);
        } else {
            newBalance = amount;
            await pool.query('INSERT INTO balances (user_id, balance) VALUES ($1, $2)', [userId, newBalance]);
        }

        res.json({ balance: newBalance });
    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
