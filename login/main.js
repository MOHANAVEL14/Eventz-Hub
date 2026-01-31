// Import the functions you need from the SDKs you need
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-analytics.js";
import { getAuth, GoogleAuthProvider, signInWithPopup,onAuthStateChanged ,createUserWithEmailAndPassword,signInWithEmailAndPassword} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js"; // Correct import for Auth
import { 
    getFirestore, // for initializing Firestore
    doc,        // for creating a document reference
    setDoc      // for writing data to Firestore
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
// ... your code continues
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);
const auth = getAuth(app); // Pass the initialized app to getAuth
auth.languageCode = 'en';
const provider = new GoogleAuthProvider();
const googleBtn = document.getElementById('googleBtn');

googleBtn.addEventListener('click', (e) => {
  e.preventDefault(); // Prevent default form submission if applicable
  signInWithPopup(auth, provider)
    .then((result) => {
      // This gives you a Google Access Token. You can use it to access the Google API.
      const credential = GoogleAuthProvider.credentialFromResult(result);
      const token = credential.accessToken;
      // The signed-in user info.
      const user = result.user;
      console.log("User signed in:", user);
      console.log("Access Token:", token);
      window.location.href = "../dashboard/index.html";
      // You can now use the user object to update your UI or store user data
    }).catch((error) => {
      // Handle Errors here.
      const errorCode = error.code;
      const errorMessage = error.message;
      // The email of the user's account used.
      const email = error.customData.email;
      // The AuthCredential type that was used.
      const credential = GoogleAuthProvider.credentialFromError(error);
      console.error("Error during Google Sign-In:", errorCode, errorMessage);
    });
});
function updateUserProfile(user) {
  const userName = user.displayName;
  const userEmail = user.email;
  // Update your UI or store user data as needed
  const userProfilePicture = user.photoURL;
  console.log("User Name:", userName);
  console.log("User Email:", userEmail);
  console.log("Profile Picture URL:", userProfilePicture);
}
const currentPagePath = window.location.pathname;
const isLoginPage = currentPagePath.includes('/login/login.html');
const isDashboardPage = currentPagePath.includes('/dashboard/index.html');

onAuthStateChanged(auth, (user) => {
  if (user) {
    // User is signed in
    updateUserProfile(user);
    
    // Only redirect to dashboard if the user is NOT already on the dashboard
    if (!isDashboardPage) {
        window.location.href = "../dashboard/index.html";
    }
    const uid = user.uid;
    return uid;
  } else {
    // User is NOT signed in
    
    // Only redirect to login if the user is NOT already on the login page
    if (!isLoginPage) {
        // alert("No user is signed in"); // Keep this line commented out
        window.location.href = "../login/login.html";
    }
  }
});
const signUpBtn = document.getElementById('signupBtn');
signUpBtn.addEventListener('click', (e) => {
  e.preventDefault();
  const email=document.getElementById('semail').value;
  const password=document.getElementById('spassword').value;
  const name=document.getElementById('sname').value;
  const db=getFirestore();
  createUserWithEmailAndPassword(auth,email,password)
  .then((userCredential)=>{
    // Signed in 
    const user=userCredential.user;
    const userData={
      email:email,
      name:name,
      uid:user.uid
    };
    const docRef=doc(db,'users',user.uid);
    setDoc(docRef,userData)
    .then(()=>{
      console.log("User data stored successfully in Firestore");
      window.location.href="../dashboard/index.html";
    })
    .catch((error)=>{
      console.error("Error storing user data in Firestore:",error);
    });
  })
  .catch((error)=>{
    const errorCode=error.code;
    if(errorCode==="auth/email-already-in-use"){
      alert("The email address is already in use by another account.");
    }
    else{
      alert(error.message);
    }
  });
});
const loginBtn = document.getElementById('submitlogin');
loginBtn.addEventListener('click', (e) => {
  e.preventDefault();
  const email=document.getElementById('lemail').value;
  const password=document.getElementById('lpassword').value;
  signInWithEmailAndPassword(auth,email,password)
  .then((userCredential)=>{
    // Signed in
    const user=userCredential.user;
    console.log("User signed in:", user);
    alert("Login successful!");
    window.location.href="../dashboard/index.html";
  })
  .catch((error)=>{
    const errorCode=error.code;
    if(errorCode==="auth/wrong-password"){
      alert("Incorrect password. Please try again.");
    }else{
      alert("Account not found. Please sign up first.");
    }
  });
});