from flask import Flask, render_template, jsonify, request, redirect, url_for
from flask_socketio import SocketIO

app = Flask(__name__)
socketio = SocketIO(app)

# Змінна для зберігання груп та їх повідомлень
groups = {}

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/w-ai')
def w_ai():
    return render_template('можливості.html')

@app.route('/спільнота')
def community():
    return render_template('спільнота.html', groups=groups)
    
@app.route('/wallet')
def wallet():
    return render_template('wallet.html')
    
@app.route('/create_group', methods=['POST'])
def create_group():
    group_name = request.form['group_name']
    if group_name not in groups:
        groups[group_name] = []  # Ініціалізуємо список повідомлень для нової групи
    return redirect(url_for('community'))  # Переходьте назад до спільноти

@app.route('/messages/<group_name>')
def chat(group_name):
    return render_template('messages.html', group_name=group_name)

@app.route('/send_message', methods=['POST'])
def send_message():
    data = request.json
    group_name = data['group_name']
    message = data['message']
    
    if group_name in groups:
        groups[group_name].append(message)  # Додаємо повідомлення до групи
        return jsonify(success=True)
    
    return jsonify(success=False)

@app.route('/get_messages/<group_name>', methods=['GET'])
def get_messages(group_name):
    if group_name in groups:
        return jsonify(groups[group_name])  # Повертаємо повідомлення конкретної групи
    return jsonify([])  # Повертаємо порожній список, якщо групи немає

@socketio.on('send_message')
def handle_message(data):
    group_name = data['group_name']
    message = data['message']
    
    if group_name in groups:
        groups[group_name].append(message)  # Додаємо повідомлення до групи
        socketio.emit('new_message', message, room=group_name)  # Відправляємо нове повідомлення всім підписникам

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=8000, debug=True)
