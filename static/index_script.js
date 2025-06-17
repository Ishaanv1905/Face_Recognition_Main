function checkUsersBeforeAttendance() 
{
    fetch('/api/check_users',{method:'GET'})
        .then(response => response.json())
        .then(data => {
            if (data.user_count > 0) 
            {
                window.location.href = '/attendance.html';
            } else {
                alert('No registered users found. Please register a user first.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while checking users.');
        });
}
