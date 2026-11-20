window.electronAPI.retrieveJSON((jsoninfo) => {
    const tbody = document.getElementById('tablehistory');

    tbody.innerHTML = '';

    for (let i = 0; i < jsoninfo.history.length; i++) {
        const row = document.createElement('tr');

        const urlCell = document.createElement('td');
        const timeCell = document.createElement('td');

        urlCell.textContent = jsoninfo.history[i].url || 'N/A';
        timeCell.textContent = jsoninfo.history[i].visitedAt || 'N/A';

        row.appendChild(urlCell);
        row.appendChild(timeCell);

        tbody.appendChild(row);
    }
});
