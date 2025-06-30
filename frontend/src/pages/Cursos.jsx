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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchCursos();
  }, []);

  // Limpiar mensajes después de 5 segundos
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const fetchCursos = async () => {
    try {
      setLoading(true);
      const { data } = await getCursos();
      // Validar estructura de respuesta
      if (data && Array.isArray(data.data)) {
        setCursos(data.data);
      } else if (Array.isArray(data)) {
        setCursos(data);
      } else {
        setCursos([]);
        console.error("Formato de cursos no válido");
      }
    } catch (err) {
      console.error("Error al obtener cursos:", err);
      setError("Error al cargar los cursos");
      setCursos([]);
    } finally {
      setLoading(false);
    }
  };

  const validarFormulario = () => {
    // Limpiar mensajes anteriores
    setError("");

    // Validar nombre
    if (!nombre || nombre.trim().length === 0) {
      setError("El nombre del curso es requerido");
      return false;
    }

    if (nombre.trim().length < 3) {
      setError("El nombre debe tener al menos 3 caracteres");
      return false;
    } 

    // Validar descripción
    if (!descripcion || descripcion.trim().length === 0) {
      setError("La descripción es requerida");
      return false;
    }

    if (descripcion.trim().length < 10) {
      setError("La descripción debe tener al menos 10 caracteres");
      return false;
    }

    // Validar créditos
    if (!creditos || creditos <= 0) {
      setError("Los créditos deben ser mayor a 0");
      return false;
    }

    if (creditos > 10) {
      setError("Los créditos no pueden ser mayor a 10");
      return false;
    }

    if (!Number.isInteger(Number(creditos))) {
      setError("Los créditos deben ser un número entero");
      return false;
    }

    return true;
  };

  const handleCreateOrUpdate = async () => {
    if (!validarFormulario()) {
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const cursoData = {
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        creditos: parseInt(creditos)
      };

      if (editando) {
        await updateCurso(editando, cursoData);
        setSuccess("Curso actualizado exitosamente");
        setEditando(null);
      } else {
        // Verificar si el curso ya existe
        const cursoExistente = cursos.find(
          c => c.nombre.toLowerCase() === cursoData.nombre.toLowerCase()
        );
        
        if (cursoExistente) {
          setError("Ya existe un curso con ese nombre");
          setLoading(false);
          return;
        }

        await createCurso(cursoData);
        setSuccess("Curso creado exitosamente");
      }

      resetForm();
      await fetchCursos();
    } catch (error) {
      console.error("Error al procesar curso:", error);
      
      if (error.response) {
        if (error.response.status === 409) {
          setError("Ya existe un curso con ese nombre");
        } else if (error.response.data && error.response.data.message) {
          setError(error.response.data.message);
        } else {
          setError("Error al procesar el curso");
        }
      } else if (error.request) {
        setError("Error de conexión con el servidor");
      } else {
        setError("Error inesperado");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (curso) => {
    if (!curso || !curso.id) {
      setError("Datos del curso inválidos");
      return;
    }

    setNombre(curso.nombre || "");
    setDescripcion(curso.descripcion || "");
    setCreditos(curso.creditos || 0);
    setEditando(curso.id);
    setError("");
    setSuccess("");
  };

  const handleDelete = async (id) => {
    if (!id || isNaN(parseInt(id))) {
      setError("ID de curso no válido");
      return;
    }

    if (!window.confirm("¿Estás seguro de eliminar este curso?")) {
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await deleteCurso(id);
      setSuccess("Curso eliminado exitosamente");
      await fetchCursos();
    } catch (error) {
      console.error("Error al eliminar:", error);
      if (error.response && error.response.status === 404) {
        setError("El curso no existe");
      } else if (error.response && error.response.status === 400) {
        setError("No se puede eliminar el curso porque tiene estudiantes asignados");
      } else {
        setError("Error al eliminar el curso");
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNombre("");
    setDescripcion("");
    setCreditos(0);
    setEditando(null);
    setError("");
    setSuccess("");
  };

  const cursosFiltrados = cursos.filter(
    (curso) =>
      (curso.nombre && curso.nombre.toLowerCase().includes(busqueda.toLowerCase())) ||
      (curso.descripcion && curso.descripcion.toLowerCase().includes(busqueda.toLowerCase()))
  );

  return (
    <div className="main-wrapper">
      <div className="container">
        <h1>Gestión de Cursos</h1>

        {/* Mensajes de estado */}
        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}
        
        {success && (
          <div className="alert alert-success">
            {success}
          </div>
        )}

        {/* Barra de búsqueda */}
        <div className="search-container">
          <input
            type="text"
            placeholder="Buscar cursos por nombre o descripción..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            disabled={loading}
          />
        </div>

        {/* Formulario */}
        <div className="form-container">
          <div className="form-row">
            <div className="form-group">
              <input
                placeholder="Nombre del curso"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                disabled={loading}
                maxLength={100}
              />
            </div>
            <div className="form-group">
              <input
                type="number"
                placeholder="Créditos (1-10)"
                value={creditos}
                onChange={(e) => setCreditos(Number(e.target.value))}
                disabled={loading}
                min="1"
                max="10"
              />
            </div>
          </div>
          
          <div className="form-group">
            <input
              placeholder="Descripción del curso"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              disabled={loading}
              maxLength={255}
            />
          </div>

          <div style={{ textAlign: 'center' }}>
            <button 
              onClick={handleCreateOrUpdate}
              className="btn-primary"
              disabled={loading}
            >
              {loading ? (
                <span className="loading"></span>
              ) : (
                editando ? "Actualizar Curso" : "Crear Curso"
              )}
            </button>
            {editando && (
              <button 
                onClick={resetForm} 
                className="cancel"
                disabled={loading}
              >
                Cancelar
              </button>
            )}
          </div>
        </div>

        {/* Tabla */}
        <div className="table-container">
          {loading && cursos.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <span className="loading"></span> Cargando cursos...
            </div>
          ) : (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th style={{ textAlign: 'center' }}>Créditos</th>
                    <th style={{ textAlign: 'center' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {cursosFiltrados.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '2rem' }}>
                        {busqueda 
                          ? "No se encontraron cursos con ese criterio de búsqueda" 
                          : "No hay cursos registrados"}
                      </td>
                    </tr>
                  ) : (
                    cursosFiltrados.map((curso) => (
                      <tr key={curso.id}>
                        <td>{curso.nombre}</td>
                        <td>{curso.descripcion}</td>
                        <td style={{ textAlign: 'center' }}>{curso.creditos}</td>
                        <td style={{ textAlign: 'center' }}>
                          <button 
                            onClick={() => handleEdit(curso)}
                            className="edit"
                            disabled={loading}
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDelete(curso.id)}
                            className="delete"
                            disabled={loading}
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}