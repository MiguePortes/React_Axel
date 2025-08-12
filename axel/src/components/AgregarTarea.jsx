import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../AppContext';
import { addDoc, collection } from 'firebase/firestore';
import { ArrowLeft, PlusCircle, Calendar, MessageCircle, Loader } from 'lucide-react';
import AsistenteDeVoz from './AsistenteDeVoz';
import moment from 'moment';

const AgregarTarea = () => {
    const navigate = useNavigate();
    const { user, db, appId } = useAppContext();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('');

    const handleAddTask = async (e) => {
        e.preventDefault();
        if (!title.trim() || !user) {
            setMessage('El título es obligatorio.');
            setMessageType('error');
            return;
        }

        setIsLoading(true);
        try {
            const newTask = {
                title,
                description,
                createdAt: new Date(),
                completed: false,
            };
            if (dueDate) {
                newTask.dueDate = new Date(dueDate);
            }
            await addDoc(collection(db, `artifacts/${appId}/users/${user.uid}/tasks`), newTask);
            setMessage('Tarea creada correctamente.');
            setMessageType('success');
            setTitle('');
            setDescription('');
            setDueDate('');
            setTimeout(() => {
                navigate('/tareas');
            }, 2000);
        } catch (error) {
            console.error("Error adding task: ", error);
            setMessage('Error al crear la tarea. Inténtalo de nuevo.');
            setMessageType('error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 bg-white rounded-2xl shadow-xl max-w-lg mx-auto space-y-6 pt-20">
            <div className="flex items-center justify-between">
                <button onClick={() => navigate('/tareas')} className="text-gray-500 hover:text-gray-700 transition-colors">
                    <ArrowLeft size={24} />
                </button>
                <h2 className="text-2xl font-bold text-gray-800 text-center flex-grow">Crear Tarea</h2>
                <div className="w-6"></div>
            </div>

            {message && (
                <div className={`p-3 text-sm text-center rounded-lg flex items-center justify-center ${messageType === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    <MessageCircle size={20} className="mr-2" />
                    <span>{message}</span>
                </div>
            )}

            <form onSubmit={handleAddTask} className="space-y-4">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">Título</label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="mt-1 w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descripción (Opcional)</label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="mt-1 w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                        rows="3"
                    />
                </div>
                <div>
                    <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">Fecha Límite (Opcional)</label>
                    <div className="relative mt-1">
                        <input
                            type="datetime-local"
                            id="dueDate"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                        />
                        <Calendar size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    </div>
                </div>

                <div className="flex justify-center mt-6">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
                    >
                        {isLoading ? (
                            <Loader size={20} className="animate-spin" />
                        ) : (
                            <>
                                <PlusCircle size={20} className="mr-2" />
                                Agregar Tarea
                            </>
                        )}
                    </button>
                </div>
            </form>

            <div className="flex items-center justify-center space-x-2 my-4">
                <span className="text-gray-400">--- o ---</span>
            </div>

            <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Crear con tu voz</h3>
                <AsistenteDeVoz />
            </div>
        </div>
    );
};

export default AgregarTarea;