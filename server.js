const express = require('express');
const { Pool } = require('pg');
const cors = require('cors'); // Додайте цю бібліотеку для підтримки CORS

const app = express();
app.use(cors()); // Дозволяє запити з інших доменів
app.use(express.json());

// Налаштування підключення до бази даних
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://balans_user:yAlZcxX1tpmZRcVhDyzsOuklsrJCv7Le@dpg-csagdrqj1k6c73cp8hlg-a/balans',
    ssl: {
        rejectUnauthorized: false // Необхідно для Render
    }
});

// Функція для створення таблиці, якщо її ще не існує
const createUsersTable = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                address VARCHAR(255) PRIMARY KEY,
                balance DECIMAL(10, 2) NOT NULL DEFAULT 0
            )
        `);
        console.log('Table created or already exists');
    } catch (err) {
        console.error('Error creating table:', err);
    }
};

// Викликаємо функцію створення таблиці
createUsersTable();

// API для збереження балансу
app.post('/update-balance', async (req, res) => {
    const { address, balance } = req.body;
    try {
        await pool.query(
            'INSERT INTO users (address, balance) VALUES ($1, $2) ON CONFLICT (address) DO UPDATE SET balance = $2',
            [address, balance]
        );
        res.sendStatus(200);
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});

// API для отримання балансу
app.get('/get-balance/:address', async (req, res) => {
    try {
        const { rows } = await pool.query('SELECT balance FROM users WHERE address = $1', [req.params.address]);
        if (rows.length > 0) {
            res.json({ balance: rows[0].balance });
        } else {
            res.json({ balance: 0 });
        }
    } catch (error) {
        console.error(error);
        res.sendStatus(500);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
