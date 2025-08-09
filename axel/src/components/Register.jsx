import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, User, Mail, Lock, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

import logo from "../assets/img/logo.png";
import videoBackground from "../assets/video/Fondo.mp4"; 

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [passwordValidation, setPasswordValidation] = useState({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        symbol: false,
    });
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        const password = formData.password;
        if (password) {
            setPasswordValidation({
                length: password.length >= 8,
                uppercase: /[A-Z]/.test(password),
                lowercase: /[a-z]/.test(password),
                number: /\d/.test(password),
                symbol: /[!@#$%^&*(),.?":{}|<>]/.test(password),
            });
        } else {
            setPasswordValidation({
                length: false,
                uppercase: false,
                lowercase: false,
                number: false,
                symbol: false,
            });
        }
    }, [formData.password]);


    const handleChange = (e) => {
        const { id, value } = e.target;
        let newValue = value;

        if (id === 'name') {
            newValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
            if (newValue.startsWith(' ')) {
                newValue = newValue.trimStart();
            }
            if (/\s{3,}/.test(newValue)) {
                newValue = newValue.replace(/\s{3,}/g, ' ');
            }
        }
        if (id === 'email' || id === 'password') {
            newValue = value.replace(/\s/g, '');
        }

        setFormData((prevData) => ({ ...prevData, [id]: newValue }));
        setSuccessMessage('');
        setErrors({});
    };

    const validateForm = () => {
        const newErrors = {};
        const trimmedName = formData.name.trim();

        if (!formData.name) {
            newErrors.name = 'El nombre es obligatorio.';
        } else if (trimmedName.length < 3) {
            newErrors.name = 'El nombre debe tener al menos 3 letras.';
        }
        if (!formData.email) {
            newErrors.email = 'El email es obligatorio.';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Ingresa un email válido.';
        }
        
        if (!passwordValidation.length || !passwordValidation.uppercase || !passwordValidation.lowercase || !passwordValidation.number || !passwordValidation.symbol) {
            newErrors.password = 'La contraseña no cumple con todos los requisitos.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
                const user = userCredential.user;
                
                const userDocRef = doc(db, `users/${user.uid}`);
                await setDoc(userDocRef, {
                    name: formData.name,
                    email: user.email,
                    createdAt: new Date(),
                });

                setSuccessMessage('¡Registro exitoso! Redirigiendo a la página de inicio de sesión.');
                
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } catch (error) {
                let errorMessage = 'Ocurrió un error durante el registro. Inténtalo de nuevo.';
                switch (error.code) {
                    case 'auth/email-already-in-use':
                        errorMessage = 'Este email ya está en uso. Por favor, inicia sesión o usa otro email.';
                        break;
                    case 'auth/invalid-email':
                        errorMessage = 'El formato del email es inválido.';
                        break;
                    case 'auth/weak-password':
                        errorMessage = 'La contraseña es demasiado débil. Debe tener al menos 8 caracteres, mayúscula, minúscula, número y símbolo.';
                        break;
                    default:
                        errorMessage = 'Ocurrió un error inesperado. Código de error: ' + error.code;
                }
                setErrors({ general: errorMessage });
                setSuccessMessage('');
                console.error("Error de registro:", error);
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
                        Registrarse
                    </h2>
                    <p className="text-center text-sm text-gray-600 mt-1">
                        Únete a nuestra comunidad para acceder a esta herramienta
                    </p>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="name" className="block text-sm font-medium mb-1 text-gray-700">
                            Nombre
                        </label>
                        <div className="relative shadow-sm rounded-lg">
                            <input
                                type="text"
                                id="name"
                                placeholder="Ingresa tu nombre"
                                className="w-full pl-9 pr-3 py-2 bg-white/80 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#75a4f1] text-gray-800 placeholder-gray-500 transition-colors text-sm rounded-lg"
                                value={formData.name}
                                onChange={handleChange}
                            />
                            <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        </div>
                        {errors.name && <p className="mt-1 text-xs text-red-700">{errors.name}</p>}
                    </div>
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
                        {errors.email && <p className="mt-1 text-xs text-red-700">{errors.email}</p>}
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
                                onFocus={() => setIsFocused(true)}
                                onBlur={() => setIsFocused(false)}
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
                        {isFocused && (
                            <div className="mt-2 text-xs grid grid-cols-1 md:grid-cols-2 gap-1 text-gray-600">
                                <p className={`flex items-center gap-1 ${passwordValidation.length ? 'text-green-700' : 'text-red-700'}`}>
                                    {passwordValidation.length ? <Check size={12} /> : <X size={12} />} 8 o más caracteres
                                </p>
                                <p className={`flex items-center gap-1 ${passwordValidation.uppercase ? 'text-green-700' : 'text-red-700'}`}>
                                    {passwordValidation.uppercase ? <Check size={12} /> : <X size={12} />} Una mayúscula
                                </p>
                                <p className={`flex items-center gap-1 ${passwordValidation.lowercase ? 'text-green-700' : 'text-red-700'}`}>
                                    {passwordValidation.lowercase ? <Check size={12} /> : <X size={12} />} Una minúscula
                                </p>
                                <p className={`flex items-center gap-1 ${passwordValidation.number ? 'text-green-700' : 'text-red-700'}`}>
                                    {passwordValidation.number ? <Check size={12} /> : <X size={12} />} Un número
                                </p>
                                <p className={`flex items-center gap-1 ${passwordValidation.symbol ? 'text-green-700' : 'text-red-700'}`}>
                                    {passwordValidation.symbol ? <Check size={12} /> : <X size={12} />} Un símbolo especial
                                </p>
                            </div>
                        )}
                        {errors.password && <p className="mt-1 text-xs text-red-700">{errors.password}</p>}
                    </div>
                    {errors.general && <p className="mt-2 text-center text-sm text-red-700">{errors.general}</p>}
                    <button
                        type="submit"
                        className="w-full py-2 mt-4 text-base font-bold text-white bg-[#2e69e5] hover:bg-[#75a4f1] shadow-lg transition-colors duration-300 transform hover:scale-105 rounded-full"
                    >
                        Registrarse
                    </button>
                    {successMessage && <p className="mt-2 text-center text-green-700 text-sm">{successMessage}</p>}
                    <div className="relative my-4 text-center">
                        <span className="relative z-10 text-gray-600 px-3 bg-white/70 text-sm">o</span>
                        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gray-400"></div>
                    </div>
                    <div className="mt-3 text-center text-gray-600 text-sm">
                        <span className="text-xs">
                            ¿Ya tienes una cuenta?
                        </span>
                        <a
                            onClick={() => navigate('/login')}
                            className="ml-1 font-bold text-[#2e69e5] hover:text-[#75a4f1] transition-colors cursor-pointer"
                        >
                            Iniciar Sesión
                        </a>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Register;
