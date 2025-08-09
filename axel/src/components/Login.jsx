import React, { useState } from 'react';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';


import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';


import logo from "../assets/img/logo.png";
import videoBackground from "../assets/video/Fondo.mp4"; 

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        const { id, value } = e.target;
        let newValue = value.replace(/\s/g, ''); 
        setFormData((prevData) => ({ ...prevData, [id]: newValue }));
        setErrors({}); 
        setSuccessMessage('');
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.email) {
            newErrors.email = 'El email es obligatorio.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Ingresa un email válido.';
        }
        if (!formData.password) {
            newErrors.password = 'La contraseña es obligatoria.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            try {
          
                await signInWithEmailAndPassword(auth, formData.email, formData.password);
                
                setSuccessMessage('¡Inicio de sesión exitoso! Redirigiendo a tu panel de control...');
                
       
                setTimeout(() => {
                    navigate('/tareas');
                }, 2000);
            } catch (error) {
                let errorMessage = 'Ocurrió un error durante el inicio de sesión. Inténtalo de nuevo.';
                switch (error.code) {
                    case 'auth/invalid-credential':
                        errorMessage = 'Credenciales inválidas. Por favor, verifica tu email y contraseña.';
                        break;
                    case 'auth/user-not-found':
                    case 'auth/wrong-password':
                        errorMessage = 'Credenciales inválidas. Por favor, verifica tu email y contraseña.';
                        break;
                    default:
                        errorMessage = 'Ocurrió un error inesperado. Código de error: ' + error.code;
                }
                setErrors({ general: errorMessage });
                setSuccessMessage('');
                console.error("Error de inicio de sesión:", error);
            }
        } else {
            setSuccessMessage('');
        }
    };

    return (
        <div 
            className="flex items-center justify-center min-h-screen p-4 md:p-6 font-inter text-gray-800 relative overflow-hidden"
        >
            <video
                autoPlay
                loop
                muted
                className="absolute z-0 w-full h-full object-cover"
                src={videoBackground}
            >
                Tu navegador no soporta el tag de video.
            </video>
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/60 to-blue-500/20"></div>

            <div className="relative z-10 w-full max-w-xs md:max-w-sm h-auto flex flex-col bg-white/70 backdrop-blur-sm shadow-2xl p-4 md:p-8 rounded-2xl overflow-hidden border border-white/20">
                <div className="flex flex-col items-center mb-5">
                    <div className="bg-transparent p-1 rounded-lg border border-white/50 shadow-sm">
                        <img
                            src={logo}
                            alt="Logo"
                            className="w-16 h-auto"
                        />
                    </div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 drop-shadow-lg mt-3">
                        Iniciar Sesión
                    </h2>
                    <p className="text-center text-sm text-gray-600 mt-1">
                        Accede a tu cuenta para continuar.
                    </p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="email" className="block text-sm font-medium mb-1 text-gray-700">
                            Email
                        </label>
                        <div className="relative shadow-sm rounded-lg">
                            <input
                                type="email"
                                id="email"
                                placeholder="Ingresa tu correo"
                                className="w-full pl-9 pr-3 py-2 bg-white/80 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#75a4f1] text-gray-800 placeholder-gray-500 transition-colors text-sm rounded-lg"
                                value={formData.email}
                                onChange={handleChange}
                            />
                            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        </div>
                        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                    </div>
                    <div className="mb-3">
                        <label htmlFor="password" className="block text-sm font-medium mb-1 text-gray-700">
                            Contraseña
                        </label>
                        <div className="relative shadow-sm rounded-lg">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                placeholder="************"
                                className="w-full pl-9 pr-9 py-2 bg-white/80 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#75a4f1] text-gray-800 placeholder-gray-500 transition-colors text-sm rounded-lg"
                                value={formData.password}
                                onChange={handleChange}
                            />
                            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                            <button
                                type="button"
                                className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-500 hover:text-gray-800"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}
                    </div>
                    {errors.general && <p className="mt-2 text-center text-sm text-red-600">{errors.general}</p>}
                    <button
                        type="submit"
                        className="w-full py-2 mt-4 text-base font-bold text-white bg-[#2e69e5] hover:bg-[#75a4f1] shadow-lg transition-colors duration-300 transform hover:scale-105 rounded-full"
                    >
                        Iniciar Sesión
                    </button>
                    {successMessage && <p className="mt-2 text-center text-green-600 text-sm">{successMessage}</p>}
                    <div className="relative my-4 text-center">
                        <span className="relative z-10 text-gray-600 px-3 bg-white/70 text-sm">o</span>
                        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gray-400"></div>
                    </div>
                    <div className="mt-3 text-center text-gray-600 text-sm">
                        <span className="text-xs">
                            ¿Aún no tienes una cuenta?
                        </span>
                        <a
                            onClick={() => navigate('/register')}
                            className="ml-1 font-bold text-[#2e69e5] hover:text-[#75a4f1] transition-colors cursor-pointer"
                        >
                            Registrarse
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;
