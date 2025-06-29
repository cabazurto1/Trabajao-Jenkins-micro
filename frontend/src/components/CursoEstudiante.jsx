import { useState, useEffect } from 'react';
import { getCursoEstudiante, createCursoEstudiante, deleteCursoEstudiante } from '../services/api';

export default function CursoEstudiante() {
  const [relaciones, setRelaciones] = useState([]);
  const [estudianteId, setEstudianteId] = useState('');
  const [cursoId, setCursoId] = useState('');

  useEffect(() => {
    fetchRelaciones();
  }, []);

  const fetchRelaciones = async () => {
    const { data } = await getCursoEstudiante();
    setRelaciones(data);
  };

  const handleCreate = async () => {
    if (!estudianteId || !cursoId) {
      alert('Por favor ingrese el ID del estudiante y del curso.');
      return;
    }
    await createCursoEstudiante({ estudianteId, cursoId });
    fetchRelaciones();
  };

  const handleDelete = async (id) => {
    await deleteCursoEstudiante(id);
    fetchRelaciones();
  };

  return (
    <div>
      <h1>Relaciones Curso-Estudiante</h1>
      <div>
        <input
          placeholder="ID Estudiante"
          value={estudianteId}
          onChange={(e) => setEstudianteId(e.target.value)}
        />
        <input
          placeholder="ID Curso"
          value={cursoId}
          onChange={(e) => setCursoId(e.target.value)}
        />
        <button onClick={handleCreate}>Asignar</button>
      </div>
      <ul>
        {relaciones.map((relacion) => (
          <li key={relacion.id}>
            Estudiante: {relacion.estudianteId} - Curso: {relacion.cursoId}
            <button onClick={() => handleDelete(relacion.id)}>Eliminar</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
