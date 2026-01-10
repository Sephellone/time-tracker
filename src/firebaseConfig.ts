import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

export const firebaseConfig = {
  apiKey: "AIzaSyCuGauZFuT3MoJOL16ygW22ctIyXkv2jEA",
  authDomain: "time-tracker-25243.firebaseapp.com",
  projectId: "time-tracker-25243",
  storageBucket: "time-tracker-25243.firebasestorage.app",
  messagingSenderId: "208256379228",
  appId: "1:208256379228:web:623b9bc5b60a7842f6b999",
  measurementId: "G-GJTY4DNFE7",
};

export const firebaseApp = initializeApp(firebaseConfig)
export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
