const express = require('express');
const { Pool } = require('pg');
const cors = require('cors'); // Додайте цю бібліотеку для підтримки CORS

const app = express();
app.use(cors()); // Дозволяє запити з інших доменів
app.use(express.json());

// Налаштування підключення до бази даних
const pool = new Pool({
    connectionString: process.env.DATABASE_URL, // Додайте URL бази даних
    ssl: {
        rejectUnauthorized: false // Необхідно для Render
    }
});

// API для збереження балансу
app.post('/update-balance', async (req, res) => {
    const { address, balance } = req.body;
    try {
        await pool.query('INSERT INTO users (address, balance) VALUES ($1, $2) ON CONFLICT (address) DO UPDATE SET balance = $2', [address, balance]);
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
