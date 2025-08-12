import React, { useState, useEffect, createContext, useContext } from 'react';
import { initializeApp } from 'firebase/app';
import {
    getAuth,
    onAuthStateChanged,
    signInAnonymously,
    signInWithCustomToken,
    signOut,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyAPUVmrHnE-DTQiC9wFr_kkXd_yKIjydxE",
    authDomain: "axel-d028d.firebaseapp.com",
    projectId: "axel-d028d",
    storageBucket: "axel-d028d.firebasestorage.app",
    messagingSenderId: "354066932973",
    appId: "1:354066932973:web:41b56320a4e580a24f58e4",
    measurementId: "G-73WQJNJ9T0"
};

const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

let firebaseApp;
let auth;
let db;

try {
    firebaseApp = initializeApp(firebaseConfig);
    auth = getAuth(firebaseApp);
    db = getFirestore(firebaseApp);
    window.firebaseApp = firebaseApp;
} catch (error) {
    console.error("Error al inicializar Firebase:", error);
}

const AppContext = createContext();

export const useAppContext = () => {
    return useContext(AppContext);
};

export const AppContextProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!auth) {
            console.error("Firebase Auth no está inicializado. Verifica tu configuración.");
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
            } else {
                try {
                    if (initialAuthToken) {
                        await signInWithCustomToken(auth, initialAuthToken);
                    } else {
                        await signInAnonymously(auth);
                    }
                } catch (error) {
                    console.error("Error signing in:", error);
                }
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const value = {
        user,
        loading,
        db,
        auth,
        appId: firebaseConfig.appId,
        signInWithEmail: (email, password) => signInWithEmailAndPassword(auth, email, password),
        signUpWithEmail: (email, password) => createUserWithEmailAndPassword(auth, email, password),
        logout: () => signOut(auth)
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};