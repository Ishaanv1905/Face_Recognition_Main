
# Facial Recognition Attendance Tracker

**A Python + Flask-based web application that uses face recognition for automatic attendance tracking.**


## Key Features

- Register new users through live webcam feed
- Real-time face detection using `face-recognition` library in under 2s
- Local database (`App_Database.db`) stores user data and attendance logs
- Simple and clean web interface built with HTML, CSS, and JavaScript


## Deployment

Follow the steps below to run this project locally:
### 1. Clone the repository
```bash
git clone https://github.com/Ishaanv1905/Face_Recognition_Main.git
cd face-recognition-attendance
```
### 2. Create and activate a virtual environment
```bash
python -m venv venv
venv\Scripts\activate         # On Windows
source venv/bin/activate      # On macOS/Linux
```
### 3. Install the required packages
```bash
pip install -r requirements.txt
```
### 4. Run the application
```bash
python app.py
```
### 5. Open in your browser
Go to: http://127.0.0.1:5000


## Tech Stack

**Backend:** Python, FlaskAPI

**Face Recognition:** Facenet-Pytorch, OpenCV

**Frontend:** HTML, CSS, JavaScript

**Database:** SQLite


## Authors
**Ishaan Verma**
- Github profile: [@Ishaanv1905](https://github.com/Ishaanv1905)
- LinkedIn: [@IshaanVerma](https://www.linkedin.com/in/ishaan-verma-a834b1305/)

