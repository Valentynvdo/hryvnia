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
    balance = get_balance()
    return render_template('index.html', balance=balance)

@app.route('/start_mining', methods=['POST'])
def start_mining():
    update_balance(19)  # Додаємо 19 поінтів до балансу
    return redirect(url_for('index'))

def get_balance():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT balance FROM users WHERE id = 1;")
    balance = cursor.fetchone()[0]  # Отримуємо баланс
    cursor.close()
    conn.close()
    return balance

def update_balance(amount):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("UPDATE users SET balance = balance + %s WHERE id = 1;", (amount,))
    conn.commit()
    cursor.close()
    conn.close()

if __name__ == '__main__':
    app.run(debug=True)
