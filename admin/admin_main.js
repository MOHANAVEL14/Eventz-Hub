// admin_main.js

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { 
    getAuth, 
    onAuthStateChanged, 
    signOut 
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    query, 
    where, 
    getDocs, 
    doc, 
    updateDoc 
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js"; 

// Your web app's Firebase configuration (Replace with your actual config)
const firebaseConfig = {
    apiKey: "AIzaSyBloB9afFkfiMnxjQFH5N0WCehAsqWJ0oc",
    authDomain: "event-hub-439ab.firebaseapp.com",
    projectId: "event-hub-439ab",
    storageBucket: "event-hub-439ab.firebasestorage.app",
    messagingSenderId: "1099014263723",
    appId: "1:1099014263723:web:034962c3e732fe48c038ee",
    measurementId: "G-5829WVGYZB"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ----------------- FETCHING AND DISPLAYING REQUESTS -----------------

async function fetchAndDisplayRequests() {
    const container = document.getElementById('requestsContainer');
    if (!container) return;
    container.innerHTML = `<p id="loadingMessage" class="text-center text-gray-500">Loading pending requests...</p>`;

    try {
        // Query only for documents where status is 'pending'
        const q = query(collection(db, "event_requests"), where("status", "==", "pending"));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            container.innerHTML = `<p class="text-center text-xl text-gray-700">🎉 No pending event requests right now!</p>`;
            return;
        }

        container.innerHTML = ''; // Clear loading message

        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const docId = docSnap.id;
            const formattedDate = data.eventDate || 'N/A'; // Simple date display

            container.innerHTML += `
                <div id="request-${docId}" class="request-card bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
                    <h3 class="text-xl font-bold text-gray-800 mb-2">${data.eventName}</h3>
                    <p class="text-sm text-gray-600"><strong>Type:</strong> ${data.eventType} | <strong>Date:</strong> ${formattedDate}</p>
                    <p class="text-sm text-gray-600 mb-3"><strong>Location:</strong> ${data.eventLocation}</p>
                    <p class="text-sm text-gray-600 mb-4"><strong>Organizer:</strong> ${data.organizerEmail} | ${data.organizerPhone}</p>
                    
                    <div class="flex space-x-3">
                        <button data-id="${docId}" data-action="accept" 
                            class="action-btn flex-1 py-2 rounded text-white font-semibold btn-accept hover:bg-emerald-600">
                            Accept
                        </button>
                        <button data-id="${docId}" data-action="reject" 
                            class="action-btn flex-1 py-2 rounded text-white font-semibold btn-reject hover:bg-red-600">
                            Reject
                        </button>
                    </div>
                </div>
            `;
        });
        
        // Attach event listeners after cards are created
        attachActionListeners();

    } catch (error) {
        console.error("Error fetching event requests:", error);
        container.innerHTML = `<p class="text-center text-red-500">❌ Error loading requests.</p>`;
    }
}

// ----------------- ACCEPT/REJECT LOGIC -----------------

function attachActionListeners() {
    document.querySelectorAll('.action-btn').forEach(button => {
        button.addEventListener('click', handleRequestAction);
    });
}

async function handleRequestAction(e) {
    const docId = e.target.getAttribute('data-id');
    const action = e.target.getAttribute('data-action');
    const newStatus = (action === 'accept' ? 'approved' : 'rejected');
    const message = `Are you sure you want to ${action} this event?`;

    if (!confirm(message)) {
        return;
    }

    try {
        const docRef = doc(db, 'event_requests', docId);
        
        // Update the status in the Firestore document
        await updateDoc(docRef, {
            status: newStatus,
            reviewedAt: new Date(),
            reviewedBy: auth.currentUser.uid // Log which admin reviewed it
        });
        
        alert(`Event ${newStatus} successfully!`);
        
        // If approved, you would typically copy this data to a separate 'approved_events' collection
        // For simplicity here, we only update the status.

        // Remove the card from the view
        document.getElementById(`request-${docId}`).remove();
        
        // Re-check if the list is empty
        if(document.getElementById('requestsContainer').childElementCount === 0) {
            document.getElementById('requestsContainer').innerHTML = `<p class="text-center text-xl text-gray-700">🎉 No pending event requests right now!</p>`;
        }

    } catch (error) {
        console.error(`Error processing ${action}:`, error);
        alert(`Failed to ${action} event. See console for details.`);
    }
}

// ----------------- AUTH AND INITIALIZATION -----------------

// Admin Logout
document.getElementById('adminLogoutBtn')?.addEventListener('click', async () => {
    try {
        await signOut(auth);
        window.location.href = "../index.html"; // Redirect to the main selection page
    } catch (error) {
        console.error("Logout error:", error);
    }
});


// Simple Auth Check (You need to implement robust Admin role checking later)
onAuthStateChanged(auth, (user) => {
    // For this simple example, we assume anyone logged in here is an admin.
    // **In a real app, you must check user.uid against an 'admins' list in Firestore!**
    if (user) {
        console.log("Admin User is signed in:", user.email);
        fetchAndDisplayRequests(); // Load data only when authenticated
    } else {
        // Redirect if not logged in
        alert("Access Denied. Please log in as an Admin.");
        window.location.href = "../admin_login.html"; 
    }
});