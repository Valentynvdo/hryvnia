// Ініціалізація TonConnectUI
const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
    manifestUrl: 'https://ton-connect.github.io/demo-dapp-with-react-ui/tonconnect-manifest.json',
    buttonRootId: 'connect-button'
});

// Змінні для відстеження статусу підключення та балансу
let connectedUserAddress = null; // Зберігаємо адресу підключеного користувача
let balance = 0;
const miningDuration = 8000; // 8 секунд
const miningPoints = 19; // Кількість поінтів за майнінг

// Знайти елементи на сторінці
const balanceDisplay = document.getElementById("coin-balance");
const startMiningButton = document.getElementById("start-mining-btn");
const miningTimerDisplay = document.getElementById("mining-timer");

// Відслідковування статусу підключення
tonConnectUI.onStatusChange(status => {
    console.log("TonConnectUI status changed:", status); // Логування статусу
    if (status.connected) {
        alert(`Connected: ${status.address}`);
        connectedUserAddress = status.address; // Зберігаємо адресу користувача
        console.log("Connected user address set to:", connectedUserAddress); // Логування адреси
        loadBalance(connectedUserAddress); // Завантажуємо баланс при підключенні
    } else {
        alert("Disconnected");
        connectedUserAddress = null; // Обнуляємо адресу при відключенні
    }
});

// Додавання обробника для кнопки початку майнінгу
startMiningButton.addEventListener("click", () => {
    console.log("Start Mining button clicked"); // Лог для перевірки натискання кнопки

    if (!connectedUserAddress) {
        alert("Please connect your wallet first.");
        console.log("No wallet connected. Mining cannot start.");
        return;
    }

    console.log("Connected wallet address found, starting mining..."); // Лог, що користувач підключений

    startMiningButton.disabled = true; // Вимкнути кнопку
    startMiningButton.textContent = "Mining in progress ⛏️...";

    let remainingTime = miningDuration; // Залишковий час
    const interval = 100; // Оновлення таймера кожні 100 мс

    // Очищення попереднього значення таймера
    miningTimerDisplay.textContent = (remainingTime / 1000).toFixed(2); // Відображаємо 8 секунд

    const timer = setInterval(() => {
        remainingTime -= interval; // Зменшуємо залишковий час
        const seconds = (remainingTime / 1000).toFixed(2); // Форматування до двох десяткових
        miningTimerDisplay.textContent = seconds; // Оновлення таймера

        // Якщо час вичерпано, зупиняємо таймер
        if (remainingTime <= 0) {
            clearInterval(timer);
            remainingTime = 0; // Гарантуємо, що залишковий час не буде меншим за 0
            miningTimerDisplay.textContent = (remainingTime / 1000).toFixed(2); // Оновлюємо таймер до 0
        }
    }, interval);

    setTimeout(() => {
        clearInterval(timer); // Зупинити таймер
        balance += miningPoints; // Додаємо монети до балансу
        balanceDisplay.textContent = balance.toFixed(2); // Оновити відображення балансу

        // Зберегти новий баланс на сервері
        saveBalance(connectedUserAddress, balance);

        startMiningButton.disabled = false; // Увімкнути кнопку
        startMiningButton.textContent = "Start Mining"; // Відновити текст кнопки
    }, miningDuration);
});

// Функція для збереження балансу на сервері
async function saveBalance(userId, newBalance) {
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

// Функція для завантаження балансу з сервера
async function loadBalance(userId) {
    try {
        const response = await fetch(`/get_balance?userId=${userId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        balance = data.balance; // Зберегти баланс
        balanceDisplay.textContent = balance.toFixed(2); // Оновити відображення балансу
    } catch (error) {
        console.error('Error loading balance:', error);
    }
}
