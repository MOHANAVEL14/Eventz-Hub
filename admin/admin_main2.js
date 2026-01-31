import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import {
    getAuth,
    onAuthStateChanged,
    signOut,
    setPersistence,
    browserLocalPersistence
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import {
    getFirestore,
    collection,
    query,
    where,
    getDocs,
    doc,
    updateDoc,
    Timestamp
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

// ✅ Correct Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyBloB9afFkfiMnxjQFH5N0WCehAsqWJ0oc",
    authDomain: "event-hub-439ab.firebaseapp.com",
    projectId: "event-hub-439ab",
    storageBucket: "event-hub-439ab.appspot.com", // ✅ Fixed
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
        const q = query(collection(db, "event_requests"), where("status", "==", "pending"));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            container.innerHTML = `<p class="text-center text-xl text-gray-700">🎉 No pending event requests right now!</p>`;
            return;
        }

        container.innerHTML = '';

        querySnapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const docId = docSnap.id;
            const formattedDate = data.eventDate || 'N/A';

            container.innerHTML += `
                <div id="request-${docId}" class="request-card bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
                    <h3 class="text-xl font-bold text-gray-800 mb-2">${data.eventName}</h3>
                    <p class="text-sm text-gray-600"><strong>Type:</strong> ${data.eventType} | <strong>Date:</strong> ${formattedDate}</p>
                    <p class="text-sm text-gray-600 mb-3"><strong>Location:</strong> ${data.eventLocation}</p>
                    <p class="text-sm text-gray-600 mb-4"><strong>Organizer:</strong> ${data.organizerEmail} | ${data.organizerPhone}</p>
                    
                    <div class="flex space-x-3">
                        <button type="button" data-id="${docId}" data-action="accept"
                            class="action-btn flex-1 py-2 rounded text-white font-semibold btn-accept hover:bg-emerald-600">
                            Accept
                        </button>
                        <button type="button" data-id="${docId}" data-action="reject"
                            class="action-btn flex-1 py-2 rounded text-white font-semibold btn-reject hover:bg-red-600">
                            Reject
                        </button>
                    </div>
                </div>
            `;
        });

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

    if (!confirm(message)) return;

    if (!auth.currentUser) {
        alert("User not authenticated. Please log in again.");
        return;
    }

    try {
        const docRef = doc(db, 'event_requests', docId);

        await updateDoc(docRef, {
            status: newStatus,
            reviewedAt: Timestamp.fromDate(new Date()), // ✅ Fixed
            reviewedBy: auth.currentUser.uid
        });

        alert(`Event ${newStatus} successfully!`);
        document.getElementById(`request-${docId}`).remove();

        if (document.getElementById('requestsContainer').childElementCount === 0) {
            document.getElementById('requestsContainer').innerHTML = `<p class="text-center text-xl text-gray-700">🎉 No pending event requests right now!</p>`;
        }

    } catch (error) {
        console.error(`Error processing ${action}:`, error);
        alert(`Failed to ${action} event. See console for details.`);
    }
}
fetchAndDisplayRequests();

// ----------------- AUTH AND INITIALIZATION -----------------

// const logoutBtn = document.getElementById('adminLogoutBtn');
// if (logoutBtn) {
//     logoutBtn.addEventListener('click', async () => {
//         try {
//             await signOut(auth);
//             window.location.href = "../index.html";
//         } catch (error) {
//             console.error("Logout error:", error);
//         }
//     });
// }

// ✅ Set persistence and check auth
// setPersistence(auth, browserLocalPersistence)
//     .then(() => {
//         onAuthStateChanged(auth, (user) => {
//             if (user) {
//                 console.log("Admin User is signed in:", user.email);
//                 fetchAndDisplayRequests();
//             } else {
//                 alert("Access Denied. Please log in as an Admin.");
//                 window.location.href = "../admin_login.html";
//             }
//         });
//     })
//     .catch((error) => {
//         console.error("Auth persistence setup failed:", error);
//     });