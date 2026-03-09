// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBblcwiPG3NQkEA3pDAiXOaQn8U_W-q1gs",
  authDomain: "getseat-95a76.firebaseapp.com",
  projectId: "getseat-95a76",
  storageBucket: "getseat-95a76.firebasestorage.app",
  messagingSenderId: "642957821710",
  appId: "1:642957821710:web:aa2dc5ab7ed040a1e1795f",
  measurementId: "G-QLWGE5486E"
  
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const databaseb = getFirestore(app);