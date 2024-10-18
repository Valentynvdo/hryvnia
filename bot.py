from flask import Flask, jsonify
import os
import json
from telegram import Update
from telegram.ext import Updater, CommandHandler, CallbackContext

app = Flask(__name__)

USER_DATA_FILE = 'user_ids.json'

def load_user_data():
    if os.path.exists(USER_DATA_FILE):
        with open(USER_DATA_FILE, 'r') as f:
            return json.load(f)
    return {}

def save_user_data(data):
    with open(USER_DATA_FILE, 'w') as f:
        json.dump(data, f)

user_ids = load_user_data()

@app.route('/users', methods=['GET'])
def get_users():
    return jsonify(user_ids)

def start(update: Update, context: CallbackContext) -> None:
    user_id = update.message.from_user.id
    if str(user_id) not in user_ids:
        user_ids[str(user_id)] = {"id": user_id}
        save_user_data(user_ids)
    update.message.reply_text(f"Ваш ID: {user_id}")

def main():
    # Заміна "YOUR_TOKEN" на ваш токен бота
    updater = Updater(7729204726:AAGcMQQ5g6Q1iDC5TBD-IH1SZI_zzLAZLmM)
    updater.dispatcher.add_handler(CommandHandler("start", start))

    # Запускаємо Flask
    app.run(port=5000)  # Задайте порт для Flask

    updater.start_polling()
    updater.idle()

if __name__ == '__main__':
    main()
