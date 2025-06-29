// src/App.jsx
import { Routes, Route, NavLink } from 'react-router-dom';
import Estudiantes from './pages/Estudiantes';
import Cursos from './pages/Cursos';
import CursoEstudiante from './pages/CursoEstudiante';
import './App.css';

export default function App() {
  return (
    <div className="app-container">
      <nav className="navbar">
        <div className="logo">MyApp</div>
        <div className="menu">
          <NavLink to="/estudiantes" className={({ isActive }) => (isActive ? 'active-link' : 'link')}>Estudiantes</NavLink>
          <NavLink to="/cursos" className={({ isActive }) => (isActive ? 'active-link' : 'link')}>Cursos</NavLink>
          <NavLink to="/curso-estudiante" className={({ isActive }) => (isActive ? 'active-link' : 'link')}>Curso-Estudiante</NavLink>
        </div>
      </nav>
      <main className="main-content">
        <Routes>
          <Route path="/estudiantes" element={<Estudiantes />} />
          <Route path="/cursos" element={<Cursos />} />
          <Route path="/curso-estudiante" element={<CursoEstudiante />} />
        </Routes>
      </main>
    </div>
  );
}
