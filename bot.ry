import os
import json
from telegram import Update
from telegram.ext import Updater, CommandHandler, CallbackContext

# Шлях до файлу, в якому зберігатимуться ID користувачів
USER_DATA_FILE = 'user_ids.json'

# Функція для завантаження даних користувачів з файлу
def load_user_data():
    if os.path.exists(USER_DATA_FILE):
        with open(USER_DATA_FILE, 'r') as f:
            return json.load(f)
    return {}

# Функція для збереження даних користувачів у файлі
def save_user_data(data):
    with open(USER_DATA_FILE, 'w') as f:
        json.dump(data, f)

# Завантажуємо існуючі ID
user_ids = load_user_data()

def start(update: Update, context: CallbackContext) -> None:
    user_id = update.message.from_user.id
    if str(user_id) not in user_ids:
        user_ids[str(user_id)] = {"id": user_id}  # Зберігаємо ID користувача
        save_user_data(user_ids)  # Зберігаємо дані у файл
    update.message.reply_text(f"Ваш ID: {user_id}")

def main():
    # Заміна "YOUR_TOKEN" на ваш токен бота
    updater = Updater(7729204726:AAGcMQQ5g6Q1iDC5TBD-IH1SZI_zzLAZLmM)
    updater.dispatcher.add_handler(CommandHandler("start", start))

    updater.start_polling()
    updater.idle()

if __name__ == '__main__':
    main()
