import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../AppContext';
import { doc, onSnapshot, updateDoc, deleteDoc } from 'firebase/firestore';
import { ArrowLeft, Edit, Trash2, Save, X, Loader } from 'lucide-react';
import moment from 'moment';

const DetalleTarea = () => {
    const { taskId } = useParams();
    const navigate = useNavigate();
    const { db, user, appId } = useAppContext();
    const [task, setTask] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editedTitle, setEditedTitle] = useState('');
    const [editedDescription, setEditedDescription] = useState('');

    useEffect(() => {
        if (!user || !db || !appId) return;

        const taskRef = doc(db, `artifacts/${appId}/users/${user.uid}/tasks`, taskId);
        const unsubscribe = onSnapshot(taskRef, (docSnap) => {
            if (docSnap.exists()) {
                setTask({ id: docSnap.id, ...docSnap.data() });
                setEditedTitle(docSnap.data().title);
                setEditedDescription(docSnap.data().description || '');
            } else {
                console.log("No such document!");
                navigate('/tareas');
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, [taskId, user, db, navigate, appId]);

    const handleUpdateTask = async () => {
        if (!user || !task) return;

        const taskRef = doc(db, `artifacts/${appId}/users/${user.uid}/tasks`, task.id);
        try {
            await updateDoc(taskRef, {
                title: editedTitle,
                description: editedDescription,
                updatedAt: new Date(),
            });
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating task: ", error);
        }
    };

    const handleDeleteTask = async () => {
        if (!user || !task) return;

        const taskRef = doc(db, `artifacts/${appId}/users/${user.uid}/tasks`, task.id);
        try {
            await deleteDoc(taskRef);
            navigate('/tareas');
        } catch (error) {
            console.error("Error deleting task: ", error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader size={48} className="animate-spin text-blue-600" />
            </div>
        );
    }

    if (!task) {
        return <div className="text-center text-gray-500 mt-8">Tarea no encontrada.</div>;
    }

    return (
        <div className="max-w-xl mx-auto p-4 pt-20">
            <div className="flex items-center justify-between mb-6">
                <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700 transition-colors">
                    <ArrowLeft size={24} />
                </button>
                <h2 className="text-2xl font-bold text-gray-800 text-center flex-grow">Detalle de la Tarea</h2>
                <div className="w-6"></div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-xl space-y-6">
                {isEditing ? (
                    <div className="space-y-4">
                        <input
                            type="text"
                            value={editedTitle}
                            onChange={(e) => setEditedTitle(e.target.value)}
                            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                        />
                        <textarea
                            value={editedDescription}
                            onChange={(e) => setEditedDescription(e.target.value)}
                            className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
                            rows="4"
                        />
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => setIsEditing(false)}
                                className="p-3 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors flex items-center"
                            >
                                <X size={18} className="mr-1" /> Cancelar
                            </button>
                            <button
                                onClick={handleUpdateTask}
                                className="p-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors flex items-center"
                            >
                                <Save size={18} className="mr-1" /> Guardar
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Título:</p>
                            <p className="text-xl font-semibold text-gray-800">{task.title}</p>
                        </div>
                        {task.description && (
                            <div>
                                <p className="text-sm font-medium text-gray-500">Descripción:</p>
                                <p className="text-base text-gray-600">{task.description}</p>
                            </div>
                        )}
                        {task.dueDate && (
                            <div>
                                <p className="text-sm font-medium text-gray-500">Fecha Límite:</p>
                                <p className="text-base text-gray-600">{moment(task.dueDate.toDate()).format('DD/MM/YYYY HH:mm')}</p>
                            </div>
                        )}
                        <div className="flex justify-end space-x-2">
                            <button
                                onClick={() => setIsEditing(true)}
                                className="p-3 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors flex items-center"
                            >
                                <Edit size={18} className="mr-1" /> Editar
                            </button>
                            <button
                                onClick={handleDeleteTask}
                                className="p-3 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors flex items-center"
                            >
                                <Trash2 size={18} className="mr-1" /> Eliminar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DetalleTarea;