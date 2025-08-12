import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut, 
  createUserWithEmailAndPassword 
} from "firebase/auth";
import {
  getFirestore,
  onSnapshot,
  collection,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  getDocs
} from "firebase/firestore";


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

// ** Funciones para la autenticacion **

/**
 * 
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<Object>} 
 */
export const registerUser = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log("Usuario registrado con éxito:", userCredential.user);
    return userCredential.user;
  } catch (error) {
    console.error("Error al registrar el usuario:", error);
    throw error;
  }
};

/**
 * 
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise<Object>} 
 */
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("Usuario ha iniciado sesión con éxito:", userCredential.user);
    return userCredential.user;
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    throw error;
  }
};

/**
 * 
 * @returns {Promise<void>} 
 */
export const logoutUser = async () => {
  try {
    await signOut(auth);
    console.log("Sesión cerrada con éxito.");
  } catch (error) {
    console.error("Error al cerrar la sesión:", error);
    throw error;
  }
};

/**
 * 
 * @param {function} callback 
 * @returns {function} 
 */
export const initAuth = (callback) => {
  return onAuthStateChanged(auth, callback);
};
export const appId = firebaseConfig.appId;

export {
  onSnapshot,
  collection,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  getDocs,
  onAuthStateChanged 
};
