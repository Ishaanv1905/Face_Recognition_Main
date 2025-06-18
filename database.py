import sqlite3

def init_db():
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

def get_db_connection():
    conn = sqlite3.connect('App_Database.db', check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn


