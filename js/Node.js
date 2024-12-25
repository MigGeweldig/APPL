const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const XLSX = require('xlsx');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Endpoint register
app.post('/register', (req, res) => {
    const { username, email, password } = req.body;

    // Buka atau buat file Excel
    const filePath = './users.xlsx';
    let workbook;
    let worksheet;

    if (fs.existsSync(filePath)) {
        // Buka workbook jika sudah ada
        workbook = XLSX.readFile(filePath);
        worksheet = workbook.Sheets['Users'] || workbook.Sheets[workbook.SheetNames[0]];
    } else {
        // Buat workbook dan worksheet baru
        workbook = XLSX.utils.book_new();
        worksheet = XLSX.utils.json_to_sheet([]);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');
    }

    // Tambahkan data baru
    const data = XLSX.utils.sheet_to_json(worksheet);
    data.push({ Username: username, Email: email, Password: password });

    // Perbarui worksheet
    const updatedWorksheet = XLSX.utils.json_to_sheet(data);
    workbook.Sheets['Users'] = updatedWorksheet;

    // Simpan file Excel
    XLSX.writeFile(workbook, filePath);

    res.status(200).send('Registrasi berhasil dan data disimpan ke Excel!');
});

// Jalankan server
app.listen(3000, () => {
    console.log('Server berjalan di http://localhost:3000');
});