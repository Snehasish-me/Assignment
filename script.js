let table = null;
let draggedRow = null;
let draggedColIndex = null;

function createTable() {
    const container = document.getElementById('tableContainer');
    container.innerHTML = '';
    table = document.createElement('table');

    const header = table.createTHead().insertRow();
    for (let i = 0; i < 3; i++) {
        const th = document.createElement('th');
        th.textContent = 'Header ' + (i + 1);
        th.contentEditable = true;
        enableColumnEvents(th);
        header.appendChild(th);
    }

    const tbody = document.createElement('tbody');
    table.appendChild(tbody);

    for (let i = 0; i < 3; i++) {
        addRow();
    }

    container.appendChild(table);
    saveTableToStorage();
}

function addRow() {
    if (!table) return;
    const row = table.querySelector('tbody').insertRow();
    row.draggable = true;
    row.addEventListener('dragstart', rowDragStart);
    row.addEventListener('dragover', rowDragOver);
    row.addEventListener('drop', rowDrop);
    row.addEventListener('dragend', rowDragEnd);
    for (let i = 0; i < table.rows[0].cells.length; i++) {
        const cell = row.insertCell();
        cell.contentEditable = true;
        cell.addEventListener('input', saveTableToStorage);
    }
    saveTableToStorage();
}

function removeRow() {
    if (table && table.rows.length > 1) {
        const tbody = table.querySelector('tbody');
        if (tbody.rows.length > 0) {
            tbody.deleteRow(-1);
            saveTableToStorage();
        }
    }
}

function addColumn() {
    if (!table) return;
    const headers = table.tHead.rows[0];
    const th = document.createElement('th');
    th.textContent = 'Header ' + (headers.cells.length + 1);
    th.contentEditable = true;
    enableColumnEvents(th);
    headers.appendChild(th);

    for (const row of table.tBodies[0].rows) {
        const cell = row.insertCell();
        cell.contentEditable = true;
        cell.addEventListener('input', saveTableToStorage);
    }
    saveTableToStorage();
}

function removeColumn() {
    if (!table || table.rows[0].cells.length === 0) return;
    for (let row of table.rows) {
        row.deleteCell(-1);
    }
    saveTableToStorage();
}

function enableColumnEvents(cell) {
    cell.draggable = true;
    cell.addEventListener('dragstart', columnDragStart);
    cell.addEventListener('dragover', columnDragOver);
    cell.addEventListener('drop', columnDrop);
    cell.addEventListener('dragend', columnDragEnd);
    cell.addEventListener('input', saveTableToStorage);
}

function rowDragStart(e) {
    draggedRow = e.currentTarget;
    e.currentTarget.style.opacity = '0.4';
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.innerHTML);
}

function rowDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const targetRow = e.currentTarget;
    if (targetRow !== draggedRow && targetRow.tagName === 'TR') {
        const rect = targetRow.getBoundingClientRect();
        const midPoint = rect.top + rect.height / 2;
        if (e.clientY < midPoint) {
            targetRow.parentNode.insertBefore(draggedRow, targetRow);
        } else {
            targetRow.parentNode.insertBefore(draggedRow, targetRow.nextSibling);
        }
    }
}

function rowDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    if (draggedRow !== e.currentTarget && e.currentTarget.tagName === 'TR') {
        saveTableToStorage();
    }
}

function rowDragEnd(e) {
    e.currentTarget.style.opacity = '1';
}

function columnDragStart(e) {
    draggedColIndex = Array.from(e.currentTarget.parentNode.children).indexOf(e.currentTarget);
    e.currentTarget.style.opacity = '0.4';
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget.innerHTML);
}

function columnDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function columnDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    const targetCol = e.currentTarget;
    const targetIndex = Array.from(targetCol.parentNode.children).indexOf(targetCol);

    if (draggedColIndex !== targetIndex && targetCol.tagName === 'TH') {
        const rows = table.rows;
        for (let i = 0; i < rows.length; i++) {
            const cells = Array.from(rows[i].cells);
            const draggedCell = cells[draggedColIndex];
            const targetCell = cells[targetIndex];

            if (draggedCell && targetCell) {
                rows[i].insertBefore(draggedCell, targetIndex > draggedColIndex ? targetCell.nextSibling : targetCell);
            }
        }
        saveTableToStorage();
    }
}

function columnDragEnd(e) {
    e.currentTarget.style.opacity = '1';
}

function saveTableToStorage() {
    if (table) {
        localStorage.setItem('savedTable', table.outerHTML);
    }
}

function loadTableFromStorage() {
    const saved = localStorage.getItem('savedTable');
    if (saved) {
        const container = document.getElementById('tableContainer');
        container.innerHTML = saved;
        table = container.querySelector('table');

        for (const th of table.querySelectorAll('th')) {
            th.contentEditable = true;
            enableColumnEvents(th);
        }

        for (const row of table.querySelectorAll('tbody tr')) {
            row.draggable = true;
            row.addEventListener('dragstart', rowDragStart);
            row.addEventListener('dragover', rowDragOver);
            row.addEventListener('drop', rowDrop);
            row.addEventListener('dragend', rowDragEnd);

            for (const cell of row.cells) {
                cell.contentEditable = true;
                cell.addEventListener('input', saveTableToStorage);
            }
        }
    }
}

function clearStorage() {
    localStorage.removeItem('savedTable');
    location.reload();
}

window.onload = loadTableFromStorage;