import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAppContext } from '../AppContext';
import { Loader, ArrowLeft, Check, List, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

const DetallesDeLista = () => {
    const { listId } = useParams();
    const navigate = useNavigate();
    const { user, db, appId, loading: appLoading } = useAppContext();
    const [listData, setListData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user || !db || !appId || !listId) {
            return;
        }

        const fetchList = async () => {
            try {
                const listDocRef = doc(db, `artifacts/${appId}/users/${user.uid}/lists`, listId);
                const docSnap = await getDoc(listDocRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                
                    const sectionsWithStatus = (data.sections || []).map(section => {
                        
                        return typeof section === 'object' && section !== null ? section : { text: section, completed: false };
                    });
                    setListData({ ...data, sections: sectionsWithStatus });
                } else {
                    console.error("No se encontró la lista.");
                    navigate('/listas');
                }
            } catch (error) {
                console.error("Error al obtener la lista:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchList();
    }, [user, db, appId, listId, navigate]);

    const handleToggleComplete = async (index) => {
        if (!listData) return;

        const updatedSections = [...listData.sections];
        updatedSections[index].completed = !updatedSections[index].completed;

        setListData(prevData => ({
            ...prevData,
            sections: updatedSections,
        }));

        try {
            const listDocRef = doc(db, `artifacts/${appId}/users/${user.uid}/lists`, listId);
            await updateDoc(listDocRef, {
                sections: updatedSections,
                updatedAt: new Date(),
            });
        } catch (error) {
            console.error("Error al actualizar la sección:", error);
        }
    };
    

    const handleDeleteSection = async (index) => {
        if (!listData) return;
        
        const updatedSections = listData.sections.filter((_, i) => i !== index);

        setListData(prevData => ({
            ...prevData,
            sections: updatedSections,
        }));

        try {
            const listDocRef = doc(db, `artifacts/${appId}/users/${user.uid}/lists`, listId);
            await updateDoc(listDocRef, {
                sections: updatedSections,
                updatedAt: new Date(),
            });
        } catch (error) {
            console.error("Error al eliminar la sección:", error);
        }
    };

    if (isLoading || appLoading || !listData) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#111827]">
                <Loader size={48} className="animate-spin text-blue-500" />
            </div>
        );
    }
    
    const sectionsCount = listData.sections.length;

    return (
        <div className="bg-[#111827] min-h-screen text-white p-4 pt-16">
            <header className="flex items-center justify-between mb-8">
                <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-white transition-colors">
                    <ArrowLeft size={28} />
                </button>
                <h1 className="text-3xl font-extrabold flex-grow text-center">{listData.title}</h1>
                <div className="w-7"></div>
            </header>
            
            <p className="text-center text-gray-400 mb-6">{sectionsCount} {sectionsCount === 1 ? 'artículo' : 'artículos'}</p>

            <main className="max-w-xl mx-auto space-y-4">
                {listData.sections.length > 0 ? (
                    listData.sections.map((section, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="bg-[#1F2937] rounded-xl shadow-lg p-5 flex items-center justify-between transition-transform duration-200 ease-in-out transform hover:scale-[1.02]"
                        >
                            <span 
                                className={`flex-grow text-lg font-semibold cursor-pointer ${section.completed ? 'line-through text-gray-400' : 'text-white'}`}
                            >
                                {section.text}
                            </span>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleToggleComplete(index)}
                                    className={`p-2 rounded-full transition-colors ${section.completed ? 'bg-green-500' : 'bg-blue-500'}`}
                                >
                                    <Check size={20} className="text-white" />
                                </button>
                                <button
                                    onClick={() => handleDeleteSection(index)}
                                    className="p-2 rounded-full bg-red-500 hover:bg-red-600 transition-colors"
                                >
                                    <Trash2 size={20} className="text-white" />
                                </button>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <p className="text-center text-gray-400 mt-10">Esta lista está vacía.</p>
                )}
            </main>
        </div>
    );
};

export default DetallesDeLista;