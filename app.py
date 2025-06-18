#this is the main python file that is like a home page for the backend
from flask import Flask, render_template,jsonify, request
from register import register_bp
from attendance import attendance_bp
from attendance_view import view_bp
from database import get_db_connection
import logging  # Added for logging
from flask import abort  # Added for error handling
logging.basicConfig(level=logging.INFO)  # Added for logging configuration
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

@app.route('/attendance_view.html')
def attendance_view():
    return render_template('attendance_view.html')

@app.route('/api/check_users', methods=['GET'])
def check_users():
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM EMPLOYEES")  # Assuming your registration table is 'users'
            user_count = cursor.fetchone()[0]
            logging.info(f"User count: {user_count}")  # Added logging
        return jsonify({'user_count': user_count})
    except Exception as e:
        logging.error(f"Error checking users: {e}")  # Added logging
        return jsonify({'error': 'Failed to check users'}), 500  # Added error handling

@app.errorhandler(404)
def not_found_error(error):
    return jsonify({'error': 'Not found'}), 404  # Added error handler

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500  # Added error handler

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

#need to fix- 
#1)attendance tab, alert error message printing
#2)registration page make layout better
#3)database 
#4)view attendance feature
#5) face_recognition file 
