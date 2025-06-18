function checkUsersBeforeAttendance() 
{
    const feedback = document.getElementById('indexFeedback');
    if (feedback) feedback.innerText = '';
    fetch('/api/check_users',{method:'GET'})
        .then(response => response.json())
        .then(data => {
            if (data.user_count > 0) 
            {
                window.location.href = '/attendance.html';
            } else {
                if (feedback) {
                    feedback.innerText = 'No registered users found. Please register a user first.';
                } else {
                    alert('No registered users found. Please register a user first.');
                }
            }
        })
        .catch(error => {
            console.error('Error:', error);
            if (feedback) {
                feedback.innerText = 'An error occurred while checking users.';
            } else {
                alert('An error occurred while checking users.');
            }
        });
}
