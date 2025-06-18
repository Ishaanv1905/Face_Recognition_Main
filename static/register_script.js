//js file for managing the frontend of the registration
let capturedImages = [];
let userId = '';
let userName = '';
let photoAttempts = 0; // Added to track number of photo attempts

function setRegisterFeedback(message, isError = false) {
    const feedback = document.getElementById('registerFeedback');
    if (feedback) {
        feedback.innerText = message;
        feedback.style.color = isError ? 'red' : 'green';
    }
}

function check_if_new_user(userId) {
    setRegisterFeedback('');
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
            setRegisterFeedback('Employee ID already exists. Please use a unique ID.', true);
            document.getElementById('userId').value = '';
        } else {
            capturedImages = [];
            photoAttempts = 0; // Reset attempts on new user
            document.getElementById('photoCount').innerText = 'Photos Captured: 0/3'; // Reset counter
            document.getElementById('cameraContainer').classList.remove('hidden');
            let video = document.getElementById('video');
            navigator.mediaDevices.getUserMedia({ video: true })
                .then(stream => {
                    video.srcObject = stream;
                })
                .catch(error => {
                    console.error('Error accessing camera:', error);
                    setRegisterFeedback('Could not access the camera.', true);
                });
        }
    })
    .catch(error => {
        console.error('Error:', error);
        setRegisterFeedback('Integrity check failed.', true);
    });
}

// Start camera for registration
function startCamera() {
    setRegisterFeedback('');
    userId = document.getElementById('userId').value.trim();
    userName = document.getElementById('userName').value.trim();

    if (userId === '' || userName === '') {
        setRegisterFeedback('Please enter your name and employee ID.', true);
        return;
    }

    // Only call the integrity check here
    check_if_new_user(userId);
}

// Capture photo for registration
function capturePhoto() {
    setRegisterFeedback('');
    if (capturedImages.length >= 3) {
        setRegisterFeedback('You can only capture up to 3 photos.', true); // Prevent more than 3 photos
        return;
    }
    let video = document.getElementById('video');
    let canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 240;
    let context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(blob => {
        capturedImages.push(blob);
        photoAttempts++;
        document.getElementById('photoCount').innerText = `Photos Captured: ${capturedImages.length}/3`;

        if (capturedImages.length === 3) {
            sendRegistration();
        }
    }, 'image/jpeg');
}

// Send registration data
function sendRegistration() {
    setRegisterFeedback('Registering user...');
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
        if(data.result)
        {
            setRegisterFeedback(data.result);
            resetCamera();
        } else if (data.error) {
            // If error is about a specific photo, reset process and close camera
            if (data.error.includes('No face detected') || data.error.includes('Invalid image')) {
                setRegisterFeedback(data.error + ' Please try again. All photos will be retaken.', true); // Notify user
                resetCamera(); // Close camera and reset counter
                capturedImages = [];
                photoAttempts = 0;
                document.getElementById('photoCount').innerText = 'Photos Captured: 0/3';
            } else {
                setRegisterFeedback(data.error, true);
            }
        }
    })
    .catch(error => {
        console.error('Error:', error);
        setRegisterFeedback('Registration failed.', true);
        resetCamera();
        capturedImages = [];
        photoAttempts = 0;
        document.getElementById('photoCount').innerText = 'Photos Captured: 0/3';
    });
    document.getElementById('userId').value = '';
    document.getElementById('userName').value = '';
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
