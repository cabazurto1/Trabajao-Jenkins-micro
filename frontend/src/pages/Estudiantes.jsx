import { useState, useEffect } from 'react';
import { getEstudiantes, createEstudiante, deleteEstudiante, updateEstudiante } from '../services/api';
import './styles.css';  // Import the CSS file

export default function Estudiantes() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [telefono, setTelefono] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [editando, setEditando] = useState(null);

  useEffect(() => {
    fetchEstudiantes();
  }, []);

  const fetchEstudiantes = async () => {
    const { data } = await getEstudiantes();
    setEstudiantes(data.data);
  };

  const handleCreateOrUpdate = async () => {
    if (!nombre || !apellido || !email || !fechaNacimiento || !telefono) {
      alert('Todos los campos son obligatorios.');
      return;
    }

    const currentYear = new Date().getFullYear();
    const birthYear = new Date(fechaNacimiento).getFullYear();

    if (birthYear >= currentYear) {
      alert('La fecha de nacimiento debe ser un año anterior al actual.');
      return;
    }

    if (editando) {
      await updateEstudiante(editando, { nombre, apellido, email, fechaNacimiento, telefono });
      setEditando(null);
    } else {
      await createEstudiante({ nombre, apellido, email, fechaNacimiento, telefono });
    }

    resetForm();
    fetchEstudiantes();
  };

  const handleEdit = (estudiante) => {
    setNombre(estudiante.nombre);
    setApellido(estudiante.apellido);
    setEmail(estudiante.email);
    setFechaNacimiento(estudiante.fechaNacimiento);
    setTelefono(estudiante.telefono);
    setEditando(estudiante.id);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar este estudiante?')) {
      await deleteEstudiante(id);
      fetchEstudiantes();
    }
  };

  const resetForm = () => {
    setNombre('');
    setApellido('');
    setEmail('');
    setFechaNacimiento('');
    setTelefono('');
    setEditando(null);
  };

  const estudiantesFiltrados = estudiantes.filter(
    (e) =>
      e.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      e.apellido.toLowerCase().includes(busqueda.toLowerCase()) ||
      e.email.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div>
      <h1>Estudiantes</h1>
      <div className="search-container">
        <input
          type="text"
          placeholder="Buscar estudiantes..."
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
          placeholder="Apellido"
          value={apellido}
          onChange={(e) => setApellido(e.target.value)}
        />
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="date"
          placeholder="Fecha de Nacimiento"
          value={fechaNacimiento}
          onChange={(e) => setFechaNacimiento(e.target.value)}
        />
        <input
          placeholder="Teléfono"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
        />
        <button onClick={handleCreateOrUpdate}>
          {editando ? 'Actualizar Estudiante' : 'Crear Estudiante'}
        </button>
        {editando && (
          <button className="cancel" onClick={resetForm}>
            Cancelar
          </button>
        )}
      </div>
      <table>
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Email</th>
            <th>Fecha de Nacimiento</th>
            <th>Teléfono</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {estudiantesFiltrados.map((e) => (
            <tr key={e.id}>
              <td>{e.nombre}</td>
              <td>{e.apellido}</td>
              <td>{e.email}</td>
              <td>{e.fechaNacimiento}</td>
              <td>{e.telefono}</td>
              <td>
                <button className="edit" onClick={() => handleEdit(e)}>
                  Editar
                </button>
                <button className="delete" onClick={() => handleDelete(e.id)}>
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
