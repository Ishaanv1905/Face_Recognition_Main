let videoStream = null;
let captureInterval = null;
let lastRecognizedName = '';
let lastRecognizedID='';
function startAttendanceCamera() {
    document.getElementById('cameraContainerAttendance').classList.remove('hidden');

    let video = document.getElementById('videoAttendance');
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
            video.srcObject = stream;
            videoStream = stream;

            // Start auto-capture every 2 seconds
            captureInterval = setInterval(() => {
                captureAttendanceFrame(video);
            }, 2000);
        })
        .catch(error => console.error('Error accessing camera:', error));
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
    let formData = new FormData();
    formData.append('image', photoBlob);

    fetch('/api/mark_attendance', {
    method: 'POST',
    body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.result) {
            const { name, employee_id } = data.result;  // Destructure name and id
            lastRecognizedName = name; // You can use this however you want
            lastRecognizedID = employee_id; // Store the ID if needed
            //console.log(`Name: ${name}, ID: ${employee_id}`);
            showConfirmationPopup(); // You can also pass name and id to this function if needed
        } else if (data.error) {
            alert(` error:\n\n${JSON.stringify(data, null, 2)}`);
            console.log('Face not recognized. Trying again...');
            // Continue scanning
        }
    })
    .catch(error => console.error('Error:', error));

}

function showConfirmationPopup() {
    // Stop auto-capturing
    if (captureInterval) {
        clearInterval(captureInterval);
        captureInterval = null;
    }
    document.getElementById('confirmationContainer').classList.remove('hidden');
    // Show confirmation message
    document.getElementById('confirmationMessage').innerText = `Mark attendance for:\nName: ${lastRecognizedName}? \nEmployee ID: ${lastRecognizedID}? `;
    
}

function confirmAttendance() {
    fetch('/api/make_attendance_entry', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: lastRecognizedName,
            employee_id: lastRecognizedId
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.result) {
                alert(`Attendance marked for ${lastRecognizedName}!`);
                window.location.href = '/';
            } else if (data.error) {
                alert(` error:\n\n${JSON.stringify(data, null, 2)}`);
                console.log('Face not recognized. Trying again...');
            }
        })
        .catch(error => console.error('Error:', error));
}


function rejectAttendance() {
    document.getElementById('confirmationContainer').classList.add('hidden');
    document.getElementById('confirmationMessage').innerText = '';

    // Show scanning message
    let scanningMessage = document.createElement('p');
    scanningMessage.id = 'scanningMessage';
    scanningMessage.innerText = 'Okay, scanning face again...';
    document.body.appendChild(scanningMessage);

    // Restart auto-capturing
    let video = document.getElementById('videoAttendance');
    captureInterval = setInterval(() => {
        captureAttendanceFrame(video);
    }, 2000);

    // Remove the scanning message after 2 seconds
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
}
