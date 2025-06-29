package com.espe.micro_cursos.repositories;

import com.espe.micro_cursos.model.entity.CursoEstudiante;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CursoEstudianteRepository extends JpaRepository<CursoEstudiante, Long> {
}
