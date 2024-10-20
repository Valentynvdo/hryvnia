const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
    connectionString: 'postgresql://balans_user:yAlZcxX1tpmZRcVhDyzsOuklsrJCv7Le@dpg-csagdrqj1k6c73cp8hlg-a/balans',
    ssl: {
        rejectUnauthorized: false // Необхідно для Render
    }
});

// Створення таблиці, якщо її ще не існує
pool.query(`
    CREATE TABLE IF NOT EXISTS users (
        address VARCHAR(255) PRIMARY KEY,
        balance DECIMAL(10, 2) NOT NULL DEFAULT 0
    )
`)
.then(res => {
    console.log('Table created or already exists');
})
.catch(err => {
    console.error('Error creating table:', err);
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
