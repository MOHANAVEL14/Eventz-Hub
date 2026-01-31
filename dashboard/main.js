// main.js - Logic for the public homepage (index.html)

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
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
  apiKey: "AIzaSyBloB9afFkfiMnxjQFH5N0WCehAsqWJ0oc",
  authDomain: "event-hub-439ab.firebaseapp.com",
  projectId: "event-hub-439ab",
  storageBucket: "event-hub-439ab.firebasestorage.app",
  messagingSenderId: "1099014263723",
  appId: "1:1099014263723:web:034962c3e732fe48c038ee",
  measurementId: "G-5829WVGYZB"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app); 

// Fallback gradients for event cards without an image
const GRADIENT_COLORS = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', 
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
];

/**
 * Loads approved events from Firestore and dynamically builds the HTML cards.
 */
async function loadApprovedEvents() {
    // 🔑 Target the new container ID
    const eventsGrid = document.getElementById('dynamicEventsGrid');
    if (!eventsGrid) return;

    eventsGrid.innerHTML = '<p style="text-align: center; padding: 20px; color: var(--text-secondary);">Loading amazing events...</p>';

    try {
        const today = new Date().toISOString().split('T')[0];
        // Query: Only get events that the admin has approved
        const q = query(
            collection(db, "event_requests"),
            //orderBy("eventDate", "asc"),
            //where("eventDate", ">=", today),
            where("status", "==", "approved")
        );
        const querySnapshot = await getDocs(q);

        eventsGrid.innerHTML = ''; // Clear loading message

        if (querySnapshot.empty) {
            eventsGrid.innerHTML = '<p style="text-align: center; padding: 20px; font-size: 1.125rem; color: var(--text-primary);">😔 No upcoming events found right now.</p>';
            return;
        }

        // 1. Prepare to fetch all necessary data (including images) concurrently
        const eventPromises = querySnapshot.docs.map(async (docSnap) => {
            const event = docSnap.data();
            let imageUrl = null;
            
            if (event.imagePath) { 
                try {
                    const imageRef = ref(storage, event.imagePath);
                    imageUrl = await getDownloadURL(imageRef);
                } catch (error) {
                    console.warn(`Could not fetch image for ${event.eventName}. Falling back to gradient.`, error.message);
                }
            }
            return { id: docSnap.id, ...event, imageUrl };
        });

        const eventsWithImages = await Promise.all(eventPromises);
        
        // 2. Render the HTML using the fetched data
        eventsWithImages.forEach((event) => {
            // Date formatting
            const date = new Date(event.eventDate + 'T00:00:00');
            const formattedDate = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
            
            const randomGradient = GRADIENT_COLORS[Math.floor(Math.random() * GRADIENT_COLORS.length)];

            // Choose background style
            const imageStyle = event.imageUrl 
                ? `background-image: url('${event.imageUrl}'); background-size: cover; background-position: center;`
                : `background: ${randomGradient};`;

            // HTML Structure (Aligned to your existing event-card template)
            const eventCardHTML = `
                <div class="event-card" data-id="${event.id}">
                    <div class="event-image" style="${imageStyle}">
                        <span class="event-badge">${event.eventType || 'Event'}</span> 
                    </div>
                    <div class="event-content">
                        <h3>${event.eventName}</h3>
                        <p class="event-date">📅 ${formattedDate}</p>
                        <p class="event-location">📍 ${event.eventLocation}</p>
                        
                        <p class="event-organizer" style="font-size: 0.8rem; color: #9ca3af;">
                            Hosted by: ${event.organizerName || event.organizerEmail || 'Organizer'}
                        </p>

                        <button class="btn btn-small btn-primary view-details-btn" data-id="${event.id}">
                            View Details
                        </button>
                    </div>
                </div>
            `;
            
            eventsGrid.insertAdjacentHTML('beforeend', eventCardHTML);
        });

        // 3. Attach a listener for the detail button
        attachViewDetailsListener(eventsWithImages);

    } catch (error) {
        console.error("Error loading approved events:", error);
        eventsGrid.innerHTML = `<p style="text-align: center; padding: 20px; color: red;">Error loading events. Please check your Firebase connection.</p>`;
    }
}

// ----------------- VIEW DETAILS POPUP -----------------

function attachViewDetailsListener(events) {
    document.querySelectorAll('.view-details-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const eventId = e.target.getAttribute('data-id');
            const eventDetails = events.find(ev => ev.id === eventId);
            
            if (eventDetails) {
                // Display all available data in a simple alert for demonstration
                let message = `
                    Event: ${eventDetails.eventName}
                    Type: ${eventDetails.eventType}
                    Date: ${eventDetails.eventDate}
                    Location: ${eventDetails.eventLocation}
                    
                    --- Contact ---
                    Organizer: ${eventDetails.organizerName || 'N/A'}
                    Email: ${eventDetails.organizerEmail || 'N/A'}
                    Phone: ${eventDetails.organizerPhone || 'N/A'}
                `;
                alert(message);
            }
        });
    });
}

// ----------------- INITIALIZATION -----------------

// 🔑 Call the function immediately to load the events when the page loads
loadApprovedEvents();

// You can add the theme toggle logic here if it was in your original main.js
/*
document.querySelector('.theme-toggle').addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
});
*/