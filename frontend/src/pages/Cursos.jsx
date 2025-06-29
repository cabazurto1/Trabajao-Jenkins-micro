import { useState, useEffect } from "react";
import {
  getCursos,
  createCurso,
  deleteCurso,
  updateCurso,
} from "../services/api";
import './styles.css';

export default function Cursos() {
  const [cursos, setCursos] = useState([]);
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [creditos, setCreditos] = useState(0);
  const [editando, setEditando] = useState(null);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    fetchCursos();
  }, []);

  const fetchCursos = async () => {
    const { data } = await getCursos();
    setCursos(data.data);
  };

  const handleCreateOrUpdate = async () => {
    if (!nombre || !descripcion || creditos <= 0) {
      alert("Por favor, completa todos los campos correctamente.");
      return;
    }

    if (editando) {
      await updateCurso(editando, { nombre, descripcion, creditos });
      setEditando(null);
    } else {
      await createCurso({ nombre, descripcion, creditos });
    }

    resetForm();
    fetchCursos();
  };

  const handleEdit = (curso) => {
    setNombre(curso.nombre);
    setDescripcion(curso.descripcion);
    setCreditos(curso.creditos);
    setEditando(curso.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de eliminar este curso?")) {
      await deleteCurso(id);
      fetchCursos();
    }
  };

  const resetForm = () => {
    setNombre("");
    setDescripcion("");
    setCreditos(0);
    setEditando(null);
  };

  const cursosFiltrados = cursos.filter(
    (curso) =>
      curso.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      curso.descripcion.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div>
      <h1>Cursos</h1>
      <div className="search-container">
        <input
          type="text"
          placeholder="Buscar cursos..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>
      <div className="form-container">
        <input
          placeholder="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />
        <input
          placeholder="Descripción"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
        />
        <input
          type="number"
          placeholder="Créditos"
          value={creditos}
          onChange={(e) => setCreditos(Number(e.target.value))}
        />
        <button onClick={handleCreateOrUpdate}>
          {editando ? "Actualizar Curso" : "Crear Curso"}
        </button>
        {editando && (
          <button onClick={resetForm} className="cancel">
            Cancelar
          </button>
        )}
      </div>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Descripción</th>
            <th>Créditos</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {cursosFiltrados.map((curso) => (
            <tr key={curso.id}>
              <td>{curso.nombre}</td>
              <td>{curso.descripcion}</td>
              <td>{curso.creditos}</td>
              <td>
                <button onClick={() => handleEdit(curso)}>Editar</button>
                <button
                  onClick={() => handleDelete(curso.id)}
                  className="delete"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
