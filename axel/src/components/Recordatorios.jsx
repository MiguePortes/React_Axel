import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot, doc, deleteDoc, updateDoc, query, where } from 'firebase/firestore';
import { CalendarClock, PlusCircle, Trash2, Edit2, Info, Loader } from 'lucide-react';
import moment from 'moment';
import 'moment/locale/es'; // Importa el idioma español para moment
import { useAppContext } from '../AppContext';
import { AnimatePresence, motion } from 'framer-motion';

const Recordatorios = () => {
    const { user, db, appId, loading } = useAppContext();
    const navigate = useNavigate();
    const [reminders, setReminders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [reminderToDelete, setReminderToDelete] = useState(null);

    moment.locale('es'); // Establece el idioma globalmente

    const markAsCompleted = async (expiredReminders) => {
        if (!user || !db || !appId || expiredReminders.length === 0) return;
        try {
            for (const reminder of expiredReminders) {
                const reminderRef = doc(db, `artifacts/${appId}/users/${user.uid}/reminders`, reminder.id);
                await updateDoc(reminderRef, {
                    completed: true,
                    completedAt: new Date(),
                });
            }
        } catch (error) {
            console.error("Error al marcar recordatorios como completados: ", error);
        }
    };

    useEffect(() => {
        if (!user || !db || !appId) {
            setIsLoading(false);
            return;
        }

        const q = query(collection(db, `artifacts/${appId}/users/${user.uid}/reminders`), where("completed", "==", false));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const now = moment();
            const allReminders = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
            }));
            
            const expired = allReminders.filter(r => r.reminderTime && moment(r.reminderTime.toDate()).isBefore(now));
            const active = allReminders.filter(r => !r.reminderTime || moment(r.reminderTime.toDate()).isSameOrAfter(now));

            if (expired.length > 0) {
                markAsCompleted(expired);
            }

            setReminders(active);
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching reminders: ", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [user, db, appId]);

    const handleDeleteClick = (reminder) => {
        setReminderToDelete(reminder);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!reminderToDelete || !user || !db || !appId) return;

        try {
            await deleteDoc(doc(db, `artifacts/${appId}/users/${user.uid}/reminders`, reminderToDelete.id));
        } catch (error) {
            console.error("Error al eliminar el recordatorio:", error);
        } finally {
            setShowDeleteModal(false);
            setReminderToDelete(null);
        }
    };

    const handleEditClick = (reminderId) => {
        navigate(`/recordatorio/edit/${reminderId}`);
    };

    if (isLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
                <Loader size={48} className="animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="max-w-xl mx-auto p-4 pt-20 space-y-6 bg-gray-100 dark:bg-gray-900 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white text-center mb-6">Mis Recordatorios</h1>
            
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl">
                <h2 className="text-xl font-semibold mb-4 text-gray-700 dark:text-gray-200 flex items-center">
                    <CalendarClock size={20} className="text-blue-500 mr-2" />
                    Recordatorios Pendientes
                </h2>
                {reminders.length > 0 ? (
                    <ul className="space-y-4">
                        <AnimatePresence>
                        {reminders.map(reminder => (
                            <motion.li
                                key={reminder.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-sm"
                            >
                                <div className="flex-grow dark:text-gray-100">
                                    <span className="font-semibold">{reminder.title}</span>
                                    {reminder.reminderTime && (
                                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            <span>Fecha: {moment(reminder.reminderTime.toDate()).format('LL')}</span>
                                            <span className="ml-4">Hora: {moment(reminder.reminderTime.toDate()).format('LT')}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex space-x-2 mt-2 sm:mt-0">
                                    <button
                                        onClick={() => handleEditClick(reminder.id)}
                                        className="p-2 text-gray-500 hover:text-blue-700 dark:text-gray-400 dark:hover:text-blue-500 transition-colors"
                                    >
                                        <Edit2 size={20} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(reminder)}
                                        className="p-2 text-red-500 hover:text-red-700 transition-colors"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </motion.li>
                        ))}
                        </AnimatePresence>
                    </ul>
                ) : (
                    <p className="text-gray-500 dark:text-gray-400 text-center">No tienes recordatorios pendientes.</p>
                )}
            </div>

            <button
                onClick={() => navigate('/recordatorio/new')}
                className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors mt-6"
            >
                <PlusCircle size={20} className="mr-2" />
                Crear nuevo recordatorio
            </button>
            
            <AnimatePresence>
                {showDeleteModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl max-w-sm w-full text-center"
                        >
                            <div className="flex justify-center mb-4 text-red-500">
                                <Info size={48} />
                            </div>
                            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">¿Estás seguro?</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                Esta acción no se puede deshacer. ¿Deseas eliminar el recordatorio "{reminderToDelete?.title}"?
                            </p>
                            <div className="flex justify-center space-x-4">
                                <button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Eliminar
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Recordatorios;