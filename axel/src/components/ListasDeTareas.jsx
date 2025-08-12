import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { useAppContext } from '../AppContext';
import { Loader, List, CheckSquare, PlusCircle, LayoutList } from 'lucide-react';

const ListasDeTareas = () => {
    const navigate = useNavigate();
    const { user, db, appId, loading: appLoading } = useAppContext();
    const [pendingTasksCount, setPendingTasksCount] = useState(0);
    const [completedTasksCount, setCompletedTasksCount] = useState(0);
    const [userLists, setUserLists] = useState([]); 
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user || !db || !appId) return;

        const tasksColRef = collection(db, `artifacts/${appId}/users/${user.uid}/tasks`);
        const listsColRef = collection(db, `artifacts/${appId}/users/${user.uid}/lists`); 

        setIsLoading(true);


        const unsubscribePending = onSnapshot(query(tasksColRef, where('completed', '==', false)), (snapshot) => {
            setPendingTasksCount(snapshot.size);
        }, (err) => {
            console.error("Error al obtener tareas pendientes:", err);
        });

 
        const unsubscribeCompleted = onSnapshot(query(tasksColRef, where('completed', '==', true)), (snapshot) => {
            setCompletedTasksCount(snapshot.size);
        }, (err) => {
            console.error("Error al obtener tareas completadas:", err);
        });
        
    
        const unsubscribeLists = onSnapshot(query(listsColRef), (snapshot) => {
            const listsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setUserLists(listsData);
            setIsLoading(false);
        }, (err) => {
            console.error("Error al obtener listas:", err);
            setIsLoading(false);
        });

        return () => {
            unsubscribePending();
            unsubscribeCompleted();
            unsubscribeLists();
        };
    }, [user, db, appId]);

    if (isLoading || appLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader size={48} className="animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="bg-[#111827] min-h-screen text-white p-4">
            <header className="text-center my-8">
                <h1 className="text-3xl font-extrabold text-white">Listas de tareas</h1>
            </header>
            <main className="max-w-xl mx-auto space-y-4">
                
                <div
                    className="bg-[#1F2937] rounded-xl shadow-lg p-5 flex items-center justify-between cursor-pointer hover:bg-[#374151] transition-colors"
                    onClick={() => navigate('/tareas?status=pending')}
                >
                    <div className="flex items-center">
                        <List size={24} className="text-[#9CA3AF] mr-4" />
                        <span className="text-lg font-semibold text-white">Tareas Pendientes</span>
                    </div>
                    <span className="text-lg text-[#9CA3AF]">{pendingTasksCount}</span>
                </div>
        
                <div
                    className="bg-[#1F2937] rounded-xl shadow-lg p-5 flex items-center justify-between cursor-pointer hover:bg-[#374151] transition-colors"
                    onClick={() => navigate('/tareas?status=completed')}
                >
                    <div className="flex items-center">
                        <CheckSquare size={24} className="text-green-500 mr-4" />
                        <span className="text-lg font-semibold text-white">Tareas completadas</span>
                    </div>
                    <span className="text-lg text-[#9CA3AF]">{completedTasksCount}</span>
                </div>
                
                <h2 className="text-2xl font-bold mt-8 mb-4">Mis listas personalizadas</h2>
             
                {userLists.length > 0 ? (
                    userLists.map(list => (
                        <div
                            key={list.id}
                            className="bg-[#1F2937] rounded-xl shadow-lg p-5 flex items-center justify-between cursor-pointer hover:bg-[#374151] transition-colors"
                            onClick={() => navigate(`/listas/detalles/${list.id}`)}
                        >
                            <div className="flex items-center">
                                <LayoutList size={24} className="text-yellow-500 mr-4" />
                                <span className="text-lg font-semibold text-white">{list.title}</span>
                            </div>
                            <span className="text-lg text-[#9CA3AF]">{list.sections.length} items</span>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-gray-400 mt-4">No tienes listas creadas.</p>
                )}
                
            
                <div
                    className="bg-[#1F2937] rounded-xl shadow-lg p-5 flex items-center justify-center space-x-2 cursor-pointer hover:bg-[#374151] transition-colors mt-8"
                    onClick={() => navigate('/tarea/new')}
                >
                    <PlusCircle size={24} className="text-blue-500" />
                    <span className="text-lg font-semibold text-blue-500">Crear Nueva Tarea</span>
                </div>
            </main>
            <footer className="text-center text-sm text-gray-500 mt-8">
                ID de usuario: {user?.uid || 'N/A'}
            </footer>
        </div>
    );
};

export default ListasDeTareas;