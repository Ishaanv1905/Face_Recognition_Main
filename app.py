from flask import Flask, render_template,jsonify
from register import register_bp
from attendance import attendance_bp
from attendance_view import view_bp
from database import get_db_connection
app = Flask(__name__)

app.register_blueprint(register_bp, url_prefix='/api')
app.register_blueprint(attendance_bp, url_prefix='/api')
app.register_blueprint(view_bp, url_prefix='/api')

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/register.html')
def register():
    return render_template('register.html')

@app.route('/attendance.html')
def attendance():
    return render_template('attendance.html')

@app.route('/api/check_users', methods=['GET'])
def check_users():
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM EMPLOYEES")  # Assuming your registration table is 'users'
        user_count = cursor.fetchone()[0]
        print(user_count)
    return jsonify({'user_count': user_count})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

#need to fix- 
#1)attendance tab, alert error message printing
#2)error handling for registration page(user already registered)..make layout better
#3)database 
#4)view attendance feature
#5) face_recognition file 
