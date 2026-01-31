const ADMIN_USERNAME = "admin";
const ADMIN_PASSWORD = "12345"; 
document.getElementById('adminLoginForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const usernameInput = document.getElementById('adminUsername').value;
    const passwordInput = document.getElementById('adminPassword').value;
    const errorDisplay = document.getElementById('errorMsg');
    if (usernameInput === ADMIN_USERNAME && passwordInput === ADMIN_PASSWORD) {
        
        errorDisplay.textContent = "";
        console.log("Admin logged in successfully!");
        
        window.location.href = "../admin/admin_dashboard.html"; 

    } else {

        errorDisplay.textContent = "Invalid username or password.";
        console.warn("Admin login failed: Invalid credentials.");
        document.getElementById('adminUsername').value = '';
        document.getElementById('adminPassword').value = '';
    }
});