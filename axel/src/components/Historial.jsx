import React, { useState, useEffect } from 'react';
import { useAppContext } from '../AppContext';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Loader, CheckCircle } from 'lucide-react';
import moment from 'moment';

const Historial = () => {
    const { user, db, appId, loading } = useAppContext();
    const [completedItems, setCompletedItems] = useState({ tasks: [], reminders: [], lists: [] });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user || !db || !appId) return;

        setIsLoading(true);

        const fetchCompletedItems = (collectionName, stateKey) => {
            const q = query(collection(db, `artifacts/${appId}/users/${user.uid}/${collectionName}`), where("completed", "==", true));
            return onSnapshot(q, (snapshot) => {
                const items = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setCompletedItems(prev => ({ ...prev, [stateKey]: items }));
            });
        };

        const unsubscribeTasks = fetchCompletedItems('tasks', 'tasks');
        const unsubscribeReminders = fetchCompletedItems('reminders', 'reminders');
        const unsubscribeLists = fetchCompletedItems('shopping_lists', 'lists');

        setIsLoading(false);

        return () => {
            unsubscribeTasks();
            unsubscribeReminders();
            unsubscribeLists();
        };
    }, [user, db, appId]);

    if (isLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader size={48} className="animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="max-w-xl mx-auto p-4 space-y-6">
            <h1 className="text-3xl font-bold text-gray-800 text-center mb-6">Historial de Actividades</h1>

            <div className="bg-white p-6 rounded-2xl shadow-xl">
                <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center">
                    <CheckCircle size={20} className="text-green-500 mr-2" /> Tareas Completadas
                </h2>
                {completedItems.tasks.length > 0 ? (
                    <ul className="space-y-4">
                        {completedItems.tasks.map(task => (
                            <li key={task.id} className="p-4 bg-gray-50 rounded-lg flex items-center justify-between shadow-sm">
                                <span>{task.title}</span>
                                <span className="text-sm text-gray-500">{moment(task.createdAt.toDate()).format('LL')}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500 text-center">No hay tareas completadas.</p>
                )}
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-xl">
                <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center">
                    <CheckCircle size={20} className="text-green-500 mr-2" /> Recordatorios Completados
                </h2>
                {completedItems.reminders.length > 0 ? (
                    <ul className="space-y-4">
                        {completedItems.reminders.map(reminder => (
                            <li key={reminder.id} className="p-4 bg-gray-50 rounded-lg flex items-center justify-between shadow-sm">
                                <span>{reminder.title}</span>
                                <span className="text-sm text-gray-500">{moment(reminder.createdAt.toDate()).format('LL')}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500 text-center">No hay recordatorios completados.</p>
                )}
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-xl">
                <h2 className="text-xl font-semibold mb-4 text-gray-700 flex items-center">
                    <CheckCircle size={20} className="text-green-500 mr-2" /> Listas Completadas
                </h2>
                {completedItems.lists.length > 0 ? (
                    <ul className="space-y-4">
                        {completedItems.lists.map(list => (
                            <li key={list.id} className="p-4 bg-gray-50 rounded-lg flex items-center justify-between shadow-sm">
                                <span>{list.title}</span>
                                <span className="text-sm text-gray-500">{moment(list.createdAt.toDate()).format('LL')}</span>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500 text-center">No hay listas completadas.</p>
                )}
            </div>
        </div>
    );
};

export default Historial;