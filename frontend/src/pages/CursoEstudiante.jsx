import { useState, useEffect } from "react";
import {
  asignarEstudianteACurso,
  obtenerRelaciones,
  eliminarRelacion,
  getEstudiantes,
  getCursos,
  actualizarRelacion, // Nuevo método para el PUT
} from "../services/api";
import './styles.css';

export default function CursoEstudiante() {
  const [relaciones, setRelaciones] = useState([]);
  const [estudiantes, setEstudiantes] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [estudianteId, setEstudianteId] = useState("");
  const [cursoId, setCursoId] = useState("");
  const [editando, setEditando] = useState(null);

  useEffect(() => {
    fetchRelaciones();
    fetchEstudiantes();
    fetchCursos();
  }, []);

  const fetchRelaciones = async () => {
    const { data } = await obtenerRelaciones();
    setRelaciones(data);
  };

  const fetchEstudiantes = async () => {
    const { data } = await getEstudiantes();
    setEstudiantes(data.data);
  };

  const fetchCursos = async () => {
    const { data } = await getCursos();
    setCursos(data.data);
  };

  const handleAsignarOActualizar = async () => {
    if (!estudianteId || !cursoId) {
      alert("Por favor, seleccione un estudiante y un curso.");
      return;
    }

    if (editando) {
      try {
        await actualizarRelacion(editando, { estudianteId, cursoId }); // Llamada PUT
        setEditando(null);
      } catch (error) {
        alert("Error al actualizar la relación");
        console.error(error);
      }
    } else {
      await asignarEstudianteACurso({ estudianteId, cursoId }); // Llamada POST
    }

    setEstudianteId("");
    setCursoId("");
    fetchRelaciones();
  };

  const handleEliminar = async (id) => {
    if (window.confirm("¿Está seguro de eliminar esta relación?")) {
      await eliminarRelacion(id);
      fetchRelaciones();
    }
  };

  const handleEditar = (relacion) => {
    setEstudianteId(relacion.estudianteId);
    setCursoId(relacion.cursoId);
    setEditando(relacion.id);
  };

  return (
    <div>
      <h1 style={{ color: "#ffffff", textAlign: "center", marginBottom: "1rem" }}>
        Relaciones Curso-Estudiante
      </h1>
      <div style={{ textAlign: "center", marginBottom: "1rem" }}>
        <select
          value={estudianteId}
          onChange={(e) => setEstudianteId(e.target.value)}
          style={{
            marginRight: "0.5rem",
            padding: "0.5rem",
            border: "1px solid #5758bb",
            borderRadius: "5px",
          }}
        >
          <option value="">Seleccione un Estudiante</option>
          {estudiantes.map((estudiante) => (
            <option key={estudiante.id} value={estudiante.id}>
              {estudiante.nombre} {estudiante.apellido}
            </option>
          ))}
        </select>
        <select
          value={cursoId}
          onChange={(e) => setCursoId(e.target.value)}
          style={{
            marginRight: "0.5rem",
            padding: "0.5rem",
            border: "1px solid #5758bb",
            borderRadius: "5px",
          }}
        >
          <option value="">Seleccione un Curso</option>
          {cursos.map((curso) => (
            <option key={curso.id} value={curso.id}>
              {curso.nombre}
            </option>
          ))}
        </select>
        <button
          onClick={handleAsignarOActualizar}
          style={{
            backgroundColor: "#6c63ff",
            color: "#ffffff",
            padding: "0.5rem 1rem",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          {editando ? "Actualizar" : "Asignar"}
        </button>
      </div>
      <table
        style={{
          width: "100%",
          marginTop: "1rem",
          borderCollapse: "collapse",
          color: "#ffffff",
        }}
      >
        <thead>
          <tr style={{ background: "#5758bb", color: "white" }}>
            <th style={{ padding: "0.5rem", textAlign: "center" }}>Estudiante</th>
            <th style={{ padding: "0.5rem", textAlign: "center" }}>Curso</th>
            <th style={{ padding: "0.5rem", textAlign: "center" }}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {relaciones.map((relacion) => (
            <tr key={relacion.id}>
              <td style={{ padding: "0.5rem", borderBottom: "1px solid #ccc" }}>
                {
                  estudiantes.find((est) => est.id === relacion.estudianteId)
                    ?.nombre
                }{" "}
                {
                  estudiantes.find((est) => est.id === relacion.estudianteId)
                    ?.apellido
                }
              </td>
              <td style={{ padding: "0.5rem", borderBottom: "1px solid #ccc" }}>
                {cursos.find((curso) => curso.id === relacion.cursoId)?.nombre}
              </td>
              <td
                style={{
                  padding: "0.5rem",
                  borderBottom: "1px solid #ccc",
                  textAlign: "center",
                }}
              >
                <button
                  onClick={() => handleEditar(relacion)}
                  style={{
                    marginRight: "0.5rem",
                    backgroundColor: "#6c63ff",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    padding: "0.3rem 0.6rem",
                    cursor: "pointer",
                  }}
                >
                  Editar
                </button>
                <button
                  onClick={() => handleEliminar(relacion.id)}
                  style={{
                    backgroundColor: "red",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    padding: "0.3rem 0.6rem",
                    cursor: "pointer",
                  }}
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
