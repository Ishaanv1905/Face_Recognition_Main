let capturedImages = [];
let userId = '';
let userName = '';


function check_if_new_user(userId) {
    fetch('/api/integrity_check', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ employee_id: userId })
    })
    .then(response => response.json())
    .then(data => {
        if (data.exists) {
            alert('Employee ID already exists. Please use a unique ID.');
        } else {
            // If ID is unique, start camera
            capturedImages = [];
            document.getElementById('cameraContainer').classList.remove('hidden');

            let video = document.getElementById('video');
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(stream => {
                    video.srcObject = stream;
                })
                .catch(error => {
                    console.error('Error accessing camera:', error);
                    alert('Could not access the camera.');
                });
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Integrity check failed.');
    });
}

// Start camera for registration
function startCamera() {
    userId = document.getElementById('userId').value.trim();
    userName = document.getElementById('userName').value.trim();

    if (userId === '' || userName === '') {
        alert('Please enter your name and employee ID.');
        return;
    }

    // Only call the integrity check here
    check_if_new_user(userId);
}

// Capture photo for registration
function capturePhoto() {
    let video = document.getElementById('video');
    let canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 240;
    let context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(blob => {
        capturedImages.push(blob);
        document.getElementById('photoCount').innerText = `Photos Captured: ${capturedImages.length}/3`;

        if (capturedImages.length === 3) {
            sendRegistration();
        }
    }, 'image/jpeg');
}

// Send registration data
function sendRegistration() {
    let formData = new FormData();
    formData.append('employee_id', userId);
    formData.append('name', userName);
    capturedImages.forEach((image, index) => {
        formData.append(`photo${index + 1}`, image);
    });

    fetch('/api/register', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        // Show the entire JSON response in the alert (pretty-printed)
        alert(`Registration Complete:\n\n${JSON.stringify(data, null, 2)}`);
        resetCamera();
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Registration failed.');
    });
}

// Stop camera and reset
function resetCamera() {
    let video = document.getElementById('video');
    if (video && video.srcObject) {
        let tracks = video.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        video.srcObject = null;
    }

    document.getElementById('cameraContainer').classList.add('hidden');
    document.getElementById('photoCount').innerText = 'Photos Captured: 0/3';
}
