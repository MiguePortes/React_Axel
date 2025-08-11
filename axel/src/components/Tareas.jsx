import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import soundFile from "/src/assets/sonido/new-notification-028-383966.mp3";
import { useNavigate } from "react-router-dom";

const categories = [
  { id: "trabajo", label: "Trabajo", color: "bg-blue-500" },
  { id: "personal", label: "Personal", color: "bg-green-500" },
  { id: "estudio", label: "Estudio", color: "bg-yellow-400" },
  { id: "salud", label: "Salud", color: "bg-red-500" },
];

const priorityOptions = [
  { id: "alta", label: "Alta", color: "bg-red-600" },
  { id: "media", label: "Media", color: "bg-yellow-500" },
  { id: "baja", label: "Baja", color: "bg-green-600" },
];

const repeatOptions = [
  { id: "none", label: "Ninguno" },
  { id: "daily", label: "Diario" },
  { id: "weekly", label: "Semanal" },
  { id: "monthly", label: "Mensual" },
];

export default function Tareas() {
  const navigate = useNavigate();

  // Comprobar si hay usuario logueado
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      navigate("/login"); // Si no hay usuario, mandar al login
    }
  }, [navigate]);

  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem("tasks");
    return saved ? JSON.parse(saved) : [];
  });

  const [taskText, setTaskText] = useState("");
  const [taskTime, setTaskTime] = useState("");
  const [taskCategory, setTaskCategory] = useState(categories[0].id);
  const [taskPriority, setTaskPriority] = useState("media");
  const [taskRepeat, setTaskRepeat] = useState("none");
  const [taskTags, setTaskTags] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");

  useEffect(() => {
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }, [tasks]);

  const playSound = () => {
    const audio = new Audio(soundFile);
    audio.play().catch(() => {});
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5);
      tasks.forEach((task) => {
        if (!task.completed && task.time === currentTime && !task.notified) {
          playSound();
          alert(`⏰ ¡Recordatorio! Tarea: ${task.text}`);
          setTasks((prev) =>
            prev.map((t) =>
              t.id === task.id ? { ...t, notified: true } : t
            )
          );
        }
      });
    }, 60000);

    return () => clearInterval(interval);
  }, [tasks]);

  const addTask = () => {
    if (!taskText.trim() || !taskTime) {
      alert("Por favor escribe una tarea y selecciona la hora");
      return;
    }
    const newTask = {
      id: Date.now(),
      text: taskText,
      time: taskTime,
      category: taskCategory,
      priority: taskPriority,
      repeat: taskRepeat,
      tags: taskTags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0),
      completed: false,
      notified: false,
    };
    setTasks([...tasks, newTask]);
    setTaskText("");
    setTaskTime("");
    setTaskCategory(categories[0].id);
    setTaskPriority("media");
    setTaskRepeat("none");
    setTaskTags("");
  };

  const toggleComplete = (id) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const exportTaskToPDF = (task) => {
    const doc = new jsPDF();

    doc.setFontSize(22);
    doc.text("Plan / Tarea", 105, 25, null, null, "center");
    doc.setFontSize(14);
    doc.text(`Descripción: ${task.text}`, 20, 50);
    doc.text(`Hora: ${task.time}`, 20, 60);
    const categoryLabel =
      categories.find((cat) => cat.id === task.category)?.label || "";
    doc.text(`Categoría: ${categoryLabel}`, 20, 70);
    const priorityLabel =
      priorityOptions.find((p) => p.id === task.priority)?.label || "Media";
    doc.text(`Prioridad: ${priorityLabel}`, 20, 80);
    const repeatLabel =
      repeatOptions.find((opt) => opt.id === task.repeat)?.label || "Ninguno";
    doc.text(`Repetición: ${repeatLabel}`, 20, 90);
    if (task.tags && task.tags.length > 0) {
      doc.text(`Etiquetas: ${task.tags.join(", ")}`, 20, 100);
    }
    doc.save(`tarea_${task.id}.pdf`);
  };

  const filteredTasks = tasks.filter((task) => {
    if (filterCategory !== "all" && task.category !== filterCategory) return false;
    if (filterPriority !== "all" && task.priority !== filterPriority) return false;
    return true;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Cerrar sesión
  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div
      className={`max-w-5xl mx-auto p-8 rounded-lg shadow-lg ${
        darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"
      }`}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-5xl font-extrabold tracking-wide">Planificador de Tareas</h1>
        <div className="flex gap-3">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-5 py-3 rounded-lg shadow-lg hover:from-purple-600 hover:to-indigo-600 transition font-semibold"
          >
            {darkMode ? "Modo Claro" : "Modo Oscuro"}
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-5 py-3 rounded-lg shadow-lg hover:bg-red-700 transition font-semibold"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-4 mb-8 flex-wrap justify-center">
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="p-3 border rounded-lg"
        >
          <option value="all">Todas las Categorías</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.label}
            </option>
          ))}
        </select>
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="p-3 border rounded-lg"
        >
          <option value="all">Todas las Prioridades</option>
          {priorityOptions.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      {/* Formulario */}
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4 mb-12 items-center">
        <input
          type="text"
          placeholder="Descripción de la tarea..."
          value={taskText}
          onChange={(e) => setTaskText(e.target.value)}
          className="col-span-3 p-3 border rounded-lg"
        />
        <input
          type="time"
          value={taskTime}
          onChange={(e) => setTaskTime(e.target.value)}
          className="p-3 border rounded-lg"
        />
        <select
          value={taskCategory}
          onChange={(e) => setTaskCategory(e.target.value)}
          className="p-3 border rounded-lg"
        >
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.label}
            </option>
          ))}
        </select>
        <select
          value={taskPriority}
          onChange={(e) => setTaskPriority(e.target.value)}
          className="p-3 border rounded-lg"
        >
          {priorityOptions.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Etiquetas (separar con coma)"
          value={taskTags}
          onChange={(e) => setTaskTags(e.target.value)}
          className="col-span-2 p-3 border rounded-lg"
        />
        <button
          onClick={addTask}
          className="col-span-1 bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition font-semibold"
        >
          Agregar
        </button>
      </div>

      {/* Lista de tareas */}
      <ul className="space-y-5">
        {filteredTasks.length === 0 && (
          <p className="text-center text-gray-500">No hay tareas para mostrar.</p>
        )}
        {filteredTasks.map((task) => {
          const cat = categories.find((c) => c.id === task.category);
          const prio = priorityOptions.find((p) => p.id === task.priority);
          return (
            <li
              key={task.id}
              className={`flex justify-between items-center p-5 rounded-2xl shadow-md ${
                task.completed ? "opacity-60" : ""
              }`}
            >
              <div className="flex items-center space-x-5 flex-1 min-w-0">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleComplete(task.id)}
                  className="w-6 h-6"
                />
                <div className="truncate">
                  <p
                    className={`text-lg font-semibold truncate ${
                      task.completed ? "line-through text-gray-400" : ""
                    }`}
                  >
                    {task.text}
                  </p>
                  <p className="text-sm text-gray-600">
                    {task.time} • {cat?.label} • {prio?.label} • Etiquetas:{" "}
                    {task.tags?.length > 0 ? task.tags.join(", ") : "—"}
                  </p>
                </div>
              </div>
              <div className="flex space-x-3 ml-5">
                <button
                  onClick={() => exportTaskToPDF(task)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
                >
                  📄 PDF
                </button>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg"
                >
                  🗑️
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
