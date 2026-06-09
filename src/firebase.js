// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_KEY,
  authDomain: "my-awesome-porto.firebaseapp.com",
  projectId: "my-awesome-porto",
  storageBucket: "my-awesome-porto.firebasestorage.app",
  messagingSenderId: "698403562333",
  appId: "1:698403562333:web:d2611baf596a63a93a3eb4",
  measurementId: "G-4EWYZ3YK9T"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);