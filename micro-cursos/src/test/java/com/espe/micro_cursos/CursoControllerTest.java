package com.espe.micro_cursos.controllers;

import com.espe.micro_cursos.model.entity.Curso;
import com.espe.micro_cursos.services.CursoService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.Date;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

@WebMvcTest(CursoController.class)
@ActiveProfiles("test")
public class CursoControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private CursoService cursoService;

    private Curso curso1;
    private Curso curso2;

    @BeforeEach
    void setUp() {
        curso1 = new Curso();
        curso1.setId(1L);
        curso1.setNombre("Programación Java");
        curso1.setDescripcion("Curso completo de Java");
        curso1.setCreditos(4);
        // Remover setFechaCreacion si no existe en la entidad

        curso2 = new Curso();
        curso2.setId(2L);
        curso2.setNombre("Base de Datos");
        curso2.setDescripcion("Curso de SQL y NoSQL");
        curso2.setCreditos(3);
        // Remover setFechaCreacion si no existe en la entidad
    }

    @Test
    void testListarCursos() throws Exception {
        List<Curso> cursos = Arrays.asList(curso1, curso2);
        when(cursoService.listarTodos()).thenReturn(cursos);

        mockMvc.perform(get("/api/cursos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Cursos obtenidos exitosamente 222."))
                .andExpect(jsonPath("$.data", hasSize(2)))
                .andExpect(jsonPath("$.data[0].nombre").value("Programación Java"))
                .andExpect(jsonPath("$.data[1].nombre").value("Base de Datos"));
    }

    @Test
    void testObtenerCursoExistente() throws Exception {
        when(cursoService.obtenerPorId(1L)).thenReturn(curso1);

        mockMvc.perform(get("/api/cursos/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Curso encontrado exitosamente."))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.nombre").value("Programación Java"));
    }

    @Test
    void testObtenerCursoNoExistente() throws Exception {
        when(cursoService.obtenerPorId(99L)).thenThrow(new RuntimeException("Curso no encontrado"));

        mockMvc.perform(get("/api/cursos/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Curso no encontrado con ID: 99"));
    }

    @Test
    void testCrearCurso() throws Exception {
        Curso nuevoCurso = new Curso();
        nuevoCurso.setNombre("Nuevo Curso");
        nuevoCurso.setDescripcion("Descripción del nuevo curso");
        nuevoCurso.setCreditos(5);

        Curso cursoCreado = new Curso();
        cursoCreado.setId(3L);
        cursoCreado.setNombre("Nuevo Curso");
        cursoCreado.setDescripcion("Descripción del nuevo curso");
        cursoCreado.setCreditos(5);
        // Remover setFechaCreacion si no existe en la entidad

        when(cursoService.guardarCurso(any(Curso.class))).thenReturn(cursoCreado);

        mockMvc.perform(post("/api/cursos")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nuevoCurso)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message").value("Curso creado exitosamente."))
                .andExpect(jsonPath("$.data.id").value(3))
                .andExpect(jsonPath("$.data.nombre").value("Nuevo Curso"));
    }

    @Test
    void testActualizarCursoExistente() throws Exception {
        Curso cursoActualizado = new Curso();
        cursoActualizado.setNombre("Curso Actualizado");
        cursoActualizado.setDescripcion("Descripción actualizada");
        cursoActualizado.setCreditos(6);

        when(cursoService.obtenerPorId(1L)).thenReturn(curso1);
        when(cursoService.guardarCurso(any(Curso.class))).thenReturn(cursoActualizado);

        mockMvc.perform(put("/api/cursos/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(cursoActualizado)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Curso actualizado exitosamente."));
    }

    @Test
    void testActualizarCursoNoExistente() throws Exception {
        Curso cursoActualizado = new Curso();
        cursoActualizado.setNombre("Curso Actualizado");

        when(cursoService.obtenerPorId(99L)).thenThrow(new RuntimeException("Curso no encontrado"));

        mockMvc.perform(put("/api/cursos/99")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(cursoActualizado)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Curso no encontrado con ID: 99"));
    }

    @Test
    void testEliminarCursoExistente() throws Exception {
        doNothing().when(cursoService).eliminarPorId(1L);

        mockMvc.perform(delete("/api/cursos/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Curso eliminado exitosamente."));
    }

    @Test
    void testEliminarCursoNoExistente() throws Exception {
        doThrow(new RuntimeException("Curso no encontrado")).when(cursoService).eliminarPorId(99L);

        mockMvc.perform(delete("/api/cursos/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Curso no encontrado con ID: 99"));
    }

    @Test
    void testBuscarPorCreditos() throws Exception {
        List<Curso> cursos = Arrays.asList(curso1);
        when(cursoService.buscarPorCreditos(4)).thenReturn(cursos);

        mockMvc.perform(get("/api/cursos/buscar/creditos/4"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Cursos encontrados con 4 créditos."))
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].creditos").value(4));
    }

    @Test
    void testBuscarPorDescripcion() throws Exception {
        List<Curso> cursos = Arrays.asList(curso1);
        when(cursoService.buscarPorDescripcion("Java")).thenReturn(cursos);

        mockMvc.perform(get("/api/cursos/buscar/descripcion/Java"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Cursos encontrados que contienen 'Java' en su descripción."))
                .andExpect(jsonPath("$.data", hasSize(1)));
    }

    @Test
    void testBuscarPorFechaConFormatoInvalido() throws Exception {
        mockMvc.perform(get("/api/cursos/buscar/fecha/fecha-invalida"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Formato de fecha inválido. Use yyyy-MM-dd."));
    }
}