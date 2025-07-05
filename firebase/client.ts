import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCXMNi8GFXhX4Xm4Ldl0A51i0mpvneMuqk",
  authDomain: "interprep-14a30.firebaseapp.com",
  projectId: "interprep-14a30",
  storageBucket: "interprep-14a30.appspot.com", // ✅ FIXED `.app` to `.com`
  messagingSenderId: "393976015574",
  appId: "1:393976015574:web:0c0c37996f8d4291d9b777",
  measurementId: "G-5N255K8BEF",
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider(); // ✅ for Google Sign-in
