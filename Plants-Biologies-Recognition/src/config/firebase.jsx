// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDJexbI-idgxZJBtIbCZ43o9oZipfjfvcg",
  authDomain: "plants-biologies-recognition.firebaseapp.com",
  projectId: "plants-biologies-recognition",
  storageBucket: "plants-biologies-recognition.firebasestorage.app",
  messagingSenderId: "100498789921",
  appId: "1:100498789921:web:6369d99657c80e46707560",
  measurementId: "G-S7B83X9DFG",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);
export { storage };
