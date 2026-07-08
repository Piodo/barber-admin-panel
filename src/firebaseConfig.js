import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

export const firebaseConfig = {
  apiKey: "AIzaSyAG9qAQRyp03f_aV31Rr3Q3TaUEiCDV25c",
  authDomain: "basicloginsignup-31e74.firebaseapp.com",
  projectId: "basicloginsignup-31e74",
  storageBucket: "basicloginsignup-31e74.appspot.com",
  messagingSenderId: "468689389972",
  appId: "1:468689389972:web:5da55292252ea8e7516781",
  measurementId: "G-65EELD9P65"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
