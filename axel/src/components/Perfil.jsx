import React, { useState, useEffect } from 'react';
import { db, auth, onSnapshot, doc } from '../firebase';

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
        return <div className="flex items-center justify-center min-h-screen">Cargando perfil...</div>;
    }

    if (!userProfile) {
        return <div className="flex items-center justify-center min-h-screen">No se encontró el perfil del usuario.</div>;
    }

    return (
        <div className="container mx-auto p-4 max-w-md bg-white rounded-lg shadow-lg mt-10">
            <h1 className="text-3xl font-bold text-center mb-6">Mi Perfil</h1>
            <div className="space-y-4">
                <div className="p-4 bg-gray-100 rounded-lg">
                    <p className="font-semibold">Nombre:</p>
                    <p className="text-gray-700">{userProfile.name}</p>
                </div>
                <div className="p-4 bg-gray-100 rounded-lg">
                    <p className="font-semibold">Email:</p>
                    <p className="text-gray-700">{userProfile.email}</p>
                </div>
            </div>
        </div>
    );
};

export default Perfil;
