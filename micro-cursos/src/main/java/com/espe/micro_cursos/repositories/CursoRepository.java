package com.espe.micro_cursos.repositories;

import com.espe.micro_cursos.model.entity.Curso;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface CursoRepository extends JpaRepository<Curso, Long> {
    // Buscar cursos por número de créditos
    List<Curso> findByCreditos(int creditos);

    // Buscar cursos creados después de una fecha específica
    List<Curso> findByCreadoEnAfter(Date fecha);

    // Buscar cursos por descripción que contenga un texto específico
    List<Curso> findByDescripcionContaining(String texto);
}
