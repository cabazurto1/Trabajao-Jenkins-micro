package com.espe.micro_cursos.model.entity;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "Cursos")
public class Curso {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(nullable = false)
    private String nombre;

    @Column(nullable = false)
    private String descripcion;

    @Column(nullable = false)
    private int creditos;

    @Temporal(TemporalType.TIMESTAMP)
    private Date creadoEn;

    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true)
    @JoinColumn(name = "curso_id")
    private List<CursoEstudiante> cursoEstudiantes;

    public Curso() {
        cursoEstudiantes = new ArrayList<>();
    }

    public void addCursoEstudiante(CursoEstudiante cursoEstudiante) {
        cursoEstudiantes.add(cursoEstudiante);
    }

    public void removeCursoEstudiante(CursoEstudiante cursoEstudiante) {
        cursoEstudiantes.remove(cursoEstudiante);
    }

    @PrePersist
    protected void prePersist() {
        if (this.creadoEn == null) {
            this.creadoEn = new Date(); // Establece la fecha actual
        }
    }

    public long getId() {
        return id;
    }

    public void setId(long id) {
        this.id = id;
    }

    public List<CursoEstudiante> getCursoEstudiantes() {
        return cursoEstudiantes;
    }

    public void setCursoEstudiantes(List<CursoEstudiante> cursoEstudiantes) {
        this.cursoEstudiantes = cursoEstudiantes;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public int getCreditos() {
        return creditos;
    }

    public void setCreditos(int creditos) {
        this.creditos = creditos;
    }

    public Date getCreadoEn() {
        return creadoEn;
    }

    public void setCreadoEn(Date creadoEn) {
        this.creadoEn = creadoEn;
    }
}
