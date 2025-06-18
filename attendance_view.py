from flask import Blueprint, jsonify
from database import get_db_connection
import logging  # Added for logging

view_bp = Blueprint('view', __name__)
logging.basicConfig(level=logging.INFO)  # Added for logging configuration

@view_bp.route('/attendance_logs', methods=['GET'])
def view_attendance():
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM attendance ORDER BY timestamp DESC")
            logs = cursor.fetchall()
        attendance_list = []
        for log in logs:
            attendance_list.append({
                'id': log['id'],
                'employee_id': log['employee_id'],
                'name': log['name'],
                'timestamp': log['timestamp']
            })
        return jsonify({'attendance_logs': attendance_list}), 200
    except Exception as e:
        logging.error(f"Error fetching attendance logs: {e}")  # Added logging
        return jsonify({'error': 'Failed to fetch attendance logs'}), 500  # Added error handling
