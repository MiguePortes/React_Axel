
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAPUVmrHnE-DTQiC9wFr_kkXd_yKIjydxE",
  authDomain: "axel-d028d.firebaseapp.com",
  projectId: "axel-d028d",
  storageBucket: "axel-d028d.firebasestorage.app",
  messagingSenderId: "354066932973",
  appId: "1:354066932973:web:41b56320a4e580a24f58e4",
  measurementId: "G-73WQJNJ9T0"
};


const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
