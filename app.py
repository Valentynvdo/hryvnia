from flask import Flask, render_template, request, redirect, url_for
import psycopg2

app = Flask(__name__)

# Налаштування підключення до бази даних
DB_HOST = "dpg-csagdrqj1k6c73cp8hlg-a.oregon-postgres.render.com"
DB_NAME = "balans"
DB_USER = "balans_user"
DB_PASSWORD = "yAlZcxX1tpmZRcVhDyzsOuklsrJCv7Le"
DB_PORT = "5432"  # за замовчуванням для PostgreSQL

# Функція для підключення до бази даних
def get_db_connection():
    conn = psycopg2.connect(
        host=DB_HOST,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        port=DB_PORT
    )
    return conn

@app.route('/')
def index():
    balance = get_balance()  # Отримати баланс
    return render_template('index.html', balance=balance)

@app.route('/start_mining', methods=['POST'])
def start_mining():
    increment_balance(19)  # Додаємо 19 поінтів до балансу
    return redirect(url_for('index'))

def get_balance():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT balance FROM users WHERE id = 1;")
    balance = cursor.fetchone()[0]  # Отримуємо баланс
    cursor.close()
    conn.close()
    return balance

def increment_balance(amount):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET balance = balance + %s WHERE id = 1;", (amount,))
    conn.commit()
    cursor.close()
    conn.close()

@app.route('/update_balance', methods=['POST'])
def update_balance_route():
    data = request.get_json()
    user_id = data.get('userId')  # Ви повинні передати ID користувача
    new_balance = data.get('newBalance')
    # Тепер вам потрібно змінити логіку для оновлення балансу конкретного користувача
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET balance = %s WHERE id = %s;", (new_balance, user_id))
    conn.commit()
    cursor.close()
    conn.close()
    return {'status': 'success'}

@app.route('/get_balance', methods=['GET'])
def get_balance_route():
    user_id = request.args.get('userId')  # Отримати ID користувача
    # Для отримання балансу конкретного користувача
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT balance FROM users WHERE id = %s;", (user_id,))
    balance = cursor.fetchone()[0]  # Отримуємо баланс
    cursor.close()
    conn.close()
    return {'balance': balance}

if __name__ == '__main__':
    app.run(debug=True)
