// Deteksi halaman saat DOM selesai dimuat
document.addEventListener('DOMContentLoaded', () => {
    const page = document.body.getAttribute('data-page');
    if (page === "login") {
        setupLoginPage();
    } else if (page === "dashboard") {
        setupDashboardPage();
    } else if (page === "catatan") {
        setupCatatanPage();
    } else if (page === "laporan") {
        setupLaporanPage();
    } else if (page === "reminder") {
        setupReminderPage();
    }
});

// Fungsi umum untuk logout dan kembali ke halaman login
function setupDashboardPage() {
    console.log("Dashboard siap!");

    // Menambahkan event listener untuk tombol logout
    const logoutButton = document.querySelector('.logout-button');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            sessionStorage.removeItem('currentUser'); // Menghapus data session pengguna
            window.location.href = "login.html"; // Redirect ke halaman login
        });
    }
}

// Fungsi untuk halaman Login
function setupLoginPage() {
    const loginForm = document.querySelector('#login-form');
    const registerButton = document.querySelector('#register-button');

    // Event listener untuk login
    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        // Ambil database pengguna dari sessionStorage
        const users = JSON.parse(sessionStorage.getItem('users')) || [];
        const user = users.find(user => user.username === username && user.password === password);

        if (user) {
            sessionStorage.setItem('currentUser', username);
            alert("Login berhasil!");
            window.location.href = "dashboard.html"; // Redirect ke dashboard
        } else {
            alert("Login gagal! Silakan register jika belum memiliki akun.");
        }
    });

    // Redirect ke halaman register
    registerButton.addEventListener('click', () => {
        window.location.href = "register.html";
    });
}

// Fungsi untuk halaman Catatan
function setupCatatanPage() {
    const keluarButton = document.querySelector('.keluar-button');
    if (keluarButton) {
        keluarButton.addEventListener('click', redirectToDashboard);
    }

    const form = document.querySelector('#catatan-form');
    if (form) {
        form.addEventListener('submit', (event) => {
            event.preventDefault(); // Mencegah form submit

            const date = document.getElementById('date').value;
            const amount = document.getElementById('amount').value;
            const type = document.getElementById('type').value;

            // Format nominal menjadi format Rp
            const formattedAmount = formatRupiah(amount);

            // Menyimpan catatan baru ke sessionStorage
            const catatanBaru = { date, amount: formattedAmount, type };
            const catatanList = JSON.parse(sessionStorage.getItem('catatanList')) || [];
            catatanList.push(catatanBaru);
            sessionStorage.setItem('catatanList', JSON.stringify(catatanList));

            alert("Catatan berhasil disimpan!");
            form.reset();
            tampilkanCatatan(); // Menampilkan ulang daftar catatan
        });
    }

    // Menampilkan catatan yang disimpan
    tampilkanCatatan();
}

// Fungsi untuk menampilkan catatan dari sessionStorage
function tampilkanCatatan() {
    const catatanList = JSON.parse(sessionStorage.getItem('catatanList')) || [];
    const catatanListElement = document.getElementById('catatan-list');

    // Kosongkan list terlebih dahulu
    catatanListElement.innerHTML = '';

    // Menampilkan pesan jika tidak ada catatan
    if (catatanList.length === 0) {
        catatanListElement.innerHTML = '<li>Belum ada catatan.</li>';
        return;
    }

    // Menambahkan catatan yang disimpan ke daftar
    catatanList.forEach((catatan, index) => {
        const li = document.createElement('li');
        li.textContent = `${catatan.date} - ${catatan.amount} (${catatan.type})`;

        // Tambahkan tombol hapus untuk setiap catatan
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Hapus';
        deleteButton.addEventListener('click', () => {
            catatanList.splice(index, 1); // Hapus catatan dari array
            sessionStorage.setItem('catatanList', JSON.stringify(catatanList)); // Perbarui sessionStorage
            tampilkanCatatan(); // Tampilkan ulang daftar catatan
        });

        li.appendChild(deleteButton);
        catatanListElement.appendChild(li);
    });
}

// Fungsi untuk memformat nominal menjadi format Rp
function formatRupiah(amount) {
    const numberString = amount.replace(/[^,\d]/g, ''); // Menghapus karakter selain angka
    const split = numberString.split(',');
    let remainder = split[0].length % 3;
    let rupiah = split[0].substr(0, remainder);
    const thousands = split[0].substr(remainder).match(/\d{3}/g);

    if (thousands) {
        const separator = remainder ? '.' : '';
        rupiah += separator + thousands.join('.');
    }

    rupiah = split[1] ? rupiah + ',' + split[1] : rupiah;
    return 'Rp. ' + rupiah;
}

function setupLaporanPage() {
    const filterSelect = document.getElementById('filter');

    if (filterSelect) {
        filterSelect.addEventListener('change', () => {
            const selectedFilter = filterSelect.value;
            tampilkanGrafikKeuangan(selectedFilter);
        });
    }

    tampilkanGrafikKeuangan("bulan-ini"); // Tampilkan grafik default (bulan ini)
}

let chart;

