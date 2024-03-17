document.getElementById('fileInput').addEventListener('change', handleFile);

function handleFile(e) {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        const filteredData = filterData(jsonData);
        displayData(filteredData);
        document.getElementById('fileInput').style.display = 'none';
    }

    reader.readAsArrayBuffer(file);
}
function filterData(data) {
    const filteredData = [];
    for (let i = 1; i < data.length; i++) {
        filteredData.push([data[i][1], data[i][22], data[i][4], data[i][12], data[i][7]]);
    }
    filteredData.sort((a, b) => {
        if (a[2] === b[2]) {
            return a[3].localeCompare(b[3]);
        }
        return a[2].localeCompare(b[2]);
    });
    return filteredData;
}

function displayData(data) {
    const tableContainer = document.getElementById('tableContainer');
    tableContainer.innerHTML = ''; // Limpiar contenido anterior

    const table = document.createElement('table');
    table.classList.add('inventory-table');

    // Encabezados de columna
    const headers = ['N°', 'Código', 'Clave', 'Descripción', 'Cantidad'];
    const headerRow = document.createElement('tr');
    headers.forEach(headerText => {
        const headerCell = document.createElement('th');
        headerCell.textContent = headerText;
        headerRow.appendChild(headerCell);
    });
    table.appendChild(headerRow);

    data.forEach(rowData => {
        const row = document.createElement('tr');
        rowData.forEach(cellData => {
            const cell = document.createElement('td');
            cell.textContent = cellData;
            row.appendChild(cell);
        });
        table.appendChild(row);
    });

    tableContainer.appendChild(table);
}
