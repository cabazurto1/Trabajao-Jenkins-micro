package com.espe.micro_cursos.controllers;

import com.espe.micro_cursos.model.entity.CursoEstudiante;
import com.espe.micro_cursos.repositories.CursoEstudianteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/curso-estudiante")
@CrossOrigin(origins = "${CORS_ALLOWED_ORIGINS:*}")
public class CursoEstudianteController {

    @Autowired
    private CursoEstudianteRepository cursoEstudianteRepository;

    @PostMapping
    public ResponseEntity<CursoEstudiante> asignarEstudianteACurso(@RequestBody CursoEstudiante cursoEstudiante) {
        CursoEstudiante nuevaRelacion = cursoEstudianteRepository.save(cursoEstudiante);
        return ResponseEntity.status(HttpStatus.CREATED).body(nuevaRelacion);
    }

    @GetMapping
    public ResponseEntity<List<CursoEstudiante>> obtenerRelaciones() {
        List<CursoEstudiante> relaciones = cursoEstudianteRepository.findAll();
        return ResponseEntity.ok(relaciones);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarRelacion(@PathVariable Long id) {
        cursoEstudianteRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
    @PutMapping("/{id}")
    public ResponseEntity<CursoEstudiante> actualizarRelacion(
            @PathVariable Long id, 
            @RequestBody CursoEstudiante detallesActualizados) {
        return cursoEstudianteRepository.findById(id)
                .map(relacionExistente -> {
                    relacionExistente.setEstudianteId(detallesActualizados.getEstudianteId());
                    relacionExistente.setCursoId(detallesActualizados.getCursoId());
                    CursoEstudiante relacionActualizada = cursoEstudianteRepository.save(relacionExistente);
                    return ResponseEntity.ok(relacionActualizada);
                })
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

}
