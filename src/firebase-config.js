// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBdI1rZLtjGNt17sex82vto7KR8Ka_Og5M",
  authDomain: "linkages-pam.firebaseapp.com",
  projectId: "linkages-pam",
  storageBucket: "linkages-pam.appspot.com",
  messagingSenderId: "406010825604",
  appId: "1:406010825604:web:4eec6447c1cd7409a02bd1",
  measurementId: "G-KMRDML2L23"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);

// Set persistence to LOCAL by default
setPersistence(auth, browserLocalPersistence)
  .catch((error) => {
    console.error("Auth persistence error:", error);
  });

export { app, analytics, db, auth }; 