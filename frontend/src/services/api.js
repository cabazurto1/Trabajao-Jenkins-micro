import axios from 'axios';

const IP_BACKEND_CURSOS = 'http://microservices.local/api/cursos';
const IP_BACKEND_ESTUDIANTES = 'http://microservices.local/api/estudiantes';

const BASE_URL_ESTUDIANTES = `${IP_BACKEND_ESTUDIANTES}/api/estudiantes`;
const BASE_URL_CURSOS = `${IP_BACKEND_CURSOS}/api/cursos`;
const BASE_URL_RELACION = `${IP_BACKEND_CURSOS}/api/curso-estudiante`;

export const getEstudiantes = () => axios.get(BASE_URL_ESTUDIANTES);
export const getCursos = () => axios.get(BASE_URL_CURSOS);
export const createEstudiante = (data) => axios.post(BASE_URL_ESTUDIANTES, data);
export const createCurso = (data) => axios.post(BASE_URL_CURSOS, data);
export const updateEstudiante = (id, data) => axios.put(`${BASE_URL_ESTUDIANTES}/${id}`, data);
export const updateCurso = (id, data) => axios.put(`${BASE_URL_CURSOS}/${id}`, data);
export const deleteEstudiante = (id) => axios.delete(`${BASE_URL_ESTUDIANTES}/${id}`);
export const deleteCurso = (id) => axios.delete(`${BASE_URL_CURSOS}/${id}`);

// Servicios para CursoEstudiante
export const asignarEstudianteACurso = (data) => axios.post(BASE_URL_RELACION, data);
export const obtenerRelaciones = () => axios.get(BASE_URL_RELACION);
export const eliminarRelacion = (id) => axios.delete(`${BASE_URL_RELACION}/${id}`);
export const actualizarRelacion = (id, data) =>
    axios.put(`${BASE_URL_RELACION}/${id}`, data);
  