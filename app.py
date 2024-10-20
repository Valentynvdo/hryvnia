import uuid
from flask import Flask, request, jsonify
import psycopg2
from psycopg2 import sql
import os

app = Flask(__name__)

# Налаштування підключення до бази даних
DB_HOST = "dpg-csagdrqj1k6c73cp8hlg-a.oregon-postgres.render.com"
DB_NAME = "balans"
DB_USER = "balans_user"
DB_PASSWORD = "yAlZcxX1tpmZRcVhDyzsOuklsrJCv7Le"
DB_PORT = "5432"

# Функція для підключення до бази даних
def get_db_connection():
    return psycopg2.connect(
        host=DB_HOST,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        port=DB_PORT
    )

# Функція для отримання або створення нового користувача
def get_or_create_user():
    user_id = str(uuid.uuid4())  # Генеруємо унікальний ID
    initial_balance = 100  # Встановіть початковий баланс

    try:
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                # Перевірка, чи існує користувач з цим ID
                cursor.execute("SELECT * FROM users WHERE id = %s;", (user_id,))
                user = cursor.fetchone()

                if not user:
                    # Створити нового користувача
                    cursor.execute("INSERT INTO users (id, balance) VALUES (%s, %s);", (user_id, initial_balance))
                    conn.commit()
                    return user_id, initial_balance
                else:
                    # Повертаємо існуючого користувача
                    return user[0], user[1]  # повертаємо ID та баланс
    except Exception as e:
        print(f"Error occurred: {e}")
        return None, 0

@app.route('/initialize', methods=['GET'])
def initialize_user():
    user_id, balance = get_or_create_user()
    return jsonify({'userId': user_id, 'balance': balance})

@app.route('/get_balance', methods=['POST'])
def get_balance_route():
    user_id = request.json.get('userId')
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("SELECT balance FROM users WHERE id = %s;", (user_id,))
                balance = cursor.fetchone()
                if balance is not None:
                    return jsonify({'balance': balance[0]})
                else:
                    return jsonify({'balance': 0}), 404
    except Exception as e:
        print(f"Error occurred: {e}")
        return jsonify({'error': 'Could not retrieve balance'}), 500

@app.route('/update_balance', methods=['POST'])
def update_balance_route():
    data = request.get_json()
    user_id = data.get('userId')
    new_balance = data.get('newBalance')

    try:
        with get_db_connection() as conn:
            with conn.cursor() as cursor:
                cursor.execute("UPDATE users SET balance = %s WHERE id = %s;", (new_balance, user_id))
                conn.commit()
        return jsonify({'status': 'success'})
    except Exception as e:
        print(f"Error occurred: {e}")
        return jsonify({'error': 'Could not update balance'}), 500

if __name__ == '__main__':
    app.run(debug=True)
