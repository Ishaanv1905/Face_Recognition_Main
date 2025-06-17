from flask import Blueprint, jsonify
from database import get_db_connection

view_bp = Blueprint('view', __name__)

@view_bp.route('/attendance_logs', methods=['GET'])
def view_attendance():
    with get_db_connection() as conn:
        #cursor = conn.cursor()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM attendance ORDER BY timestamp DESC")
        logs = cursor.fetchall()
        #conn.close()

    attendance_list = []
    for log in logs:
        attendance_list.append({
            'id': log['id'],
            'employee_id': log['employee_id'],
            'name': log['name'],
            'timestamp': log['timestamp']
        })

    return jsonify({'attendance_logs': attendance_list}), 200
