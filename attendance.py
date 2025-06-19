from flask import Blueprint, request, jsonify
from face_recognition import capture_face
from database import get_db_connection
import io
from PIL import Image
import numpy as np
from datetime import datetime
import logging  

threshold = 0.9
attendance_bp = Blueprint('attendance', __name__)
logging.basicConfig(level=logging.INFO)  

@attendance_bp.route('/mark_attendance', methods=['POST'])
def mark_attendance():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400
        file = request.files['image']
        image_stream = io.BytesIO(file.read())
        img = Image.open(image_stream).convert('RGB')
        captured_embedding = capture_face(frame_input=img)
        if captured_embedding is None:
            return jsonify({'error': 'No face detected'}), 400
        
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT employee_id, name, embedding FROM employees")
            employees = cursor.fetchall()
        min_distance = float('inf')
        
        for emp in employees:
            emp_embedding = np.fromstring(emp['embedding'], sep=' ', dtype=float) 
            distance = np.linalg.norm(emp_embedding - captured_embedding)
            if distance < min_distance:
                min_distance = distance
                matched_employee = emp
                
        if min_distance < threshold:
            return jsonify({"result": {"name": matched_employee['name'],"employee_id": matched_employee['employee_id']}}), 200
        else:
            return jsonify({'error': 'Face not recognized'}), 401
    except Exception as e:
        logging.error(f"Error in mark_attendance: {e}")  # Added logging
        return jsonify({'error': 'Failed to mark attendance'}), 500  # Added error handling

@attendance_bp.route('/make_attendance_entry', methods=['POST'])
def make_attendance_entry():
    try:
        data = request.get_json()
        employee_id = data.get('employee_id')
        name = data.get('name')
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("INSERT INTO attendance (employee_id, name, timestamp) VALUES (?, ?, ?)",
                        (employee_id, name, timestamp))
            conn.commit()
        return jsonify({'result': f'attendance marked for {name}'}), 200
    except Exception as e:
        logging.error(f"Error in make_attendance_entry: {e}")  # Added logging
        return jsonify({'error': 'Failed to mark attendance entry'}), 500  # Added error handling
    