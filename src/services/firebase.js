import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBtq3YNsBM1HehD_wcwdacWQZKAF-buyGs",

  authDomain: "usermanagement-e78fa.firebaseapp.com",

  projectId: "usermanagement-e78fa",

  storageBucket: "usermanagement-e78fa.firebasestorage.app",

  messagingSenderId: "947928457427",

  appId: "1:947928457427:web:6568583d9a77e44a7b3426",

  measurementId: "G-K52LTHLJHV",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
