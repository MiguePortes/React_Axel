import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Bienvenida from "./components/Bienvenida";
import Login from "./components/Login";
import Tareas from './components/Tareas';

function App() {
  return (
    // <BrowserRouter>
    //   <Routes>
    //     <Route path="/" element={<Bienvenida />} />
    //     <Route path="/login" element={<Login />} />
    //   </Routes>
    // </BrowserRouter>
    <Tareas/>
  );
}

export default App;
