package com.espe.micro_cursos.controllers;

import com.espe.micro_cursos.model.entity.Curso;
import com.espe.micro_cursos.model.entity.Estudiante;
import com.espe.micro_cursos.services.CursoService;
import feign.FeignException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Value;


import java.util.*;

@RestController
@RequestMapping("/api/cursos")
@CrossOrigin(origins = "${CORS_ALLOWED_ORIGINS:*}")
public class CursoController {

    @Value("${CORS_ALLOWED_ORIGINS:*}")
    private String allowedOrigins;

    @Autowired
    private CursoService cursoService;

    /**
     * Endpoint para listar todos los cursos.
     *
     * @return ResponseEntity con la lista de cursos y mensaje
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> listarCursos() {
        List<Curso> cursos = cursoService.listarTodos();
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Cursos obtenidos exitosamente 222.");
        response.put("data", cursos);
        response.put("origins", "${CORS_ALLOWED_ORIGINS}");
        response.put("allowedOrigins", allowedOrigins);
        return ResponseEntity.ok(response);
    }

    /**
     * Endpoint para obtener un curso por su ID.
     *
     * @param id ID del curso
     * @return ResponseEntity con el curso encontrado o error 404 si no existe
     */
    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> obtenerCurso(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            Curso curso = cursoService.obtenerPorId(id);
            response.put("message", "Curso encontrado exitosamente.");
            response.put("data", curso);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            response.put("message", "Curso no encontrado con ID: " + id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    /**
     * Endpoint para crear un nuevo curso.
     *
     * @param curso Objeto Curso enviado en el cuerpo de la solicitud
     * @return ResponseEntity con el curso creado y mensaje
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> crearCurso(@RequestBody Curso curso) {
        Curso cursoCreado = cursoService.guardarCurso(curso);
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Curso creado exitosamente.");
        response.put("data", cursoCreado);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Endpoint para actualizar un curso existente.
     *
     * @param id ID del curso a actualizar
     * @param curso Objeto Curso con los datos actualizados
     * @return ResponseEntity con el curso actualizado o error 404 si no existe
     */
    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> actualizarCurso(@PathVariable Long id, @RequestBody Curso curso) {
        Map<String, Object> response = new HashMap<>();
        try {
            Curso cursoExistente = cursoService.obtenerPorId(id);
            cursoExistente.setNombre(curso.getNombre());
            cursoExistente.setDescripcion(curso.getDescripcion());
            cursoExistente.setCreditos(curso.getCreditos());
            Curso cursoActualizado = cursoService.guardarCurso(cursoExistente);
            response.put("message", "Curso actualizado exitosamente.");
            response.put("data", cursoActualizado);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            response.put("message", "Curso no encontrado con ID: " + id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    /**
     * Endpoint para eliminar un curso por su ID.
     *
     * @param id ID del curso a eliminar
     * @return ResponseEntity con mensaje de éxito o error 404 si no existe
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, Object>> eliminarCurso(@PathVariable Long id) {
        Map<String, Object> response = new HashMap<>();
        try {
            cursoService.eliminarPorId(id);
            response.put("message", "Curso eliminado exitosamente.");
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            response.put("message", "Curso no encontrado con ID: " + id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }

    /**
     * Endpoint para buscar cursos por créditos.
     *
     * @param creditos Número de créditos
     * @return ResponseEntity con los cursos encontrados
     */
    @GetMapping("/buscar/creditos/{creditos}")
    public ResponseEntity<Map<String, Object>> buscarPorCreditos(@PathVariable int creditos) {
        List<Curso> cursos = cursoService.buscarPorCreditos(creditos);
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Cursos encontrados con " + creditos + " créditos.");
        response.put("data", cursos);
        return ResponseEntity.ok(response);
    }

    /**
     * Endpoint para buscar cursos creados después de una fecha específica.
     *
     * @param fecha Fecha en formato yyyy-MM-dd
     * @return ResponseEntity con los cursos encontrados
     */
    @GetMapping("/buscar/fecha/{fecha}")
    public ResponseEntity<Map<String, Object>> buscarPorFechaCreacion(@PathVariable String fecha) {
        try {
            Date fechaConvertida = new java.text.SimpleDateFormat("yyyy-MM-dd").parse(fecha);
            List<Curso> cursos = cursoService.buscarPorFechaCreacionPosterior(fechaConvertida);
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Cursos encontrados creados después de " + fecha + ".");
            response.put("data", cursos);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Formato de fecha inválido. Use yyyy-MM-dd.");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }
    }

    /**
     * Endpoint para buscar cursos por descripción.
     *
     * @param texto Texto a buscar en la descripción
     * @return ResponseEntity con los cursos encontrados
     */
    @GetMapping("/buscar/descripcion/{texto}")
    public ResponseEntity<Map<String, Object>> buscarPorDescripcion(@PathVariable String texto) {
        List<Curso> cursos = cursoService.buscarPorDescripcion(texto);
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Cursos encontrados que contienen '" + texto + "' en su descripción.");
        response.put("data", cursos);
        return ResponseEntity.ok(response);
    }


    @PutMapping("asignar-estudiante/{cursoId}")
    public ResponseEntity<?> asignarUsuario(@RequestBody Estudiante estudiante, @PathVariable Long cursoId) {
        Optional<Estudiante> o;
        try {
            o = cursoService.addEstudiante(estudiante, cursoId);
        } catch (FeignException e) {
            return  ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Collections.singletonMap("mensaje", "No existe el usuario por el id: " + estudiante.getId() +", Error: " + e.getMessage()));
        }

        if (!o.isEmpty()) {
            return ResponseEntity.status(HttpStatus.CREATED).body(o.get());
        }

        return ResponseEntity.notFound().build();
    }


    @DeleteMapping("remover-estudiante/{cursoId}")
    public ResponseEntity<?> removerEstudiante(@RequestBody Estudiante estudiante, @PathVariable Long cursoId) {
        boolean o;
        try {
            o = cursoService.removerEstudiante(estudiante, cursoId);
        } catch (FeignException e) {
            return  ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body  (Collections.singletonMap("mensaje", "No existe el estudiante por el id: " + estudiante.getId() +", Error: " + e.getMessage()));
        }

        if (o) {
            return ResponseEntity.status(HttpStatus.OK).body(true);
        }

        return ResponseEntity.status(HttpStatus.OK).body(false);
    }
    
}
