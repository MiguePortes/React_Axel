import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { addDoc, updateDoc, collection, doc, getDoc } from 'firebase/firestore';
import { useAppContext } from '../AppContext';
import { ArrowLeft, Loader } from 'lucide-react';

const FormularioDeCreacion = () => {
    const { user, db, appId } = useAppContext();
    const navigate = useNavigate();
    const { editId } = useParams(); 
    
    const [title, setTitle] = useState('');
    const [reminderTime, setReminderTime] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);


    useEffect(() => {
        if (editId) {
            setIsEditing(true);
            const fetchReminder = async () => {
                if (!user || !db || !appId) return;
                setIsLoading(true);
                const docRef = doc(db, `artifacts/${appId}/users/${user.uid}/reminders`, editId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setTitle(data.title);
                    if (data.reminderTime) {
                        const date = data.reminderTime.toDate();
                        const formattedDate = date.toISOString().slice(0, 16); 
                        setReminderTime(formattedDate);
                    }
                } else {
                    console.log("No se encontró el recordatorio.");
                    navigate('/recordatorios');
                }
                setIsLoading(false);
            };
            fetchReminder();
        } else {
            setIsEditing(false);
        }
    }, [editId, user, db, appId, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !user || !db || !appId) return;

        setIsLoading(true);
        const reminderData = {
            title,
            reminderTime: reminderTime ? new Date(reminderTime) : null,
            updatedAt: new Date(),
        };

        try {
            if (isEditing) {
                const docRef = doc(db, `artifacts/${appId}/users/${user.uid}/reminders`, editId);
                await updateDoc(docRef, reminderData);
                console.log("Recordatorio actualizado con éxito.");
            } else {
                await addDoc(collection(db, `artifacts/${appId}/users/${user.uid}/reminders`), {
                    ...reminderData,
                    createdAt: new Date(),
                    completed: false, 
                    
                });
                console.log("Recordatorio creado con éxito.");
            }
            navigate('/recordatorios');
        } catch (error) {
            console.error("Error al guardar el recordatorio:", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
                <Loader size={48} className="animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="p-4 pt-16 min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white flex flex-col items-center">
            <header className="w-full max-w-xl flex items-center justify-between mb-8">
                <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
                    <ArrowLeft size={28} />
                </button>
                <h1 className="text-2xl font-bold text-center flex-grow">
                    {isEditing ? 'Editar Recordatorio' : 'Crear Recordatorio'}
                </h1>
                <div className="w-7"></div>
            </header>

            <form onSubmit={handleSubmit} className="w-full max-w-xl bg-white dark:bg-gray-800 p-8 rounded-xl shadow-2xl space-y-6">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Título del recordatorio
                    </label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="mt-1 block w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:text-white"
                        placeholder="Ej. Llamar al médico"
                    />
                </div>
                <div>
                    <label htmlFor="reminderTime" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Fecha y hora del recordatorio (opcional)
                    </label>
                    <input
                        type="datetime-local"
                        id="reminderTime"
                        value={reminderTime}
                        onChange={(e) => setReminderTime(e.target.value)}
                        className="mt-1 block w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:text-white"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <Loader size={20} className="animate-spin mr-2" />
                    ) : (
                        isEditing ? 'Guardar Cambios' : 'Crear Recordatorio'
                    )}
                </button>
            </form>
        </div>
    );
};

export default FormularioDeCreacion;