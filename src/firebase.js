// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore"; // Importa Firestore

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyB9Kx3reGDykrQRlqWLnFN2pVBuQpOowd4",
  authDomain: "guessing-game-4f938.firebaseapp.com",
  projectId: "guessing-game-4f938",
  storageBucket: "guessing-game-4f938.appspot.com",
  messagingSenderId: "315428238157",
  appId: "1:315428238157:web:ae22077d834a85ce343d04",
  measurementId: "G-JD08XFBRGR"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Inicializa Firebase Authentication y expórtalo
export const auth = getAuth(app);

// Inicializa Firebase Analytics
getAnalytics(app);

// Inicializa Firebase Firestore y expórtalo
export const db = getFirestore(app); // Exporta Firestore para usarlo en todo el proyecto
