import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { collection, onSnapshot, query, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useAppContext } from '../AppContext';
import { Loader, PlusCircle, Check, Trash2, XCircle, Menu, Mic, List, CheckSquare } from 'lucide-react';
import { motion } from 'framer-motion';

const Tareas = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, db, appId, loading: appLoading } = useAppContext();
    const [tasks, setTasks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [filter, setFilter] = useState('pending');
    const [showModal, setShowModal] = useState(false);
    const [taskIdToDelete, setTaskIdToDelete] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const status = queryParams.get('status');
        if (status === 'completed') {
            setFilter('completed');
        } else {
            setFilter('pending');
        }
    }, [location.search]);

    useEffect(() => {
        if (!user || !db || !appId) return;

        const tasksColRef = collection(db, `artifacts/${appId}/users/${user.uid}/tasks`);
        const q = query(tasksColRef);
        setIsLoading(true);

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const tasksData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setTasks(tasksData);
            setIsLoading(false);
        }, (err) => {
            console.error("Error al obtener tareas:", err);
            setIsLoading(false);
        });

        return unsubscribe;
    }, [user, db, appId]);

    const handleAddTask = async (e) => {
        e.preventDefault();
        if (newTaskTitle.trim() === '') return;

        try {
            const tasksColRef = collection(db, `artifacts/${appId}/users/${user.uid}/tasks`);
            await addDoc(tasksColRef, {
                title: newTaskTitle,
                completed: false,
                createdAt: new Date(),
            });
            setNewTaskTitle('');
        } catch (e) {
            console.error("Error al añadir tarea: ", e);
        }
    };

    const handleToggleComplete = async (taskId, completed) => {
        try {
            const taskDocRef = doc(db, `artifacts/${appId}/users/${user.uid}/tasks`, taskId);
            await updateDoc(taskDocRef, {
                completed: !completed,
            });
        } catch (e) {
            console.error("Error al actualizar tarea: ", e);
        }
    };

    const handleDeleteTask = async () => {
        if (!taskIdToDelete) return;

        try {
            const taskDocRef = doc(db, `artifacts/${appId}/users/${user.uid}/tasks`, taskIdToDelete);
            await deleteDoc(taskDocRef);
            setShowModal(false);
            setTaskIdToDelete(null);
        } catch (e) {
            console.error("Error al eliminar tarea: ", e);
        }
    };

    const openModal = (taskId) => {
        setTaskIdToDelete(taskId);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setTaskIdToDelete(null);
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    if (isLoading || appLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader size={48} className="animate-spin text-blue-500" />
            </div>
        );
    }

    const filteredTasks = tasks ? tasks.filter(task => task.completed === (filter === 'completed')) : [];

    return (
        <div className="flex flex-col bg-gray-100 min-h-screen text-gray-800">
            {/* Sidebar para pantallas pequeñas */}
            <motion.div
                initial={{ x: -300 }}
                animate={{ x: isSidebarOpen ? 0 : -300 }}
                transition={{ duration: 0.3 }}
                className="fixed top-0 left-0 bottom-0 w-64 bg-white shadow-xl p-4 z-50 flex flex-col md:hidden"
            >
                <button onClick={toggleSidebar} className="self-end mb-4 text-gray-400 hover:text-gray-800 transition-colors">
                    <XCircle size={28} />
                </button>
                <nav className="flex-grow space-y-2">
                    <button
                        onClick={() => {
                            navigate('/');
                            toggleSidebar();
                        }}
                        className="flex items-center w-full px-3 py-2 rounded-lg transition-colors hover:bg-gray-200"
                    >
                        <List size={20} className="mr-3" />
                        Volver a listas
                    </button>
                    <button
                        onClick={() => {
                            navigate('/calendario');
                            toggleSidebar();
                        }}
                        className="flex items-center w-full px-3 py-2 rounded-lg transition-colors hover:bg-gray-200"
                    >
                        <CheckSquare size={20} className="mr-3" />
                        Calendario
                    </button>
                </nav>
            </motion.div>

            {isSidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={toggleSidebar}></div>}

            {/* Main Content */}
            <div className="flex-grow p-4 md:p-8 transition-all duration-300">
                <header className="flex items-center justify-between mb-8">
                    {/* Botón de hamburguesa para pantallas pequeñas */}
                    <button onClick={toggleSidebar} className="text-gray-600 hover:text-gray-800 transition-colors md:hidden">
                        <Menu size={28} />
                    </button>
                    {/* Navegación para pantallas grandes */}
                    <nav className="hidden md:flex flex-grow space-x-4 justify-start items-center">
                        <button
                            onClick={() => navigate('/')}
                            className="flex items-center px-3 py-2 rounded-lg transition-colors hover:bg-gray-200 text-gray-600 hover:text-gray-800"
                        >
                            <List size={20} className="mr-2" />
                            Volver a listas
                        </button>
                        <button
                            onClick={() => navigate('/calendario')}
                            className="flex items-center px-3 py-2 rounded-lg transition-colors hover:bg-gray-200 text-gray-600 hover:text-gray-800"
                        >
                            <CheckSquare size={20} className="mr-2" />
                            Calendario
                        </button>
                    </nav>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-center flex-grow">
                        {filter === 'pending' ? 'Tareas Pendientes' : 'Tareas Completadas'}
                    </h1>
                    <div className="w-8 md:w-auto"></div> {/* Spacer to center the title */}
                </header>

                <main className="max-w-3xl mx-auto space-y-4">
                    {filter === 'pending' && (
                        <form onSubmit={handleAddTask} className="flex items-center space-x-2 bg-white p-3 rounded-xl shadow-lg">
                            <input
                                type="text"
                                value={newTaskTitle}
                                onChange={(e) => setNewTaskTitle(e.target.value)}
                                placeholder="Añadir una nueva tarea..."
                                className="flex-grow bg-transparent text-gray-800 placeholder-gray-400 focus:outline-none"
                            />
                            {/* Aquí se quita el icono duplicado */}
                            <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full transition-colors">
                                <span className="sr-only">Añadir</span> {/* Para accesibilidad */}
                                <PlusCircle size={24} />
                            </button>
                        </form>
                    )}

                    {filteredTasks.length > 0 ? (
                        filteredTasks.map(task => (
                            <motion.div
                                key={task.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="bg-white rounded-xl shadow-lg p-4 flex items-center justify-between transition-transform duration-200 ease-in-out transform hover:scale-[1.02]"
                            >
                                <span className={`flex-grow text-lg ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                                    {task.title}
                                </span>
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleToggleComplete(task.id, task.completed)}
                                        className={`p-2 rounded-full transition-colors ${task.completed ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'}`}
                                    >
                                        <Check size={20} className="text-white" />
                                    </button>
                                    <button
                                        onClick={() => openModal(task.id)}
                                        className="p-2 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
                                    >
                                        <Trash2 size={20} className="text-white" />
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.5 }}
                            className="text-center text-gray-500 mt-10 p-4"
                        >
                            {filter === 'pending' ? 'No tienes tareas pendientes. ¡Todo listo!' : 'No hay tareas completadas todavía.'}
                        </motion.p>
                    )}
                </main>

                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-white rounded-xl p-6 shadow-2xl text-center max-w-sm mx-auto text-gray-800"
                        >
                            <h2 className="text-xl font-bold mb-4">Confirmar Eliminación</h2>
                            <p className="text-gray-600 mb-6">¿Estás seguro de que quieres eliminar esta tarea?</p>
                            <div className="flex justify-center space-x-4">
                                <button
                                    onClick={handleDeleteTask}
                                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                                >
                                    Eliminar
                                </button>
                                <button
                                    onClick={closeModal}
                                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </div>
            
          
        </div>
    );
};

export default Tareas;