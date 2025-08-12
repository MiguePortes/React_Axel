import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { addDoc, updateDoc, collection, doc, getDoc } from 'firebase/firestore';
import { useAppContext } from '../AppContext';
import { Loader, Bell, ListTodo, ClipboardList, XCircle, Volume2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FormularioDeCreacion = () => {
    const { user, db, appId } = useAppContext();
    const navigate = useNavigate();
    const { editId } = useParams(); 
    const location = useLocation();

    const [title, setTitle] = useState('');
    const [reminderTime, setReminderTime] = useState('');
    const [listItems, setListItems] = useState('');
    const [formType, setFormType] = useState('recordatorio');
    const [isLoading, setIsLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    const [message, setMessage] = useState('');
    const [showMessage, setShowMessage] = useState(false);

    // Función de ejemplo para la voz. DEBES implementarla en tu AppContext.
    const speakText = (text) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'es-ES'; // Asegura que hable en español
            window.speechSynthesis.speak(utterance);
        } else {
            console.warn("Speech Synthesis no es soportada en este navegador.");
        }
    };

    const resetForm = () => {
        setTitle('');
        setReminderTime('');
        setListItems('');
    };

    useEffect(() => {
        const typeFromUrl = new URLSearchParams(location.search).get('type');
        if (typeFromUrl) {
            setFormType(typeFromUrl);
        }

        if (editId) {
            setIsEditing(true);
            const fetchItem = async () => {
                if (!user || !db || !appId) return;
                setIsLoading(true);
                
                let collectionPath;
                switch (formType) {
                    case 'tarea':
                        collectionPath = `artifacts/${appId}/users/${user.uid}/tasks`;
                        break;
                    case 'lista':
                        collectionPath = `artifacts/${appId}/users/${user.uid}/shopping_lists`;
                        break;
                    default:
                        collectionPath = `artifacts/${appId}/users/${user.uid}/reminders`;
                        break;
                }

                const docRef = doc(db, collectionPath, editId);
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setTitle(data.title);
                    if (data.reminderTime) {
                        const date = data.reminderTime.toDate();
                        const formattedDate = formType === 'tarea' ? date.toISOString().slice(0, 10) : date.toISOString().slice(0, 16);
                        setReminderTime(formattedDate);
                    }
                    if (data.listItems) {
                        setListItems(data.listItems.join(', '));
                    }
                } else {
                    navigate('/recordatorios');
                }
                setIsLoading(false);
            };
            fetchItem();
        } else {
            setIsEditing(false);
        }
    }, [editId, user, db, appId, navigate, location, formType]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !user || !db || !appId) return;

        setIsLoading(true);

        let itemData = {
            title,
            updatedAt: new Date(),
        };

        let collectionPath;

        switch (formType) {
            case 'tarea':
                itemData.reminderTime = reminderTime ? new Date(reminderTime) : null;
                collectionPath = `artifacts/${appId}/users/${user.uid}/tasks`;
                break;
            case 'lista':
                itemData.listItems = listItems.split(',').map(item => item.trim()).filter(item => item);
                collectionPath = `artifacts/${appId}/users/${user.uid}/shopping_lists`;
                break;
            default:
                itemData.reminderTime = reminderTime ? new Date(reminderTime) : null;
                collectionPath = `artifacts/${appId}/users/${user.uid}/reminders`;
                break;
        }

        try {
            if (isEditing) {
                const docRef = doc(db, collectionPath, editId);
                await updateDoc(docRef, itemData);
                navigate('/recordatorios');
            } else {
                await addDoc(collection(db, collectionPath), {
                    ...itemData,
                    createdAt: new Date(),
                    completed: false, 
                });

                const tipo = formType.charAt(0).toUpperCase() + formType.slice(1);
                const confirmMessage = `Has creado ${tipo}: '${title}'. Te lo recordaré más tarde.`;
                
                setMessage(confirmMessage);
                setShowMessage(true);
                speakText(confirmMessage);
                
                setTimeout(() => {
                    setShowMessage(false);
                }, 5000); 

                resetForm();
            }
        } catch (error) {
            console.error("Error al guardar el elemento:", error);
        } finally {
            setIsLoading(false);
        }
    };
    
    const renderFormTitle = () => {
        if (isEditing) {
            switch(formType) {
                case 'tarea': return 'Editar Tarea';
                case 'lista': return 'Editar Lista';
                default: return 'Editar Recordatorio';
            }
        } else {
            switch(formType) {
                case 'tarea': return 'Crear Tarea';
                case 'lista': return 'Crear Lista';
                default: return 'Crear Recordatorio';
            }
        }
    };

    const handleTypeChange = (newType) => {
        setFormType(newType);
        resetForm();
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
                <Loader size={48} className="animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="p-4 pt-20 min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white flex flex-col items-center">
            <header className="w-full max-w-xl text-center mb-8">
                <h1 className="text-3xl font-bold">{renderFormTitle()}</h1>
            </header>

            {!isEditing && (
                <motion.div
                    className="w-full max-w-xl flex justify-around mb-8 p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <motion.button
                        onClick={() => handleTypeChange('recordatorio')}
                        className={`flex-1 py-2 px-4 rounded-full font-semibold transition-colors ${
                            formType === 'recordatorio' ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Bell size={16} className="inline mr-2" />
                        Recordatorio
                    </motion.button>
                    <motion.button
                        onClick={() => handleTypeChange('tarea')}
                        className={`flex-1 py-2 px-4 rounded-full font-semibold transition-colors ${
                            formType === 'tarea' ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                        whileTap={{ scale: 0.95 }}
                    >
                        <ListTodo size={16} className="inline mr-2" />
                        Tarea
                    </motion.button>
                    <motion.button
                        onClick={() => handleTypeChange('lista')}
                        className={`flex-1 py-2 px-4 rounded-full font-semibold transition-colors ${
                            formType === 'lista' ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                        whileTap={{ scale: 0.95 }}
                    >
                        <ClipboardList size={16} className="inline mr-2" />
                        Lista
                    </motion.button>
                </motion.div>
            )}

            <motion.form
                key={formType}
                onSubmit={handleSubmit}
                className="w-full max-w-xl bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl space-y-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div>
                    <label htmlFor="title" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        {formType === 'lista' ? 'Título de la lista' : 'Título'}
                    </label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="mt-1 block w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:text-white transition-colors"
                        placeholder={formType === 'lista' ? 'Ej. Lista de compras' : 'Ej. Llamar al médico'}
                    />
                </div>

                {formType !== 'lista' && (
                    <div>
                        <label htmlFor="reminderTime" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                            Fecha {formType === 'recordatorio' && 'y hora'}
                        </label>
                        <input
                            type={formType === 'recordatorio' ? 'datetime-local' : 'date'}
                            id="reminderTime"
                            value={reminderTime}
                            onChange={(e) => setReminderTime(e.target.value)}
                            className="mt-1 block w-full px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:text-white transition-colors"
                        />
                    </div>
                )}
                
                {formType === 'lista' && (
                    <div>
                        <label htmlFor="listItems" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                            Elementos de la lista (separados por coma)
                        </label>
                        <textarea
                            id="listItems"
                            value={listItems}
                            onChange={(e) => setListItems(e.target.value)}
                            className="mt-1 block w-full px-4 py-2 h-24 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:text-white transition-colors"
                            placeholder="Ej. Leche, Pan, Huevos"
                        />
                    </div>
                )}
                
                <div className="flex space-x-4">
                    <motion.button
                        type="button"
                        onClick={resetForm}
                        className="flex-1 flex items-center justify-center px-6 py-3 bg-gray-200 text-gray-800 font-bold rounded-xl shadow-md hover:bg-gray-300 transition-colors"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        Cancelar
                    </motion.button>
                    <motion.button
                        type="submit"
                        className="flex-1 flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-md hover:bg-blue-700 transition-colors"
                        disabled={isLoading}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {isLoading ? (
                            <Loader size={20} className="animate-spin mr-2" />
                        ) : (
                            isEditing ? 'Guardar Cambios' : `Crear ${formType.charAt(0).toUpperCase() + formType.slice(1)}`
                        )}
                    </motion.button>
                </div>
            </motion.form>
            
            <AnimatePresence>
                {showMessage && (
                    <motion.div
                        className="fixed bottom-4 left-1/2 -translate-x-1/2 w-full max-w-sm px-4"
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 50, scale: 0.9 }}
                        transition={{ duration: 0.4 }}
                    >
                        <div className="bg-green-600 text-white py-3 px-6 rounded-xl shadow-lg flex items-center justify-between">
                            <div className="flex items-center">
                                <Volume2 size={20} className="mr-2"/>
                                <p className="text-sm font-semibold">{message}</p>
                            </div>
                            <button onClick={() => setShowMessage(false)} className="ml-4">
                                <XCircle size={20} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FormularioDeCreacion;