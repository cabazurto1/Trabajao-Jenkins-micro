package com.espe.micro_cursos;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest
@ActiveProfiles("test") // 👈 Esto activa el perfil test
class MicroCursosApplicationTests {
    
    @Test
    void contextLoads() {
    }
}