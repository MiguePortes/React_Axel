import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppContextProvider, useAppContext } from './AppContext';
import Navbar from './components/Navbar';
import Bienvenida from './components/Bienvenida';
import Login from './components/Login';
import Register from './components/Register';
import FormularioDeCreacion from './components/FormularioDeCreacion';
import Recordatorios from './components/Recordatorios';
import { Loader } from 'lucide-react';
import Tareas from './components/Tareas';
import ListasDeTareas from './components/ListasDeTareas';
import AsistenteDeVoz from './components/AsistenteDeVoz';
import Historial from './components/Historial';
import Perfil from './components/Perfil';
import DetallesDeLista from './components/DetallesDeLista';

const AppContent = () => {
    const { user, loading } = useAppContext();
    const [hasSeenWelcome, setHasSeenWelcome] = useState(localStorage.getItem('hasSeenWelcome') === 'true');
    const location = useLocation();

  
    const handleFinishWelcome = () => {
        setHasSeenWelcome(true);
        localStorage.setItem('hasSeenWelcome', 'true'); 
    };

    const isPublicRoute = location.pathname === '/login' || location.pathname === '/register';

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }
    
    if (!hasSeenWelcome) {
        return (
            <Routes>
                <Route path="/" element={<Bienvenida onFinish={handleFinishWelcome} />} />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        );
    }
    
    return (
        <div className="relative flex flex-col min-h-screen">
            {user && !isPublicRoute && <Navbar />}
            <div className={`flex-grow ${user && !isPublicRoute ? 'pt-16' : ''}`}>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    
                    <Route path="/" element={user ? <ListasDeTareas /> : <Navigate to="/login" />} />
                    
                    <Route path="/tareas" element={user ? <Tareas /> : <Navigate to="/login" />} />
                    
                    <Route path="/tarea/new" element={user ? <FormularioDeCreacion /> : <Navigate to="/login" />} />
                    
                    <Route path="/tarea/edit/:editId" element={user ? <FormularioDeCreacion /> : <Navigate to="/login" />} />
                    
                    <Route path="/listas/detalles/:listId" element={user ? <DetallesDeLista /> : <Navigate to="/login" />} />

                    <Route path="/recordatorios" element={user ? <Recordatorios /> : <Navigate to="/login" />} />
                    
                    <Route path="/recordatorio/edit/:editId" element={user ? <FormularioDeCreacion /> : <Navigate to="/login" />} />

                    <Route path="/historial" element={user ? <Historial /> : <Navigate to="/login" />} />
                    <Route path="/perfil" element={user ? <Perfil /> : <Navigate to="/login" />} />

                    <Route path="*" element={<Navigate to={user ? "/" : "/login"} />} />
                </Routes>
            </div>
            {user && !isPublicRoute && (
                <div className="fixed bottom-4 right-4 z-50">
                    <AsistenteDeVoz />
                </div>
            )}
        </div>
    );
};

export default function AppWrapper() {
    return (
        <Router>
            <AppContextProvider>
                <AppContent />
            </AppContextProvider>
        </Router>
    );
}
