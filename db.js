// db.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Функція для отримання балансу
const getBalance = async (userId) => {
    const res = await pool.query('SELECT balance FROM users WHERE id = $1', [userId]);
    return res.rows[0] ? res.rows[0].balance : 0;
};

// Функція для оновлення балансу
const updateBalance = async (userId, amount) => {
    await pool.query('UPDATE users SET balance = balance + $1 WHERE id = $2', [amount, userId]);
};

module.exports = {
    getBalance,
    updateBalance,
};
