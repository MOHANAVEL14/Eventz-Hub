// main.js - Event Submission and Firebase Setup

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { 
    getFirestore,
    doc,        
    setDoc,
    collection
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js"; 

// 🛑 IMPORTANT: Replace with your actual Firebase configuration
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
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // Note: We don't sign in here, but we need auth initialized
const db = getFirestore(app);

// Get the submission button
const submitEventBtn = document.getElementById('submitEventBtn');

if (submitEventBtn) {
    submitEventBtn.addEventListener('click', async (e) => {
        e.preventDefault();

        // 1. Get input values from the form
        const eventName = document.getElementById('sname').value;
        const eventType = document.getElementById('eventTypeSelect').value;
        const eventLocation = document.getElementById('s-location').value;
        const organizerPhone = document.getElementById('s-phone').value;
        const eventDate = document.querySelector('[name="event-date"]').value; // Select by name as the class is generic
        const organizerEmail = document.getElementById('semail').value;

        // Simple Validation Check
        if (!eventName || eventType === '' || !eventLocation || !organizerEmail) {
            alert("Please fill out all required fields.");
            return;
        }

        // 2. Prepare Event Data for Firestore
        const eventData = {
            eventName: eventName,
            eventType: eventType,
            eventLocation: eventLocation,
            organizerPhone: organizerPhone,
            eventDate: eventDate,
            organizerEmail: organizerEmail,
            status: 'pending', // Key field for Admin to filter
            submittedAt: new Date(),
            // You might want to include the current user's UID if they are logged in
            // submittedBy: auth.currentUser ? auth.currentUser.uid : 'anonymous'
        };

        try {
            // 3. Save Event Request to a Firestore Collection
            // Creates a unique document ID using collection(db, 'collectionName')
            const eventsCollection = collection(db, 'event_requests');
            // The doc() function without a second argument auto-generates a unique ID
            await setDoc(doc(eventsCollection), eventData); 
            
            alert("Event request submitted successfully! Awaiting Admin approval.");
            console.log("Event data stored successfully in Firestore.");
            
            // Clear the form
            e.target.closest('form').reset();
            
            // Optionally, redirect the user back to the main user page:
             window.location.href = "../dashboard/index.html"; 

        } catch (error) {
            console.error("Error during event submission:", error);
            alert(`Error: Failed to submit event. ${error.message}`);
        }
    });
}