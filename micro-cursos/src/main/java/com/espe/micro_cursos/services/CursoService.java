package com.espe.micro_cursos.services;

import com.espe.micro_cursos.model.entity.Curso;
import com.espe.micro_cursos.model.entity.Estudiante;

import java.util.Date;
import java.util.List;
import java.util.Optional;

public interface CursoService {
    // Método para listar todos los cursos
    List<Curso> listarTodos();

    // Método para guardar un curso
    Curso guardarCurso(Curso curso);

    // Método para obtener un curso por su ID
    Curso obtenerPorId(Long id);

    // Método para eliminar un curso por su ID
    void eliminarPorId(Long id);

    // Metodos nnuevos
    Optional<Estudiante> addEstudiante(Estudiante estudiante, Long id);
    boolean removerEstudiante(Estudiante estudiante, Long id);

    // Métodos adicionales para búsquedas personalizadas
    List<Curso> buscarPorCreditos(int creditos);

    List<Curso> buscarPorFechaCreacionPosterior(Date fecha);

    List<Curso> buscarPorDescripcion(String texto);
}
