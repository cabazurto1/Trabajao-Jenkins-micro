// src/App.jsx
import { useState } from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import Estudiantes from './pages/Estudiantes';
import Cursos from './pages/Cursos';
import CursoEstudiante from './pages/CursoEstudiante';
import './App.css';

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo">
            <span className="logo-icon">🎓</span>
            <span className="logo-text">EduManager Actualizado </span>
          </div>
          
          <div className={`menu ${menuOpen ? 'menu-open' : ''}`}>
            <NavLink 
              to="/estudiantes" 
              className={({ isActive }) => (isActive ? 'link active-link' : 'link')}
              onClick={closeMenu}
            >
              <span className="link-icon">👥</span>
              Estudiantes
            </NavLink>
            <NavLink 
              to="/cursos" 
              className={({ isActive }) => (isActive ? 'link active-link' : 'link')}
              onClick={closeMenu}
            >
              <span className="link-icon">📚</span>
              Cursos
            </NavLink>
            <NavLink 
              to="/curso-estudiante" 
              className={({ isActive }) => (isActive ? 'link active-link' : 'link')}
              onClick={closeMenu}
            >
              <span className="link-icon">🔗</span>
              Asignaciones
            </NavLink>
          </div>

          <button 
            className={`menu-toggle ${menuOpen ? 'menu-toggle-open' : ''}`}
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </button>
        </div>
      </nav>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/estudiantes" replace />} />
          <Route path="/estudiantes" element={<Estudiantes />} />
          <Route path="/cursos" element={<Cursos />} />
          <Route path="/curso-estudiante" element={<CursoEstudiante />} />
        </Routes>
      </main>
    </div>
  );
}