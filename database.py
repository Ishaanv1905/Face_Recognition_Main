import sqlite3
import logging  # Added for logging
logging.basicConfig(level=logging.INFO)  # Added for logging configuration

def init_db():
    try:
        with sqlite3.connect('App_Database.db') as conn:
            cursor = conn.cursor()
            cursor.execute('''CREATE TABLE IF NOT EXISTS employees (
                                employee_id TEXT PRIMARY KEY,
                                name TEXT,
                                embedding TEXT)''')
            
            cursor.execute('''CREATE TABLE IF NOT EXISTS attendance (
                                id INTEGER PRIMARY KEY AUTOINCREMENT,
                                employee_id TEXT,
                                name TEXT,
                                timestamp TEXT)''')
            conn.commit()
        logging.info("Database initialized successfully.")  # Added logging
    except Exception as e:
        logging.error(f"Error initializing database: {e}")  # Added logging

def get_db_connection():
    try:
        conn = sqlite3.connect('App_Database.db', check_same_thread=False)
        conn.row_factory = sqlite3.Row
        return conn
    except Exception as e:
        logging.error(f"Error getting DB connection: {e}")  # Added logging
        raise  # Added to propagate error


