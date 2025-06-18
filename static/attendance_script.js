let videoStream = null;
let captureInterval = null;
let lastRecognizedName = '';
let lastRecognizedID='';

function setAttendanceFeedback(message, isError = false) {
    const feedback = document.getElementById('attendanceFeedback');
    if (feedback) {
        feedback.innerText = message;
        feedback.style.color = isError ? 'red' : 'green';
    }
}

function startAttendanceCamera() {
    setAttendanceFeedback('');
    document.getElementById('cameraContainerAttendance').classList.remove('hidden');
    let video = document.getElementById('videoAttendance');
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
            videoStream = stream;
            captureInterval = setInterval(() => {
                captureAttendanceFrame(video);
            }, 2000);
        })
        .catch(error => {
            console.error('Error accessing camera:', error);
            setAttendanceFeedback('Could not access the camera.', true);
        });
}

function captureAttendanceFrame(video) {
    let canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 240;
    let context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(blob => {
        sendAttendance(blob);
    }, 'image/jpeg');
}

function sendAttendance(photoBlob) {
    setAttendanceFeedback('Recognizing face...');
    let formData = new FormData();
    formData.append('image', photoBlob);
    fetch('/api/mark_attendance', {
    method: 'POST',
    body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.result) {
            const { name, employee_id } = data.result;  
            lastRecognizedName = name; 
            lastRecognizedID = employee_id; 
            showConfirmationPopup(); 
            setAttendanceFeedback('');
        } else if (data.error) 
            {
            setAttendanceFeedback(data.error, true);
            console.log('Face not recognized. Trying again...');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        setAttendanceFeedback('Attendance recognition failed.', true);
    });
}

function showConfirmationPopup() {
    if (captureInterval) {
        clearInterval(captureInterval);
        captureInterval = null;
    }
    document.getElementById('confirmationContainer').classList.remove('hidden');
    document.getElementById('confirmationMessage').innerText = `Mark attendance for: Name- ${lastRecognizedName}   Employee ID- ${lastRecognizedID} `;
}

function confirmAttendance() 
{
    setAttendanceFeedback('Marking attendance...');
    fetch('/api/make_attendance_entry', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: lastRecognizedName,
            employee_id: lastRecognizedID
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.result) 
                {   
                setAttendanceFeedback(`Attendance marked for ${lastRecognizedName}!`);
                window.location.href = '/';
            } else if (data.error) {
                setAttendanceFeedback(data.error, true);
                console.log('Face not recognized. Trying again...');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            setAttendanceFeedback('Attendance marking failed.', true);
        });
}

function rejectAttendance() {
    setAttendanceFeedback('');
    document.getElementById('confirmationContainer').classList.add('hidden');
    document.getElementById('confirmationMessage').innerText = '';
    let scanningMessage = document.createElement('p');
    scanningMessage.id = 'scanningMessage';
    scanningMessage.innerText = 'Okay, scanning face again...';
    document.body.appendChild(scanningMessage);
    let video = document.getElementById('videoAttendance');
    captureInterval = setInterval(() => {
        captureAttendanceFrame(video);
    }, 2000);
    setTimeout(() => {
        let msg = document.getElementById('scanningMessage');
        if (msg) {
            msg.remove();
        }
    }, 2000);
}

function resetAttendanceCamera() {
    if (captureInterval) {
        clearInterval(captureInterval);
        captureInterval = null;
    }
    if (videoStream) {
        let tracks = videoStream.getTracks();
        tracks.forEach(track => track.stop());
    }
    document.getElementById('cameraContainerAttendance').classList.add('hidden');
    document.getElementById('confirmationContainer').classList.add('hidden');
    document.getElementById('confirmationMessage').innerText = '';
    setAttendanceFeedback('');
}
