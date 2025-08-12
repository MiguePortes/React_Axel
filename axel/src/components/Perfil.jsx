import React, { useState, useEffect } from 'react';
import { db, auth, onSnapshot, doc } from '../firebase';
import { User, Mail } from 'lucide-react'; 

const Perfil = () => {
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (auth.currentUser) {
            const userDocRef = doc(db, `users/${auth.currentUser.uid}`);
            const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
                if (docSnap.exists()) {
                    setUserProfile(docSnap.data());
                }
                setLoading(false);
            });
            return () => unsubscribe();
        } else {
            setLoading(false);
        }
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen dark:bg-gray-900 text-gray-800 dark:text-gray-200">
                <p>Cargando perfil...</p>
            </div>
        );
    }

    if (!userProfile) {
        return (
            <div className="flex items-center justify-center min-h-screen dark:bg-gray-900 text-gray-800 dark:text-gray-200">
                <p>No se encontró el perfil del usuario.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center pt-20 px-4 dark:bg-gray-900 text-gray-900 dark:text-white">
            <h1 className="text-4xl font-extrabold text-center mb-12">Mi Perfil</h1>
            <div className="max-w-md w-full space-y-6">
                <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl shadow-xl flex items-center space-x-4">
                    <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full">
                        <User size={24} className="text-blue-500" />
                    </div>
                    <div className="flex-grow">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Nombre</p>
                        <p className="text-xl font-semibold">{userProfile.name}</p>
                    </div>
                </div>
                <div className="p-5 bg-white dark:bg-gray-800 rounded-2xl shadow-xl flex items-center space-x-4">
                    <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-full">
                        <Mail size={24} className="text-blue-500" />
                    </div>
                    <div className="flex-grow">
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Correo electrónico</p>
                        <p className="text-base font-semibold">{userProfile.email}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Perfil;