document.addEventListener('DOMContentLoaded', function () {
    const feedback = document.getElementById('attendanceViewFeedback');
    if (feedback) feedback.innerText = '';
    fetch('/api/attendance_logs')
        .then(response => response.json())
        .then(data => {
            const tableBody = document.querySelector('#attendanceTable tbody');
            const logs = data.attendance_logs;

            if (logs.length === 0) {
                const row = document.createElement('tr');
                const cell = document.createElement('td');
                cell.colSpan = 4;
                cell.innerText = 'No attendance records found.';
                row.appendChild(cell);
                tableBody.appendChild(row);
                if (feedback) feedback.innerText = 'No attendance records found.';
            } else {
                logs.forEach(log => {
                    const row = document.createElement('tr');

                    const idCell = document.createElement('td');
                    idCell.innerText = log.id;
                    row.appendChild(idCell);

                    const employeeIdCell = document.createElement('td');
                    employeeIdCell.innerText = log.employee_id;
                    row.appendChild(employeeIdCell);

                    const nameCell = document.createElement('td');
                    nameCell.innerText = log.name;
                    row.appendChild(nameCell);

                    const timestampCell = document.createElement('td');
                    timestampCell.innerText = log.timestamp;
                    row.appendChild(timestampCell);

                    tableBody.appendChild(row);
                });
                if (feedback) feedback.innerText = '';
            }
        })
        .catch(error => {
            console.error('Error fetching attendance logs:', error);
            if (feedback) {
                feedback.innerText = 'Failed to load attendance logs.';
            } else {
                alert('Failed to load attendance logs.');
            }
        });
});
