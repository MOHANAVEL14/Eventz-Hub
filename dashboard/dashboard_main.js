// dashboard_main.js - Logic for the user dashboard

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
    getDocs 
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js"; 
import { 
    getStorage, 
    ref, 
    getDownloadURL 
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-storage.js";


// 🛑 IMPORTANT: Replace with your actual Firebase configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY", // <--- REPLACE THIS
    authDomain: "YOUR_AUTH_DOMAIN", // <--- REPLACE THIS
    projectId: "event-hub-439ab",
    storageBucket: "event-hub-439ab.appspot.com", // Ensure this is correct for storage
    messagingSenderId: "1099014263723",
    appId: "1:1099014263723:web:034962c3e732fe48c038ee",
    measurementId: "G-5829WVGYZB"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app); // Initialize Storage service

// ----------------- EVENT RETRIEVAL AND RENDERING -----------------

/**
 * Loads approved events from Firestore and displays them in the dashboard grid.
 */
async function loadApprovedEvents() {
    const eventsGrid = document.getElementById('upcomingEventsGrid');
    if (!eventsGrid) return;

    eventsGrid.innerHTML = '<p class="text-center text-gray-500 col-span-full">Loading events...</p>';

    try {
        // Query only for documents where status is 'approved'
        const q = query(
            collection(db, "event_requests"), 
            where("status", "==", "approved")
        );
        const querySnapshot = await getDocs(q);

        eventsGrid.innerHTML = ''; // Clear loading message

        if (querySnapshot.empty) {
            eventsGrid.innerHTML = '<p class="text-center text-lg text-gray-700 col-span-full">😔 No upcoming events found.</p>';
            return;
        }

        const gradients = [
            'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // Purple/Blue
            'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', // Pink/Red
            'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', // Light Blue/Cyan
            'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'  // Pink/Yellow
        ];

        // Fetch all download URLs concurrently
        const eventPromises = querySnapshot.docs.map(async (docSnap) => {
            const event = docSnap.data();
            let imageUrl = null;
            
            // Check if a file path is saved in Firestore
            if (event.imagePath) { 
                try {
                    const imageRef = ref(storage, event.imagePath);
                    imageUrl = await getDownloadURL(imageRef);
                } catch (error) {
                    console.warn(`Could not fetch image for ${event.eventName}. Using placeholder color.`, error.message);
                }
            }
            return { id: docSnap.id, ...event, imageUrl };
        });

        const eventsWithImages = await Promise.all(eventPromises);

        // RENDER THE HTML
        eventsWithImages.forEach((event) => {
            // Handle date formatting
            const date = new Date(event.eventDate + 'T00:00:00');
            const formattedDate = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
            
            const randomGradient = gradients[Math.floor(Math.random() * gradients.length)];

            // Set background style: image if available, otherwise gradient color
            const imageStyle = event.imageUrl 
                ? `background-image: url('${event.imageUrl}'); background-size: cover; background-position: center;`
                : `background: ${randomGradient};`;

            const eventCardHTML = `
                <div class="event-card bg-white" data-id="${event.id}">
                    <div class="event-image" style="${imageStyle}">
                        <span class="event-badge">${event.eventType || 'Event'}</span> 
                    </div>
                    <div class="event-content p-4 space-y-2">
                        <h3 class="text-xl font-semibold text-gray-900">${event.eventName}</h3>
                        <p class="event-date text-sm text-gray-600">📅 ${formattedDate}</p>
                        <p class="event-location text-sm text-gray-600">📍 ${event.eventLocation}</p>
                        
                        <p class="text-xs text-gray-500 truncate">
                            👤 ${event.organizerEmail || 'No Email'}
                        </p>
                        <p class="text-xs text-gray-500">
                            📞 ${event.organizerPhone || 'No Phone'}
                        </p>
                        
                        <button class="w-full mt-2 py-2 text-sm text-white font-medium bg-blue-600 rounded hover:bg-blue-700 view-details-btn" data-id="${event.id}">
                            View Details
                        </button>
                    </div>
                </div>
            `;
            
            eventsGrid.insertAdjacentHTML('beforeend', eventCardHTML);
        });

        // Attach listener for detail viewing
        attachViewDetailsListener(eventsWithImages);

    } catch (error) {
        console.error("Critical Firebase Error loading approved events:", error);
        eventsGrid.innerHTML = `<p class="text-center text-red-500 col-span-full">Error loading events. Check console.</p>`;
    }
}

// ----------------- VIEW DETAILS POPUP (Using simple alert) -----------------

function attachViewDetailsListener(events) {
    document.querySelectorAll('.view-details-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const eventId = e.target.getAttribute('data-id');
            const eventDetails = events.find(ev => ev.id === eventId);
            
            if (eventDetails) {
                // You should use a modal/popup HTML element here for production!
                let message = `
                    Event Details:
                    -----------------------------
                    Name: ${eventDetails.eventName}
                    Type: ${eventDetails.eventType}
                    Date: ${eventDetails.eventDate}
                    Location: ${eventDetails.eventLocation}
                    
                    --- Contact Info ---
                    Email: ${eventDetails.organizerEmail || 'N/A'}
                    Phone: ${eventDetails.organizerPhone || 'N/A'}
                `;
                alert(message);
            }
        });
    });
}

// ----------------- AUTHENTICATION AND INITIAL CALL -----------------

// User Logout
document.getElementById('userLogoutBtn')?.addEventListener('click', async () => {
    try {
        await signOut(auth);
        // Redirect to a common login/home page
        window.location.href = "../index.html"; 
    } catch (error) {
        console.error("Logout error:", error);
        alert("Failed to log out.");
    }
});


// Auth Check: Ensure the user is logged in
onAuthStateChanged(auth, (user) => {
    // Determine if the current page is the login page to avoid infinite loops
    const isLoginPage = window.location.pathname.includes('login.html');
    
    if (user) {
        // User is signed in. Load the events.
        console.log("User signed in:", user.email);
        loadApprovedEvents(); 
    } else {
        // User is not signed in. Redirect to login if not already there.
        if (!isLoginPage) {
            window.location.href = "../login.html"; 
        }
    }
});