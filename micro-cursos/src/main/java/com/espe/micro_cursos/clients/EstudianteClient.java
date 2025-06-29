package com.espe.micro_cursos.clients;

import com.espe.micro_cursos.model.entity.Estudiante;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@FeignClient(name="micro-estudiante", url = "micro-estudiante:8002/api/estudiantes")
public interface EstudianteClient {

    @GetMapping
    public ResponseEntity<Map<String, Object>> listarEstudiantes();

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> obtenerEstudiante(@PathVariable Long id);

    @PostMapping
    public ResponseEntity<Map<String, Object>> crearEstudiante(@RequestBody Estudiante estudiante);

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> actualizarEstudiante(@PathVariable Long id, @RequestBody Estudiante estudiante);

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> eliminarEstudiante(@PathVariable Long id);
}
