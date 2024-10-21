// Ініціалізація TonConnectUI
const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
    manifestUrl: 'https://ton-connect.github.io/demo-dapp-with-react-ui/tonconnect-manifest.json',
    buttonRootId: 'connect-button'
});

// Змінні для відстеження статусу підключення та балансу
let connectedUserId = ''; // Змінна для зберігання ID
let balance = 0;
const miningDuration = 8000; // 8 секунд
const miningPoints = 19; // Кількість поінтів за майнінг

// Знайти елементи на сторінці
const balanceDisplay = document.getElementById("coin-balance");
const startMiningButton = document.getElementById("start-mining-btn");
const miningTimerDisplay = document.getElementById("mining-timer");
const userIdDisplay = document.getElementById("user-id"); // Відображення ID користувача

// Функція для ініціалізації користувача
async function initializeUser() {
    // Перевірка, чи є вже збережений ID користувача в локальному сховищі
    const savedUserId = localStorage.getItem('userId');
    
    if (savedUserId) {
        // Використовуємо збережений ID для отримання балансу
        const response = await fetch(`/get_balance?userId=${savedUserId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            connectedUserId = savedUserId; // Встановлюємо ID з локального сховища
            balance = data.balance || 0; // Оновлюємо баланс
            balanceDisplay.textContent = balance.toFixed(2); // Оновлюємо відображення балансу
            userIdDisplay.textContent = `User ID: ${connectedUserId}`; // Відображаємо ID користувача
            return; // Виходимо, якщо користувач вже існує
        }
    }

    // Якщо немає збереженого ID, генеруємо нового користувача
    try {
        const response = await fetch(`/initialize`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        // Перевірка відповіді сервера
        if (!response.ok) {
            throw new Error('Failed to initialize user');
        }

        const data = await response.json();
        connectedUserId = data.userId; // Зберігаємо отриманий ID
        balance = data.balance || 0; // Зберігаємо баланс
        balanceDisplay.textContent = balance.toFixed(2); // Оновлюємо відображення балансу
        userIdDisplay.textContent = `User ID: ${connectedUserId}`; // Відображаємо ID користувача
        
        // Зберігаємо ID користувача в локальному сховищі
        localStorage.setItem('userId', connectedUserId);
    } catch (error) {
        console.error('Error initializing user:', error);
    }
}

// Виклик ініціалізації користувача при завантаженні додатку
initializeUser();

// Додавання обробника для кнопки початку майнінгу
startMiningButton.addEventListener("click", () => {
    startMiningButton.disabled = true;
    startMiningButton.textContent = "Mining in progress ⛏️...";

    let remainingTime = miningDuration;
    const interval = 100;

    miningTimerDisplay.textContent = (remainingTime / 1000).toFixed(2);

    const timer = setInterval(() => {
        remainingTime -= interval;
        const seconds = (remainingTime / 1000).toFixed(2);
        miningTimerDisplay.textContent = seconds;

        if (remainingTime <= 0) {
            clearInterval(timer);
            remainingTime = 0;
            miningTimerDisplay.textContent = (remainingTime / 1000).toFixed(2);
        }
    }, interval);

    setTimeout(() => {
        clearInterval(timer);
        balance += miningPoints;
        balanceDisplay.textContent = balance.toFixed(2);

        // Зберегти новий баланс на сервері
        saveBalance(connectedUserId, balance);

        startMiningButton.disabled = false;
        startMiningButton.textContent = "Start Mining";
    }, miningDuration);
});

// Функція для збереження балансу на сервері
async function saveBalance(userId, newBalance) {
    if (!userId) {
        console.error("User ID is empty. Cannot save balance.");
        return;
    }

    try {
        const response = await fetch('/update_balance', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId, newBalance })
        });
        if (!response.ok) {
            throw new Error('Failed to save balance');
        }
        console.log(`Saved balance for ${userId}: ${newBalance}`);
    } catch (error) {
        console.error('Error saving balance:', error);
    }
}
