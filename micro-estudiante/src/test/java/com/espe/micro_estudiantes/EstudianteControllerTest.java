package com.espe.micro_estudiantes.controllers;

import com.espe.micro_estudiantes.model.entity.Estudiante;
import com.espe.micro_estudiantes.services.EstudianteService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.Date;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

@WebMvcTest(EstudianteController.class)
@ActiveProfiles("test")
public class EstudianteControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private EstudianteService estudianteService;

    private Estudiante estudiante1;
    private Estudiante estudiante2;

    @BeforeEach
    void setUp() {
        estudiante1 = new Estudiante();
        estudiante1.setId(1L);
        estudiante1.setNombre("Juan");
        estudiante1.setApellido("Pérez");
        estudiante1.setEmail("juan.perez@universidad.edu");
        estudiante1.setTelefono("0999999999");
        estudiante1.setFechaNacimiento(new Date());

        estudiante2 = new Estudiante();
        estudiante2.setId(2L);
        estudiante2.setNombre("María");
        estudiante2.setApellido("González");
        estudiante2.setEmail("maria.gonzalez@universidad.edu");
        estudiante2.setTelefono("0988888888");
        estudiante2.setFechaNacimiento(new Date());
    }

    @Test
    void testListarEstudiantes() throws Exception {
        List<Estudiante> estudiantes = Arrays.asList(estudiante1, estudiante2);
        when(estudianteService.listarTodos()).thenReturn(estudiantes);

        mockMvc.perform(get("/api/estudiantes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Estudiantes obtenidos exitosamente."))
                .andExpect(jsonPath("$.data", hasSize(2)))
                .andExpect(jsonPath("$.data[0].nombre").value("Juan"))
                .andExpect(jsonPath("$.data[0].apellido").value("Pérez"))
                .andExpect(jsonPath("$.data[1].nombre").value("María"))
                .andExpect(jsonPath("$.data[1].apellido").value("González"));

        verify(estudianteService, times(1)).listarTodos();
    }

    @Test
    void testObtenerEstudianteExistente() throws Exception {
        when(estudianteService.obtenerPorId(1L)).thenReturn(estudiante1);

        mockMvc.perform(get("/api/estudiantes/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Estudiante encontrado exitosamente."))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.nombre").value("Juan"))
                .andExpect(jsonPath("$.data.apellido").value("Pérez"))
                .andExpect(jsonPath("$.data.email").value("juan.perez@universidad.edu"))
                .andExpect(jsonPath("$.data.telefono").value("0999999999"));

        verify(estudianteService, times(1)).obtenerPorId(1L);
    }

    @Test
    void testObtenerEstudianteNoExistente() throws Exception {
        when(estudianteService.obtenerPorId(99L)).thenThrow(new RuntimeException("Estudiante no encontrado"));

        mockMvc.perform(get("/api/estudiantes/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Estudiante no encontrado con ID: 99"));

        verify(estudianteService, times(1)).obtenerPorId(99L);
    }

    @Test
    void testCrearEstudiante() throws Exception {
        Estudiante nuevoEstudiante = new Estudiante();
        nuevoEstudiante.setNombre("Carlos");
        nuevoEstudiante.setApellido("López");
        nuevoEstudiante.setEmail("carlos.lopez@universidad.edu");
        nuevoEstudiante.setTelefono("0977777777");
        nuevoEstudiante.setFechaNacimiento(new Date());

        Estudiante estudianteCreado = new Estudiante();
        estudianteCreado.setId(3L);
        estudianteCreado.setNombre("Carlos");
        estudianteCreado.setApellido("López");
        estudianteCreado.setEmail("carlos.lopez@universidad.edu");
        estudianteCreado.setTelefono("0977777777");
        estudianteCreado.setFechaNacimiento(nuevoEstudiante.getFechaNacimiento());
        estudianteCreado.setCreadoEn(new Date());

        when(estudianteService.guardarEstudiante(any(Estudiante.class))).thenReturn(estudianteCreado);

        mockMvc.perform(post("/api/estudiantes")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nuevoEstudiante)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.message").value("Estudiante creado exitosamente."))
                .andExpect(jsonPath("$.data.id").value(3))
                .andExpect(jsonPath("$.data.nombre").value("Carlos"))
                .andExpect(jsonPath("$.data.apellido").value("López"))
                .andExpect(jsonPath("$.data.email").value("carlos.lopez@universidad.edu"));

        verify(estudianteService, times(1)).guardarEstudiante(any(Estudiante.class));
    }

    @Test
    void testActualizarEstudianteExistente() throws Exception {
        Estudiante estudianteActualizado = new Estudiante();
        estudianteActualizado.setNombre("Juan Carlos");
        estudianteActualizado.setApellido("Pérez García");
        estudianteActualizado.setEmail("juan.perez.nuevo@universidad.edu");
        estudianteActualizado.setTelefono("0966666666");
        estudianteActualizado.setFechaNacimiento(new Date());

        when(estudianteService.obtenerPorId(1L)).thenReturn(estudiante1);
        when(estudianteService.guardarEstudiante(any(Estudiante.class))).thenReturn(estudianteActualizado);

        mockMvc.perform(put("/api/estudiantes/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(estudianteActualizado)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Estudiante actualizado exitosamente."))
                .andExpect(jsonPath("$.data.nombre").value("Juan Carlos"))
                .andExpect(jsonPath("$.data.apellido").value("Pérez García"));

        verify(estudianteService, times(1)).obtenerPorId(1L);
        verify(estudianteService, times(1)).guardarEstudiante(any(Estudiante.class));
    }

    @Test
    void testActualizarEstudianteNoExistente() throws Exception {
        Estudiante estudianteActualizado = new Estudiante();
        estudianteActualizado.setNombre("Estudiante");
        estudianteActualizado.setApellido("No Existe");

        when(estudianteService.obtenerPorId(99L)).thenThrow(new RuntimeException("Estudiante no encontrado"));

        mockMvc.perform(put("/api/estudiantes/99")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(estudianteActualizado)))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Estudiante no encontrado con ID: 99"));

        verify(estudianteService, times(1)).obtenerPorId(99L);
        verify(estudianteService, never()).guardarEstudiante(any(Estudiante.class));
    }

    @Test
    void testEliminarEstudianteExistente() throws Exception {
        doNothing().when(estudianteService).eliminarPorId(1L);

        mockMvc.perform(delete("/api/estudiantes/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Estudiante eliminado exitosamente."));

        verify(estudianteService, times(1)).eliminarPorId(1L);
    }

    @Test
    void testEliminarEstudianteNoExistente() throws Exception {
        doThrow(new RuntimeException("Estudiante no encontrado")).when(estudianteService).eliminarPorId(99L);

        mockMvc.perform(delete("/api/estudiantes/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Estudiante no encontrado con ID: 99"));

        verify(estudianteService, times(1)).eliminarPorId(99L);
    }

    @Test
    void testListarEstudiantesVacio() throws Exception {
        when(estudianteService.listarTodos()).thenReturn(Arrays.asList());

        mockMvc.perform(get("/api/estudiantes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Estudiantes obtenidos exitosamente."))
                .andExpect(jsonPath("$.data", hasSize(0)));

        verify(estudianteService, times(1)).listarTodos();
    }
}