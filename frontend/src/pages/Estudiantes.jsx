import { useState, useEffect } from 'react';
import { getEstudiantes, createEstudiante, deleteEstudiante, updateEstudiante } from '../services/api';
import './styles.css';

export default function Estudiantes() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [telefono, setTelefono] = useState('');
  const [busqueda, setBusqueda] = useState('');
  const [editando, setEditando] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEstudiantes();
  }, []);

  const fetchEstudiantes = async () => {
    try {
      const { data } = await getEstudiantes();
      setEstudiantes(data.data || []);
    } catch (err) {
      console.error('Error al obtener estudiantes:', err);
      setError('Error al cargar los estudiantes.');
    }
  };

  const calcularEdad = (fecha) => {
    const hoy = new Date();
    const nacimiento = new Date(fecha);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) edad--;
    return edad;
  };

  const handleCreateOrUpdate = async () => {
    setError('');

    // Validaciones básicas
    if (!nombre || !apellido || !email || !fechaNacimiento || !telefono) {
      setError('⚠️ Todos los campos son obligatorios.');
      return;
    }

    // Validar edad
    const edad = calcularEdad(fechaNacimiento);
    if (edad < 5 || edad > 80) {
      setError('⚠️ La edad del estudiante debe estar entre 5 y 80 años.');
      return;
    }

    // Validar email
    const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!correoValido) {
      setError('⚠️ Ingresa un correo electrónico válido.');
      return;
    }

    // Validar teléfono
    const telefonoValido = /^\d{10}$/.test(telefono);
    if (!telefonoValido) {
      setError('⚠️ El teléfono debe contener exactamente 10 dígitos numéricos.');
      return;
    }

    // Verificar duplicados
    const duplicado = estudiantes.some((e) =>
      e.email === email && e.id !== editando
    );
    if (duplicado) {
      setError('⚠️ Ya existe un estudiante registrado con este correo.');
      return;
    }

    try {
      if (editando) {
        await updateEstudiante(editando, { nombre, apellido, email, fechaNacimiento, telefono });
        setEditando(null);
      } else {
        await createEstudiante({ nombre, apellido, email, fechaNacimiento, telefono });
      }
      resetForm();
      fetchEstudiantes();
    } catch (err) {
      console.error(err);
      setError('❌ Error al guardar el estudiante.');
    }
  };

  const handleEdit = (estudiante) => {
    setNombre(estudiante.nombre);
    setApellido(estudiante.apellido);
    setEmail(estudiante.email);
    setFechaNacimiento(estudiante.fechaNacimiento);
    setTelefono(estudiante.telefono);
    setEditando(estudiante.id);
    setError('');
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
    setError('');
  };

  const estudiantesFiltrados = estudiantes.filter((e) =>
    [e.nombre, e.apellido, e.email].some((campo) =>
      campo.toLowerCase().includes(busqueda.toLowerCase())
    )
  );

  return (
    <div className="main-wrapper">
      <div className="container">
        <h1>Gestión de Estudiantes</h1>

        <div className="search-container">
          <input
            type="text"
            placeholder="Buscar estudiantes..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <div className="form-container">
          <div className="form-row">
            <input placeholder="Nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
            <input placeholder="Apellido" value={apellido} onChange={(e) => setApellido(e.target.value)} />
          </div>
          <div className="form-row">
            <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="date" value={fechaNacimiento} onChange={(e) => setFechaNacimiento(e.target.value)} />
          </div>
          <div className="form-row">
            <input placeholder="Teléfono (10 dígitos)" value={telefono} onChange={(e) => setTelefono(e.target.value)} />
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <div className="form-row">
            <button onClick={handleCreateOrUpdate}>
              {editando ? 'Actualizar Estudiante' : 'Crear Estudiante'}
            </button>
            {editando && (
              <button className="cancel" onClick={resetForm}>
                Cancelar
              </button>
            )}
          </div>
        </div>

        <div className="table-container">
          <div className="table-scroll">
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
                {estudiantesFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '1rem' }}>
                      No hay estudiantes para mostrar.
                    </td>
                  </tr>
                ) : (
                  estudiantesFiltrados.map((e) => (
                    <tr key={e.id}>
                      <td>{e.nombre}</td>
                      <td>{e.apellido}</td>
                      <td>{e.email}</td>
                      <td>{e.fechaNacimiento}</td>
                      <td>{e.telefono}</td>
                      <td>
                        <button className="edit" onClick={() => handleEdit(e)}>Editar</button>
                        <button className="delete" onClick={() => handleDelete(e.id)}>Eliminar</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
