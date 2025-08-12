import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../AppContext';
import { Mic, XCircle, Loader, MessageCircle } from 'lucide-react';
import { addDoc, collection } from 'firebase/firestore';
import moment from 'moment';
import 'moment/locale/es';


const geminiApiKey = 'AIzaSyCGpY19HXCoMXm2QPX3gzLkcINJ-HOrI6I';
const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${geminiApiKey}`;

const withExponentialBackoff = async (func, retries = 3, delay = 1000) => {
    try {
        return await func();
    } catch (error) {
        if (retries > 0) {
            console.warn(`Attempt failed. Retrying in ${delay}ms...`);
            await new Promise(res => setTimeout(res, delay));
            return withExponentialBackoff(func, retries - 1, delay * 2);
        } else {
            throw error;
        }
    }
};

const AsistenteDeVoz = () => {
    const navigate = useNavigate();
    const [listening, setListening] = useState(false);
    const [isThinking, setIsThinking] = useState(false);
    const [assistantResponse, setAssistantResponse] = useState('');
    const recognitionRef = useRef(null);
    const { user, db, appId } = useAppContext();
    const synthRef = useRef(window.speechSynthesis);
    const hasGreeted = useRef(false);

    useEffect(() => {
        if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.lang = 'es-ES';
            moment.locale('es');

            recognitionRef.current.onresult = (event) => {
                const newTranscript = event.results[0][0].transcript;
                handleVoiceCommand(newTranscript);
            };

            recognitionRef.current.onend = () => {
                setListening(false);
            };

            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                setAssistantResponse('Lo siento, hubo un error al reconocer tu voz.');
                setListening(false);
            };
        } else {
            console.warn('Speech Recognition is not supported in this browser.');
        }

        if (synthRef.current && !hasGreeted.current) {
            const voices = synthRef.current.getVoices();
            if (voices.length > 0) {
                speak("Hola, ¿qué quieres hacer hoy?");
                hasGreeted.current = true;
            }
        }
    }, [synthRef]);

    useEffect(() => {
        if (assistantResponse) {
            const timer = setTimeout(() => {
                setAssistantResponse('');
            }, 10000);
            return () => clearTimeout(timer);
        }
    }, [assistantResponse]);

    const speak = (text) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-ES';
        synthRef.current.speak(utterance);
    };

    const toggleListening = () => {
        if (!user) {
            setAssistantResponse('Debes iniciar sesión para usar el asistente de voz.');
            return;
        }
        if (listening) {
            recognitionRef.current.stop();
            setListening(false);
        } else {
            setListening(true);
            recognitionRef.current.start();
        }
    };

    const handleVoiceCommand = async (command) => {
        if (!command.trim() || !user || !db || !appId) {
            setAssistantResponse('Lo siento, hubo un error de configuración. Asegúrate de que tu sesión esté activa y las variables de entorno configuradas.');
            return;
        }
        setIsThinking(true);
        setAssistantResponse('');

        const prompt = `
            Eres un asistente de gestión de tareas. El usuario te dará un comando para gestionar sus tareas.
            Responde con un objeto JSON indicando la acción a tomar. Si la acción no puede ser determinada, retorna un JSON con "action": "none".

            Comandos y ejemplos posibles:
            - "crea una tarea llamada 'nuevo título'": {"action": "create", "title": "nuevo título", "type": "task"}
            - "añade una tarea que diga 'comprar leche'": {"action": "create", "title": "comprar leche", "type": "task"}
            - "crear una lista de compras con pan, leche y huevos": {"action": "create", "title": "lista de compras", "type": "list", "sections": ["pan", "leche", "huevos"]}
            - "crea una lista llamada 'tareas del hogar' con limpiar el baño, lavar la ropa y sacar la basura": {"action": "create", "title": "tareas del hogar", "type": "list", "sections": ["limpiar el baño", "lavar la ropa", "sacar la basura"]}
            - "recuérdame llamar a juan a las 1:55 pm": {"action": "create", "title": "recordar llamar a juan", "time": "2025-08-12T13:55:00", "type": "reminder"} (Usa la fecha de hoy si no se especifica)
            - "ir a tareas": {"action": "navigate", "page": "/tareas"}
            - "ir a listas": {"action": "navigate", "page": "/"}
            - "ir a historial": {"action": "navigate", "page": "/historial"}
            - "ir a recordatorios": {"action": "navigate", "page": "/recordatorios"}

            Comando del usuario: "${command}"
        `;

        const payload = {
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "OBJECT",
                    properties: {
                        "action": { "type": "STRING" },
                        "title": { "type": "STRING" },
                        "page": { "type": "STRING" },
                        "time": { "type": "STRING" },
                        "type": { "type": "STRING" },
                        "sections": { "type": "ARRAY", "items": { "type": "STRING" } } // Nuevo campo para las secciones
                    },
                    "propertyOrdering": ["action", "title", "page", "time", "type", "sections"]
                }
            }
        };

        try {
            const response = await withExponentialBackoff(() =>
                fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                })
            );

            if (!response.ok) {
                console.error('API response error:', await response.text());
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            const jsonText = result?.candidates?.[0]?.content?.parts?.[0]?.text;
            const parsedJson = JSON.parse(jsonText);
            const now = new Date();

            if (parsedJson.action === 'create') {
                let newItem = {
                    title: parsedJson.title,
                    createdAt: now,
                    completed: false,
                };
                let collectionName;
                let successMessage;
                let redirectPath;

                if (parsedJson.type === 'task') {
                    collectionName = 'tasks';
                    successMessage = `Tarea "${parsedJson.title}" creada.`;
                    redirectPath = '/tareas';
                } else if (parsedJson.type === 'list') { // Nuevo tipo 'list'
                    collectionName = 'lists';
                    newItem.sections = (parsedJson.sections || []).map(text => ({ text, completed: false }));
                    successMessage = `Lista "${parsedJson.title}" creada con ${newItem.sections.length} elementos.`;
                    redirectPath = '/';
                } else if (parsedJson.type === 'reminder') {
                    collectionName = 'reminders';
                    newItem.reminderTime = parsedJson.time ? new Date(parsedJson.time) : null;
                    const timeString = newItem.reminderTime ? moment(newItem.reminderTime).format('h:mm a') : 'sin hora definida';
                    successMessage = `Recordatorio "${parsedJson.title}" creado para hoy a las ${timeString}.`;
                    redirectPath = '/recordatorios';
                } else {
                    const fallbackMsg = 'No pude entender tu comando. Intenta ser más específico.';
                    setAssistantResponse(fallbackMsg);
                    speak(fallbackMsg);
                    setIsThinking(false);
                    return;
                }

                await addDoc(collection(db, `artifacts/${appId}/users/${user.uid}/${collectionName}`), newItem);
                setAssistantResponse(successMessage);
                speak(successMessage);

                setTimeout(() => navigate(redirectPath), 1500);

            } else if (parsedJson.action === 'navigate') {
                navigate(parsedJson.page);
                const navigateMsg = `Navegando a ${parsedJson.page.replace('/', '') || 'listas'}.`;
                setAssistantResponse(navigateMsg);
                speak(navigateMsg);
            } else {
                const fallbackMsg = 'No pude entender tu comando. Intenta ser más específico.';
                setAssistantResponse(fallbackMsg);
                speak(fallbackMsg);
            }
        } catch (err) {
            console.error("Error with assistant API or command processing:", err);
            const msg = 'Hubo un error al procesar tu comando. Inténtalo de nuevo.';
            setAssistantResponse(msg);
            speak(msg);
        } finally {
            setIsThinking(false);
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {assistantResponse && (
                <div className="flex items-start bg-blue-600 text-white p-3 rounded-xl shadow-xl max-w-xs text-sm mb-4">
                    <MessageCircle size={20} className="mt-1 mr-2 flex-shrink-0" />
                    <span>{assistantResponse}</span>
                </div>
            )}
            <button
                onClick={toggleListening}
                className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg transition-colors duration-300
                    ${listening ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-600 hover:bg-blue-700'}
                `}
                disabled={isThinking}
            >
                {isThinking ? (
                    <Loader size={24} className="animate-spin" />
                ) : listening ? (
                    <XCircle size={24} />
                ) : (
                    <Mic size={24} />
                )}
            </button>
        </div>
    );
};

export default AsistenteDeVoz;