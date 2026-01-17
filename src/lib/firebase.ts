import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyCSIvbE16yON0_kDJcD7a6UQGBNRBSlR5s",
    authDomain: "placement-10cfa.firebaseapp.com",
    projectId: "placement-10cfa",
    storageBucket: "placement-10cfa.firebasestorage.app",
    messagingSenderId: "804042346758",
    appId: "1:804042346758:web:324764e36b05f4dcad8e87",
    measurementId: "G-93RVL1FR5K"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
