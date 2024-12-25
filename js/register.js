document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.querySelector('#register-form');

    registerForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const email = document.getElementById('email').value;
        const contact = document.getElementById('contact').value;

        const newUser = { username, password, email, contact };

        // Simpan ke sessionStorage untuk simulasi database
        const users = JSON.parse(sessionStorage.getItem('users')) || [];
        users.push(newUser);
        sessionStorage.setItem('users', JSON.stringify(users));

        // Simpan ke Excel
        saveToExcel(newUser);

        alert("Registrasi berhasil! Silakan login.");
        window.location.href = "index.html"; // Redirect ke login
    });
});

function saveToExcel(user) {
    const data = [
        ["Username", "Password", "Email", "Kontak"],
        [user.username, user.password, user.email, user.contact],
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Users");

    XLSX.writeFile(wb, "users.xlsx");
}
