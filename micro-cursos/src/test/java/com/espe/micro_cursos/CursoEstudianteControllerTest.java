package com.espe.micro_cursos.controllers;

import com.espe.micro_cursos.model.entity.CursoEstudiante;
import com.espe.micro_cursos.repositories.CursoEstudianteRepository;
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
import java.util.List;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

@WebMvcTest(CursoEstudianteController.class)
@ActiveProfiles("test")
public class CursoEstudianteControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private CursoEstudianteRepository cursoEstudianteRepository;

    private CursoEstudiante cursoEstudiante1;
    private CursoEstudiante cursoEstudiante2;

    @BeforeEach
    void setUp() {
        cursoEstudiante1 = new CursoEstudiante();
        cursoEstudiante1.setId(1L);
        cursoEstudiante1.setCursoId(1L);
        cursoEstudiante1.setEstudianteId(1L);

        cursoEstudiante2 = new CursoEstudiante();
        cursoEstudiante2.setId(2L);
        cursoEstudiante2.setCursoId(2L);
        cursoEstudiante2.setEstudianteId(2L);
    }

    @Test
    void testAsignarEstudianteACurso() throws Exception {
        CursoEstudiante nuevaRelacion = new CursoEstudiante();
        nuevaRelacion.setCursoId(3L);
        nuevaRelacion.setEstudianteId(3L);

        CursoEstudiante relacionGuardada = new CursoEstudiante();
        relacionGuardada.setId(3L);
        relacionGuardada.setCursoId(3L);
        relacionGuardada.setEstudianteId(3L);

        when(cursoEstudianteRepository.save(any(CursoEstudiante.class))).thenReturn(relacionGuardada);

        mockMvc.perform(post("/api/curso-estudiante")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nuevaRelacion)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(3))
                .andExpect(jsonPath("$.cursoId").value(3))
                .andExpect(jsonPath("$.estudianteId").value(3));

        verify(cursoEstudianteRepository, times(1)).save(any(CursoEstudiante.class));
    }

    @Test
    void testObtenerRelaciones() throws Exception {
        List<CursoEstudiante> relaciones = Arrays.asList(cursoEstudiante1, cursoEstudiante2);
        when(cursoEstudianteRepository.findAll()).thenReturn(relaciones);

        mockMvc.perform(get("/api/curso-estudiante"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].cursoId").value(1))
                .andExpect(jsonPath("$[0].estudianteId").value(1))
                .andExpect(jsonPath("$[1].id").value(2))
                .andExpect(jsonPath("$[1].cursoId").value(2))
                .andExpect(jsonPath("$[1].estudianteId").value(2));

        verify(cursoEstudianteRepository, times(1)).findAll();
    }

    @Test
    void testObtenerRelacionesVacias() throws Exception {
        when(cursoEstudianteRepository.findAll()).thenReturn(Arrays.asList());

        mockMvc.perform(get("/api/curso-estudiante"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void testEliminarRelacion() throws Exception {
        doNothing().when(cursoEstudianteRepository).deleteById(1L);

        mockMvc.perform(delete("/api/curso-estudiante/1"))
                .andExpect(status().isNoContent());

        verify(cursoEstudianteRepository, times(1)).deleteById(1L);
    }

    @Test
    void testActualizarRelacionExistente() throws Exception {
        CursoEstudiante detallesActualizados = new CursoEstudiante();
        detallesActualizados.setCursoId(4L);
        detallesActualizados.setEstudianteId(4L);

        CursoEstudiante relacionActualizada = new CursoEstudiante();
        relacionActualizada.setId(1L);
        relacionActualizada.setCursoId(4L);
        relacionActualizada.setEstudianteId(4L);

        when(cursoEstudianteRepository.findById(1L)).thenReturn(Optional.of(cursoEstudiante1));
        when(cursoEstudianteRepository.save(any(CursoEstudiante.class))).thenReturn(relacionActualizada);

        mockMvc.perform(put("/api/curso-estudiante/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(detallesActualizados)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1))
                .andExpect(jsonPath("$.cursoId").value(4))
                .andExpect(jsonPath("$.estudianteId").value(4));

        verify(cursoEstudianteRepository, times(1)).findById(1L);
        verify(cursoEstudianteRepository, times(1)).save(any(CursoEstudiante.class));
    }

    @Test
    void testActualizarRelacionNoExistente() throws Exception {
        CursoEstudiante detallesActualizados = new CursoEstudiante();
        detallesActualizados.setCursoId(4L);
        detallesActualizados.setEstudianteId(4L);

        when(cursoEstudianteRepository.findById(99L)).thenReturn(Optional.empty());

        mockMvc.perform(put("/api/curso-estudiante/99")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(detallesActualizados)))
                .andExpect(status().isNotFound());

        verify(cursoEstudianteRepository, times(1)).findById(99L);
        verify(cursoEstudianteRepository, never()).save(any(CursoEstudiante.class));
    }

    @Test
    void testAsignarEstudianteACursoConDatosIncompletos() throws Exception {
        CursoEstudiante nuevaRelacion = new CursoEstudiante();
        // Solo establecemos cursoId, falta estudianteId
        nuevaRelacion.setCursoId(3L);

        CursoEstudiante relacionGuardada = new CursoEstudiante();
        relacionGuardada.setId(3L);
        relacionGuardada.setCursoId(3L);
        relacionGuardada.setEstudianteId(null);

        when(cursoEstudianteRepository.save(any(CursoEstudiante.class))).thenReturn(relacionGuardada);

        mockMvc.perform(post("/api/curso-estudiante")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(nuevaRelacion)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(3))
                .andExpect(jsonPath("$.cursoId").value(3))
                .andExpect(jsonPath("$.estudianteId").isEmpty());
    }
}