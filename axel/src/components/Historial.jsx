import React, { useState, useEffect } from 'react';
import { useAppContext } from '../AppContext';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { Loader, CheckCircle } from 'lucide-react';
import moment from 'moment';
import 'moment/locale/es';

const Historial = () => {
    const { user, db, appId, loading } = useAppContext();
    const [completedItems, setCompletedItems] = useState({ tasks: [], reminders: [], lists: [] });
    const [isLoading, setIsLoading] = useState(true);

    moment.locale('es');

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
            <div className="flex items-center justify-center min-h-screen dark:bg-gray-900">
                <Loader size={48} className="animate-spin text-blue-600" />
            </div>
        );
    }

    const renderList = (items, title, noItemsText) => (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl">
            <h2 className="text-2xl font-bold mb-4 text-gray-700 dark:text-gray-200 flex items-center">
                <CheckCircle size={24} className="text-green-500 mr-2" /> {title}
            </h2>
            {items.length > 0 ? (
                <ul className="space-y-4">
                    {items.map(item => (
                        <li key={item.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg flex items-center justify-between shadow-sm">
                            <span className="font-medium text-gray-900 dark:text-white">{item.title}</span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">{moment(item.createdAt?.toDate()).format('LL')}</span>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center">{noItemsText}</p>
            )}
        </div>
    );

    return (
        <div className="min-h-screen flex flex-col items-center pt-20 px-4 pb-10 dark:bg-gray-900">
            <div className="max-w-xl w-full space-y-6">
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white text-center mb-6">Historial de Actividades</h1>
                {renderList(completedItems.tasks, "Tareas Completadas", "No hay tareas completadas.")}
                {renderList(completedItems.reminders, "Recordatorios Completados", "No hay recordatorios completados.")}
                {renderList(completedItems.lists, "Listas Completadas", "No hay listas completadas.")}
            </div>
        </div>
    );
};

export default Historial;