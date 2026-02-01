// auth.js

// 1. Your Firebase Configuration (Get this from your Firebase Project Settings)
const firebaseConfig = {
  apiKey: "AIzaSyBloB9afFkfiMnxjQFH5N0WCehAsqWJ0oc",
  authDomain: "event-hub-439ab.firebaseapp.com",
  projectId: "event-hub-439ab",
  storageBucket: "event-hub-439ab.firebasestorage.app",
  messagingSenderId: "1099014263723",
  appId: "1:1099014263723:web:034962c3e732fe48c038ee",
  measurementId: "G-5829WVGYZB"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const auth = app.auth();
const db = app.firestore(); // Firestore for roles

// Helper function for redirection
const redirectToDashboard = (user) => {
    // Check for admin status immediately after sign-in
    db.collection("admins").doc(user.uid).get()
        .then((doc) => {
            if (doc.exists) {
                // Admin role found!
                window.location.href = "admin-dashboard.html";
            } else {
                // Standard user
                window.location.href = "user-dashboard.html";
            }
        })
        .catch(error => {
            console.error("Error checking admin status:", error);
            // Default to user dashboard if there's an error
            window.location.href = "user-dashboard.html"; 
        });
}
// (Continuation of auth.js after initialization)

// --- Tab Switching Logic ---
document.addEventListener('DOMContentLoaded', () => {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove 'active' from all buttons and forms
            tabButtons.forEach(btn => btn.classList.remove('active'));
            loginForm.classList.remove('active-form');
            signupForm.classList.remove('active-form');

            // Add 'active' to the clicked button and its corresponding form
            button.classList.add('active');
            const target = button.getAttribute('data-tab');
            document.getElementById(`${target}-form`).classList.add('active-form');

            // Clear previous errors
            document.getElementById('login-error').textContent = '';
            document.getElementById('signup-error').textContent = '';
        });
    });

    // --- Sign Up Logic ---
    signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        const errorElement = document.getElementById('signup-error');
        errorElement.textContent = ''; // Clear previous errors

        auth.createUserWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Signed up successfully!
                alert("Account created successfully! Redirecting...");
                redirectToDashboard(userCredential.user);
            })
            .catch((error) => {
                // Handle Errors here.
                const errorCode = error.code;
                const errorMessage = error.message;
                errorElement.textContent = `Sign Up Failed: ${errorMessage}`;
                console.error(errorCode, errorMessage);
            });
    });

    // --- Sign In Logic ---
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const errorElement = document.getElementById('login-error');
        errorElement.textContent = ''; // Clear previous errors

        auth.signInWithEmailAndPassword(email, password)
            .then((userCredential) => {
                // Signed in successfully!
                redirectToDashboard(userCredential.user);
            })
            .catch((error) => {
                // Handle Errors here.
                const errorCode = error.code;
                const errorMessage = error.message;
                errorElement.textContent = `Login Failed: Invalid email or password.`;
                console.error(errorCode, errorMessage);
            });
    });
});