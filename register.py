from flask import Blueprint, request, jsonify
from face_recognition import capture_face
from database import get_db_connection
import io
from PIL import Image
import numpy as np
#import cv2
import sqlite3

register_bp = Blueprint('register', __name__)

@register_bp.route('/register', methods=['POST'])
def register():
    # Check if all required fields are present
    if not all(key in request.files for key in ['photo1', 'photo2', 'photo3']) or \
       'employee_id' not in request.form or 'name' not in request.form:
        return jsonify({'error': 'Missing required fields'}), 400

    employee_id = request.form['employee_id']
    name = request.form['name']

    embeddings = []

    # Process all three images
    for photo_key in ['photo1', 'photo2', 'photo3']:
        file = request.files[photo_key]
        image_stream = io.BytesIO(file.read())
        img = Image.open(image_stream).convert('RGB')  # Keep as PIL image
        embedding = capture_face(frame_input=img)
        
        if embedding is None:
            return jsonify({'error': f'No face detected in {photo_key}'}), 400
        
        embeddings.append(embedding)

    # Average the embeddings
    avg_embedding = np.mean(embeddings, axis=0)
    embedding_str = ' '.join(map(str, np.array(avg_embedding).flatten()))

    # Save to database
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("INSERT INTO employees (employee_id, name, embedding) VALUES (?, ?, ?)",
                           (employee_id, name, embedding_str))
            conn.commit()
    except sqlite3.IntegrityError:
        return jsonify({'error': 'Employee ID already exists'}), 409

    return jsonify({'result': f'Employee {name} registered successfully'}), 200
