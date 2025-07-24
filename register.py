from flask import Blueprint, request, jsonify
from face_recognition import capture_face
from database import get_db_connection
import io
from PIL import Image
import numpy as np
import logging  # Added for logging

register_bp = Blueprint('register', __name__)
logging.basicConfig(level=logging.INFO)  # Added for logging configuration

@register_bp.route('/register', methods=['POST'])
def register():
    try:
        if not all(key in request.files for key in ['photo1', 'photo2', 'photo3']) or \
        'employee_id' not in request.form or 'name' not in request.form:
            return jsonify({'error': 'Missing required fields'}), 400
        employee_id = request.form['employee_id']
        name = request.form['name']
        embeddings = []
        
        for photo_key in ['photo1', 'photo2', 'photo3']:
            file = request.files[photo_key]
            try:
                image_stream = io.BytesIO(file.read())
                img = Image.open(image_stream).convert('RGB')
            except Exception as e:
                logging.error(f"Invalid image for {photo_key}: {e}")  # Added logging
                return jsonify({'error': f'Invalid image for {photo_key}'}), 400
            embedding = capture_face(frame_input=img)
            if embedding is None:
                return jsonify({'error': f'No face detected in {photo_key}'}), 400
            embeddings.append(embedding)
            
        avg_embedding = np.mean(embeddings, axis=0)
        embedding_str = ' '.join(map(str, np.array(avg_embedding).flatten()))
        
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("INSERT INTO employees (employee_id, name, embedding) VALUES (?, ?, ?)",
                            (employee_id, name, embedding_str))
            conn.commit()
        logging.info(f"Employee {name} registered successfully.")  # Added logging
        return jsonify({'result': f'Employee {name} registered successfully'}), 200
    
    except Exception as e:
        logging.error(f"Error in register: {e}")  # Added logging
        return jsonify({'error': 'Failed to register employee'}), 500  # Added error handling


@register_bp.route('/integrity_check', methods=['POST'])
def integrity_check():
    try:
        data = request.get_json()
        employee_id = data.get('employee_id')
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM employees WHERE employee_id = ?", (employee_id,))
            result = cursor.fetchone()
            if result:
                return jsonify({'exists': True}), 200
            else:
                return jsonify({'exists': False}), 200
    except Exception as e:
        logging.error(f"Error in integrity_check: {e}")  # Added logging
        return jsonify({'error': str(e)}), 500  # Added error handling

    