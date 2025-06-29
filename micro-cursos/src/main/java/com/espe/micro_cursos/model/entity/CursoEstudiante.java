package com.espe.micro_cursos.model.entity;

import jakarta.persistence.*;

@Entity
@Table(name="cursos_estudiante",
        uniqueConstraints = @UniqueConstraint(columnNames = {"estudiante_id", "curso_id"}))
public class CursoEstudiante {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "estudiante_id", nullable = false)
    private Long estudianteId;

    @Column(name = "curso_id", nullable = false)
    private Long cursoId;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getEstudianteId() {
        return estudianteId;
    }

    public void setEstudianteId(Long estudianteId) {
        this.estudianteId = estudianteId;
    }

    public Long getCursoId() {
        return cursoId;
    }

    public void setCursoId(Long cursoId) {
        this.cursoId = cursoId;
    }
}