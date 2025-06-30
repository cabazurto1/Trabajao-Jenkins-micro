import { useState, useEffect } from "react";
import {
  asignarEstudianteACurso,
  obtenerRelaciones,
  eliminarRelacion,
  getEstudiantes,
  getCursos,
  actualizarRelacion,
} from "../services/api";
import './styles.css';

export default function CursoEstudiante() {
  const [relaciones, setRelaciones] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [estudianteId, setEstudianteId] = useState("");
  const [cursoId, setCursoId] = useState("");
  const [editando, setEditando] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchRelaciones();
    fetchEstudiantes();
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

  const fetchRelaciones = async () => {
    try {
      setLoading(true);
      const { data } = await obtenerRelaciones();
      // Validar que data sea un array
      setRelaciones(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error al obtener relaciones:", err);
      setError("Error al cargar las relaciones");
      setRelaciones([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchEstudiantes = async () => {
    try {
      const { data } = await getEstudiantes();
      // Validar estructura de respuesta
      if (data && Array.isArray(data.data)) {
        setEstudiantes(data.data);
      } else if (Array.isArray(data)) {
        setEstudiantes(data);
      } else {
        setEstudiantes([]);
        console.error("Formato de estudiantes no válido");
      }
    } catch (err) {
      console.error("Error al obtener estudiantes:", err);
      setError("Error al cargar los estudiantes");
      setEstudiantes([]);
    }
  };

  const fetchCursos = async () => {
    try {
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
    }
  };

  const validarRelacionDuplicada = () => {
    // Verificar si ya existe la relación
    const relacionExistente = relaciones.find(
      rel => rel.estudianteId === parseInt(estudianteId) && 
             rel.cursoId === parseInt(cursoId) &&
             rel.id !== editando
    );
    
    if (relacionExistente) {
      setError("Esta relación ya existe");
      return false;
    }
    return true;
  };

  const handleAsignarOActualizar = async () => {
    // Limpiar mensajes anteriores
    setError("");
    setSuccess("");

    // Validaciones
    if (!estudianteId || estudianteId === "") {
      setError("Por favor, seleccione un estudiante");
      return;
    }

    if (!cursoId || cursoId === "") {
      setError("Por favor, seleccione un curso");
      return;
    }

    // Validar que los IDs sean números válidos
    const estudianteIdNum = parseInt(estudianteId);
    const cursoIdNum = parseInt(cursoId);

    if (isNaN(estudianteIdNum) || isNaN(cursoIdNum)) {
      setError("Los IDs seleccionados no son válidos");
      return;
    }

    // Validar relación duplicada
    if (!editando && !validarRelacionDuplicada()) {
      return;
    }

    setLoading(true);

    try {
      if (editando) {
        await actualizarRelacion(editando, { 
          estudianteId: estudianteIdNum, 
          cursoId: cursoIdNum 
        });
        setSuccess("Relación actualizada exitosamente");
        setEditando(null);
      } else {
        await asignarEstudianteACurso({ 
          estudianteId: estudianteIdNum, 
          cursoId: cursoIdNum 
        });
        setSuccess("Estudiante asignado exitosamente");
      }

      // Limpiar formulario
      setEstudianteId("");
      setCursoId("");
      
      // Recargar datos
      await fetchRelaciones();
    } catch (error) {
      console.error("Error al procesar relación:", error);
      
      // Manejar diferentes tipos de errores
      if (error.response) {
        if (error.response.status === 409) {
          setError("Esta relación ya existe");
        } else if (error.response.status === 404) {
          setError("El estudiante o curso no existe");
        } else if (error.response.data && error.response.data.message) {
          setError(error.response.data.message);
        } else {
          setError("Error al procesar la relación");
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

  const handleEliminar = async (id) => {
    // Validar ID
    if (!id || isNaN(parseInt(id))) {
      setError("ID de relación no válido");
      return;
    }

    if (!window.confirm("¿Está seguro de eliminar esta relación?")) {
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await eliminarRelacion(id);
      setSuccess("Relación eliminada exitosamente");
      await fetchRelaciones();
    } catch (error) {
      console.error("Error al eliminar:", error);
      if (error.response && error.response.status === 404) {
        setError("La relación no existe");
      } else {
        setError("Error al eliminar la relación");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditar = (relacion) => {
    // Validar que la relación tenga los campos necesarios
    if (!relacion || !relacion.id || !relacion.estudianteId || !relacion.cursoId) {
      setError("Datos de relación inválidos");
      return;
    }

    setEstudianteId(relacion.estudianteId.toString());
    setCursoId(relacion.cursoId.toString());
    setEditando(relacion.id);
    setError("");
    setSuccess("");
  };

  const handleCancelar = () => {
    setEstudianteId("");
    setCursoId("");
    setEditando(null);
    setError("");
    setSuccess("");
  };

  // Función auxiliar para obtener nombre seguro
  const getNombreEstudiante = (estudianteId) => {
    const estudiante = estudiantes.find(est => est.id === estudianteId);
    if (estudiante) {
      return `${estudiante.nombre || ''} ${estudiante.apellido || ''}`.trim();
    }
    return 'Estudiante no encontrado';
  };

  const getNombreCurso = (cursoId) => {
    const curso = cursos.find(c => c.id === cursoId);
    return curso ? curso.nombre : 'Curso no encontrado';
  };

  return (
    <div className="main-wrapper">
      <div className="container">
        <h1>Relaciones Curso-Estudiante</h1>
        
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

        <div className="form-container">
          <div className="form-row">
            <div className="form-group">
              <select
                value={estudianteId}
                onChange={(e) => setEstudianteId(e.target.value)}
                disabled={loading}
              >
                <option value="">Seleccione un Estudiante</option>
                {estudiantes.length > 0 ? (
                  estudiantes.map((estudiante) => (
                    <option key={estudiante.id} value={estudiante.id}>
                      {estudiante.nombre} {estudiante.apellido}
                    </option>
                  ))
                ) : (
                  <option disabled>No hay estudiantes disponibles</option>
                )}
              </select>
            </div>
            
            <div className="form-group">
              <select
                value={cursoId}
                onChange={(e) => setCursoId(e.target.value)}
                disabled={loading}
              >
                <option value="">Seleccione un Curso</option>
                {cursos.length > 0 ? (
                  cursos.map((curso) => (
                    <option key={curso.id} value={curso.id}>
                      {curso.nombre}
                    </option>
                  ))
                ) : (
                  <option disabled>No hay cursos disponibles</option>
                )}
              </select>
            </div>
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button
              onClick={handleAsignarOActualizar}
              className="btn-primary"
              disabled={loading || !estudianteId || !cursoId}
            >
              {loading ? (
                <span className="loading"></span>
              ) : (
                editando ? "Actualizar Relación" : "Asignar Estudiante"
              )}
            </button>
            {editando && (
              <button
                onClick={handleCancelar}
                className="cancel"
                disabled={loading}
              >
                Cancelar
              </button>
            )}
          </div>
        </div>

        <div className="table-container">
          {loading && relaciones.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <span className="loading"></span> Cargando...
            </div>
          ) : (
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Estudiante</th>
                    <th>Curso</th>
                    <th style={{ textAlign: 'center' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {relaciones.length === 0 ? (
                    <tr>
                      <td colSpan="3" style={{ textAlign: 'center', padding: '2rem' }}>
                        No hay relaciones registradas
                      </td>
                    </tr>
                  ) : (
                    relaciones.map((relacion) => (
                      <tr key={relacion.id}>
                        <td>{getNombreEstudiante(relacion.estudianteId)}</td>
                        <td>{getNombreCurso(relacion.cursoId)}</td>
                        <td style={{ textAlign: 'center' }}>
                          <button
                            onClick={() => handleEditar(relacion)}
                            className="edit"
                            disabled={loading}
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleEliminar(relacion.id)}
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