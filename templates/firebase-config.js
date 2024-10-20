// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyATz36pLKV5XYZNuOHym2Bo3QEvFhrdN_Y",
    authDomain: "nowy-f7672.firebaseapp.com",
    projectId: "nowy-f7672",
    storageBucket: "nowy-f7672.appspot.com",
    messagingSenderId: "229989947643",
    appId: "1:229989947643:web:3bd281e8cb745ae6cdb85e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Експортуйте об'єкти для використання в інших файлах
export { app, db };
