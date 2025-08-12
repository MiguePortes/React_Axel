import React, { useState } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { LogOut, PlusCircle, CalendarClock, Menu, X, Home, Clock, User } from 'lucide-react';
import { useAppContext } from '../AppContext';

const Navbar = () => {
    const { logout } = useAppContext();
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { to: '/', icon: <Home size={24} />, text: 'Listas' },
        { to: '/recordatorios', icon: <CalendarClock size={24} />, text: 'Recordatorios' },
        { to: '/historial', icon: <Clock size={24} />, text: 'Historial' },
        { to: '/perfil', icon: <User size={24} />, text: 'Perfil' },
    ];

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 shadow-lg">
            <div className="flex justify-between items-center p-4 max-w-7xl mx-auto">
                <Link to="/" className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    Axel Asistente
                </Link>

                <div className="md:hidden">
                    <button onClick={toggleMenu} className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400">
                        {isOpen ? <X size={28} /> : <Menu size={28} />}
                    </button>
                </div>

                <div className="hidden md:flex space-x-6 items-center">
                    {navItems.map((item, index) => (
                        <NavLink
                            key={index}
                            to={item.to}
                            className={({ isActive }) =>
                                `flex items-center p-2 rounded-xl transition-all duration-300 ease-in-out ${
                                    isActive ? 'text-blue-600 bg-blue-100 dark:bg-gray-700' : 'text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400'
                                }`
                            }
                        >
                            {item.icon}
                            <span className="text-sm font-medium ml-2">{item.text}</span>
                        </NavLink>
                    ))}
                    
                    <NavLink
                        to="/tarea/new"
                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors"
                    >
                        <PlusCircle size={20} className="mr-2"/>
                        <span className="font-semibold">Crear</span>
                    </NavLink>

                    <button
                        onClick={handleLogout}
                        className="flex items-center p-2 text-gray-500 hover:text-red-600 transition-colors"
                    >
                        <LogOut size={24} className="mr-2"/>
                        <span className="text-sm font-medium">Salir</span>
                    </button>
                </div>
            </div>

            <div className={`md:hidden ${isOpen ? 'block' : 'hidden'} bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700`}>
                <div className="flex flex-col p-4 space-y-2">
                    {navItems.map((item, index) => (
                        <NavLink
                            key={index}
                            to={item.to}
                            className={({ isActive }) =>
                                `flex items-center p-2 rounded-lg transition-colors ${
                                    isActive ? 'text-blue-600 bg-blue-100 dark:bg-gray-700' : 'text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400'
                                }`
                            }
                            onClick={toggleMenu}
                        >
                            {item.icon}
                            <span className="font-medium ml-2">{item.text}</span>
                        </NavLink>
                    ))}
                    
                    <NavLink
                        to="/tarea/new"
                        className="flex items-center p-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors"
                        onClick={toggleMenu}
                    >
                        <PlusCircle size={20} className="mr-2"/>
                        <span className="font-semibold">Crear</span>
                    </NavLink>

                    <button
                        onClick={() => { handleLogout(); toggleMenu(); }}
                        className="flex items-center p-2 text-gray-500 hover:text-red-600 transition-colors"
                    >
                        <LogOut size={24} className="mr-2"/>
                        <span className="font-medium">Salir</span>
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;