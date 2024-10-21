const express = require('express');
const { v4: uuidv4 } = require('uuid'); // Імпортуємо uuid для генерації унікальних ID
const app = express();
app.use(express.json());

let users = {}; // Для зберігання користувачів

// Ініціалізація нового користувача
app.get('/initialize', (req, res) => {
    const userId = uuidv4(); // Генерація нового ID
    users[userId] = { balance: 0 }; // Створення нового користувача з нульовим балансом
    console.log(`New user created: ${userId}`); // Логування нового ID
    res.json({ userId, balance: users[userId].balance }); // Повертаємо ID та баланс
});

// Оновлення балансу
app.post('/update_balance', (req, res) => {
    const { userId, newBalance } = req.body;
    if (users[userId]) {
        users[userId].balance = newBalance; // Оновлення балансу
        res.status(200).send('Balance updated successfully');
    } else {
        res.status(404).send('User not found');
    }
});

// Запуск сервера
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
