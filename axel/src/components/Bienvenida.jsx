import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/img/Blue_Modern_Artificial_Intelligence_Technology_Logo-removebg-preview.png";
import ia from "../assets/img/ia-dia-a-dia-removebg-preview.png";

export default function Bienvenida({ onFinish }) {
    const navigate = useNavigate();

    const handleStart = () => {
        onFinish();
        navigate("/login");
    };

    return (
        <>
            <style>{`
                @keyframes gradient-x {
                    0%, 100% { background-position: 0% center; }
                    50% { background-position: 100% center; }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-12px); }
                }
                @keyframes pulse {
                    0%, 100% { opacity: 0.5; }
                    50% { opacity: 0.9; }
                }
                .animate-gradient-x {
                    animation: gradient-x 8s ease infinite;
                    background-size: 200% 200%;
                }
                .animate-float {
                    animation: float 4s ease-in-out infinite;
                }
                .animate-pulse {
                    animation: pulse 4s ease-in-out infinite;
                }
                .shadow-neon {
                    box-shadow: 0 0 25px 6px rgba(59,130,246,0.85), 0 0 50px 14px rgba(59,130,246,0.6);
                }
                .logo-shadow {
                    filter: drop-shadow(0 0 10px rgba(59,130,246,0.8)) drop-shadow(0 0 20px rgba(59,130,246,0.6));
                }
            `}</style>

            <div className="relative min-h-[75vh] flex items-center justify-center px-6 py-12 overflow-hidden bg-gradient-to-r from-white to-blue-900">
                <div className="absolute inset-0 -z-20 bg-gradient-to-tr from-blue-900 via-blue-800 to-blue-700 animate-gradient-x opacity-90"></div>
                <div className="relative max-w-7xl w-full flex flex-col md:flex-row items-center justify-between gap-16 z-10">
                    <div className="flex-1 max-w-lg bg-white/10 backdrop-blur-3xl rounded-3xl shadow-neon p-12 text-blue-900 ring-1 ring-blue-300/40 text-center md:text-left">
                        <img
                            src={logo}
                            alt="Axel Asistente Web Logo"
                            className="mx-auto md:mx-0 w-52 h-auto mb-14 logo-shadow"
                        />
                        <h1 className="text-5xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-900 via-blue-600 to-blue-400 drop-shadow-xl">
                            Axel Asistente Web
                        </h1>
                        <p className="text-lg mb-10 leading-relaxed text-blue-900/95 drop-shadow-md">
                            ¡Hola! Soy <strong>Axel</strong>, un asistente web para aydarte a recordar tus planes de tu dia a dia 💡
                        </p>
                        <button
                            onClick={handleStart}
                            className="relative inline-block px-16 py-4 font-semibold rounded-full text-white bg-blue-700 shadow-lg overflow-hidden group transition duration-500 hover:shadow-neon hover:scale-[1.05]"
                            aria-label="Comenzar"
                        >
                            <span className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 opacity-95 blur-lg filter group-hover:opacity-100 transition duration-500"></span>
                            <span className="relative z-10">Comenzar</span>
                        </button>
                    </div>
                    <div className="relative flex-1 flex items-center justify-center">
                        <div className="absolute w-[460px] h-[460px] rounded-full bg-gradient-to-tr from-blue-400 via-blue-700 to-blue-900 opacity-50 shadow-neon animate-pulse -z-10"></div>
                        <img
                            src={ia}
                            alt="Asistente IA"
                            className="w-[400px] h-auto object-contain drop-shadow-[0_0_50px_rgba(59,130,246,0.8)] rounded-3xl animate-float"
                        />
                    </div>
                </div>
            </div>
        </>
    );
}