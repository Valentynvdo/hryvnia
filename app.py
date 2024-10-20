from flask import Flask, request, jsonify, render_template
import psycopg2
import os
import uuid

app = Flask(__name__)

# Налаштування підключення до бази даних
DB_HOST = os.getenv("DB_HOST", "dpg-csagdrqj1k6c73cp8hlg-a.oregon-postgres.render.com")
DB_NAME = os.getenv("DB_NAME", "balans")
DB_USER = os.getenv("DB_USER", "balans_user")
DB_PASSWORD = os.getenv("DB_PASSWORD", "yAlZcxX1tpmZRcVhDyzsOuklsrJCv7Le")
DB_PORT = os.getenv("DB_PORT", "5432")

# Функція для підключення до бази даних
def get_db_connection():
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD,
            port=DB_PORT
        )
        return conn
    except psycopg2.Error as e:
        print(f"Error connecting to the database: {e}")
        return None

# Функція для отримання або створення нового користувача
def get_or_create_user(user_id=None):
    initial_balance = 100  # Початковий баланс користувача

    try:
        conn = get_db_connection()
        if conn is None:
            return None, 0

        with conn.cursor() as cursor:
            if user_id:
                # Перевіряємо чи користувач існує
                cursor.execute("SELECT id, balance FROM users WHERE id = %s;", (user_id,))
                user = cursor.fetchone()
                if user:
                    return user[0], user[1]  # Повертаємо ID та баланс
                else:
                    return None, 0  # Користувач не знайдений
            else:
                user_id = str(uuid.uuid4())  # Генерація унікального ID, якщо ID не надано

            # Створюємо нового користувача
            cursor.execute("INSERT INTO users (id, balance) VALUES (%s, %s);", (user_id, initial_balance))
            conn.commit()
            return user_id, initial_balance
    except Exception as e:
        print(f"Error occurred: {e}")
        return None, 0
    finally:
        if conn:
            conn.close()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/initialize', methods=['GET'])
def initialize_user():
    user_id = request.args.get('userId')  # Отримання userId з параметрів запиту
    user_id, balance = get_or_create_user(user_id)
    if user_id:
        return jsonify({'userId': user_id, 'balance': balance})
    else:
        return jsonify({'error': 'Could not initialize user'}), 500

@app.route('/get_balance', methods=['POST'])
def get_balance_route():
    user_id = request.json.get('userId')
    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'error': 'Could not connect to database'}), 500

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
    finally:
        if conn:
            conn.close()

@app.route('/update_balance', methods=['POST'])
def update_balance_route():
    data = request.get_json()
    user_id = data.get('userId')
    new_balance = data.get('newBalance')

    try:
        conn = get_db_connection()
        if conn is None:
            return jsonify({'error': 'Could not connect to database'}), 500

        with conn.cursor() as cursor:
            cursor.execute("UPDATE users SET balance = %s WHERE id = %s;", (new_balance, user_id))
            conn.commit()
        return jsonify({'status': 'success'})
    except Exception as e:
        print(f"Error occurred: {e}")
        return jsonify({'error': 'Could not update balance'}), 500
    finally:
        if conn:
            conn.close()

if __name__ == '__main__':
    app.run(debug=True)