function tampilkanGrafikKeuangan(filter) {
    const catatanList = JSON.parse(sessionStorage.getItem('catatanList')) || [];

    if (catatanList.length === 0) {
        alert("Tidak ada catatan untuk ditampilkan di grafik!");
        return;
    }

    // Tentukan bulan dan tahun berdasarkan filter
    const sekarang = new Date();
    let awalBulan, akhirBulan;

    if (filter === "bulan-ini") {
        awalBulan = new Date(sekarang.getFullYear(), sekarang.getMonth(), 1);
        akhirBulan = new Date(sekarang.getFullYear(), sekarang.getMonth() + 1, 0);
    } else if (filter === "bulan-lalu") {
        awalBulan = new Date(sekarang.getFullYear(), sekarang.getMonth() - 1, 1);
        akhirBulan = new Date(sekarang.getFullYear(), sekarang.getMonth(), 0);
    } else if (filter === "3-bulan-lalu") {
        awalBulan = new Date(sekarang.getFullYear(), sekarang.getMonth() - 3, 1);
        akhirBulan = new Date(sekarang.getFullYear(), sekarang.getMonth() - 2, 0);
    }

    // Filter catatan berdasarkan tanggal
    const catatanTerfilter = catatanList.filter(catatan => {
        const catatanTanggal = new Date(catatan.date);
        return catatanTanggal >= awalBulan && catatanTanggal <= akhirBulan;
    });

    if (catatanTerfilter.length === 0) {
        alert("Tidak ada catatan untuk periode yang dipilih!");
        return;
    }

    // Siapkan data untuk grafik
    const pemasukanData = [0, 0, 0, 0];  // Data pemasukan per minggu
    const pengeluaranData = [0, 0, 0, 0]; // Data pengeluaran per minggu
    const weeks = ["Minggu 1", "Minggu 2", "Minggu 3", "Minggu 4"];

    catatanTerfilter.forEach(catatan => {
        const tanggal = new Date(catatan.date);
        const weekIndex = Math.floor((tanggal.getDate() - 1) / 7);
        if (weekIndex >= 0 && weekIndex < 4) { // Pastikan indeks minggu valid
            if (catatan.type === "pemasukan") {
                pemasukanData[weekIndex] += parseInt(catatan.amount.replace(/\D/g, ''));
            } else if (catatan.type === "pengeluaran") {
                pengeluaranData[weekIndex] += parseInt(catatan.amount.replace(/\D/g, ''));
            }
        }
    });

    // Data untuk grafik
    const dataKeuangan = {
        labels: weeks,
        datasets: [
            {
                label: "Pemasukan",
                data: pemasukanData,
                backgroundColor: "rgba(75, 192, 192, 0.2)",
                borderColor: "rgba(75, 192, 192, 1)",
                borderWidth: 1,
            },
            {
                label: "Pengeluaran",
                data: pengeluaranData,
                backgroundColor: "rgba(255, 99, 132, 0.2)",
                borderColor: "rgba(255, 99, 132, 1)",
                borderWidth: 1,
            },
        ],
    };

    // Konfigurasi grafik
    const configKeuangan = {
        type: "bar",
        data: dataKeuangan,
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: "top",
                },
            },
        },
    };

    // Memeriksa apakah grafik sudah ada
    const ctx = document.getElementById("keuanganChart").getContext("2d");
    if (chart) {
        // Jika grafik sudah ada, perbarui data dan render ulang
        chart.data = dataKeuangan;
        chart.update(); // Perbarui grafik
    } else {
        // Jika grafik belum ada, buat grafik baru
        chart = new Chart(ctx, configKeuangan);
    }
}

function setupReminderPage() {
    const form = document.getElementById('reminder-form');
    const reminderListElement = document.getElementById('reminder-list');

    // Event listener untuk form submit
    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const billName = document.getElementById('bill-name').value;
        const dueDate = document.getElementById('due-date').value;
        const billAmount = document.getElementById('bill-amount').value;

        if (billName && dueDate && billAmount) {
            // Buat objek tagihan baru
            const newBill = { name: billName, date: dueDate, amount: formatRupiah(billAmount) };

            // Ambil tagihan dari sessionStorage
            const reminders = JSON.parse(sessionStorage.getItem('reminders')) || [];
            
            // Tambahkan tagihan baru ke daftar
            reminders.push(newBill);
            sessionStorage.setItem('reminders', JSON.stringify(reminders));

            // Tampilkan daftar tagihan
            displayReminders(reminders, reminderListElement);

            // Reset form
            form.reset();
        } else {
            alert('Harap isi semua bidang!');
        }
    });

    // Tampilkan daftar tagihan saat halaman dimuat
    const savedReminders = JSON.parse(sessionStorage.getItem('reminders')) || [];
    displayReminders(savedReminders, reminderListElement);
}

// Fungsi untuk menampilkan daftar tagihan
function displayReminders(reminders, reminderListElement) {
    reminderListElement.innerHTML = ''; // Kosongkan daftar
    if (reminders.length === 0) {
        reminderListElement.innerHTML = '<li>Belum ada tagihan.</li>';
        return;
    }
    reminders.forEach((reminder, index) => {
        const li = document.createElement('li');
        li.textContent = `${reminder.name} - ${reminder.date} - ${reminder.amount}`;
        
        // Tambahkan tombol hapus untuk setiap tagihan
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Hapus';
        deleteButton.addEventListener('click', () => {
            reminders.splice(index, 1); // Hapus tagihan dari array
            sessionStorage.setItem('reminders', JSON.stringify(reminders)); // Perbarui sessionStorage
            displayReminders(reminders, reminderListElement); // Tampilkan ulang daftar
        });

        li.appendChild(deleteButton);
        reminderListElement.appendChild(li);
    });
}


// Fungsi umum untuk redirect ke dashboard
function redirectToDashboard() {
    window.location.href = "dashboard.html";
}

// Fungsi untuk logout
function logout() {
    // Redirect ke halaman login
    window.location.href = "index.html";
}