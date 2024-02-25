document.getElementById('fileInput').addEventListener('change', handleFile);
document.getElementById('saveButton').style.display = 'none';// Oculta botón antes de cargar el archivo

function handleFile(e) {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = function(event) {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        const [part1Data, part2Data] = splitData(jsonData);
        displayPart1(part1Data);
        displayPart2(part2Data);
        document.getElementById('tabButtons').style.display = 'block'; // Mostrar botones después de cargar el archivo
        document.getElementById('fileInput').style.display = 'none'; // Ocultar el botón "Elegir archivo"
        document.getElementById('saveButton').style.display = 'block'; // Mostrar botón después de cargar el archivo
    }

    reader.readAsArrayBuffer(file);
}

function splitData(data) {
    const halfIndex = Math.ceil(data.length / 2);
    const part1 = data.slice(1, halfIndex); // Excluye la primera fila
    const part2 = data.slice(halfIndex);
    return [part1, part2];
}

function displayPart1(data) {
    const tableContainer = document.getElementById('part1TableContainer');
    tableContainer.innerHTML = ''; // Limpiar contenido anterior
    const filteredData = filterData(data);
    displayData(filteredData, tableContainer, 'part1');
}

function displayPart2(data) {
    const tableContainer = document.getElementById('part2TableContainer');
    tableContainer.innerHTML = ''; // Limpiar contenido anterior
    const filteredData = filterData(data);
    displayData(filteredData, tableContainer, 'part2');
}

function filterData(data) {
    // Ordena los datos por la columna 15 (Línea) y luego por la columna 5 (Descripción)
    data.sort((a, b) => {
        if (a[14] === b[14]) {
            return a[4].localeCompare(b[4]);
        }
        return a[14].localeCompare(b[14]);
    });
    return data.map(row => [row[1], row[8], row[2], row[14], row[4], row[6], row[7]]);
}

function displayData(data, container, partId) {
    const table = document.createElement('table');
    const headerRow = document.createElement('tr');

    // Define los encabezados de columna
    const headers = ['Almacén', 'Código', 'Clave', 'Línea', 'Descripción', 'Sistema', 'Físico'];

    headers.forEach(headerText => {
        const header = document.createElement('th');
        header.textContent = headerText;
        headerRow.appendChild(header);
    });

    table.appendChild(headerRow);

    // Añade filas de datos
    data.forEach((rowData, rowIndex) => {
        const row = document.createElement('tr');
        rowData.forEach((cellData, colIndex) => {
            const cell = document.createElement('td');
            cell.textContent = cellData;
            if (colIndex === 6) {
                cell.classList.add('editable');
                cell.setAttribute('data-original-value', cellData);
                cell.setAttribute('data-row', rowIndex);
                cell.setAttribute('data-col', colIndex);
                cell.addEventListener('click', () => handleCellEdit(rowIndex, colIndex, partId));
            }
            row.appendChild(cell);
        });
        table.appendChild(row);
    });

    container.appendChild(table);
}

function handleCellEdit(rowIndex, colIndex, partId) {
    const cell = document.querySelector(`#${partId} [data-row="${rowIndex}"][data-col="${colIndex}"]`);
    const input = document.createElement('input');
    input.classList.add('edit-input');
    input.value = cell.textContent;
    input.addEventListener('blur', () => handleInputBlur(rowIndex, colIndex, input, partId));
    cell.innerHTML = '';
    cell.appendChild(input);
    input.focus();
}

function handleInputBlur(row, col, input, partId) {
    const newValue = input.value.slice(0, 7); // Limitar a 6 caracteres
    const cell = document.querySelector(`#${partId} [data-row="${row}"][data-col="${col}"]`);
    cell.textContent = newValue;
    const originalValue = cell.getAttribute('data-original-value');
    if (newValue !== originalValue) {
        cell.classList.add('error');
    } else {
        cell.classList.remove('error');
    }
}

function saveData(partId) {
    const table = document.getElementById(`${partId}TableContainer`).getElementsByTagName('table')[0];
    const rows = table.rows;
    const data = [];
    for (let i = 1; i < rows.length; i++) {
        const rowData = [];
        for (let j = 0; j < rows[i].cells.length; j++) {
            rowData.push(rows[i].cells[j].textContent);
        }
        data.push(rowData);
    }

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    const filename = prompt('Ingresa el nombre del archivo:');
    if (filename) {
        XLSX.writeFile(wb, `${filename}.xlsx`);
    }
}

function showPart(partNumber) {
    const parts = document.querySelectorAll('.part');
    const buttons = document.querySelectorAll('.tab-button');
    parts.forEach(part => {
        part.classList.remove('active');
    });
    buttons.forEach(button => {
        button.classList.remove('active');
    });
    document.getElementById(`part${partNumber}`).classList.add('active');
    document.getElementById(`part${partNumber}Button`).classList.add('active');
}
