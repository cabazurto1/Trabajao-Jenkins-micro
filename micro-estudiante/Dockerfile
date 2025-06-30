# Dockerfile para micro-cursos
# Etapa 1: Build con Maven
FROM eclipse-temurin:17-jdk-alpine AS builder

WORKDIR /app

# Instalar dependencias necesarias (Maven)
RUN apk add --no-cache maven

# Configurar la codificación
ENV LANG=en_US.UTF-8
ENV LANGUAGE=en_US:en
ENV LC_ALL=en_US.UTF-8

# Copiar archivos de proyecto
COPY pom.xml .
COPY mvnw .
COPY .mvn .mvn

# Dar permisos al wrapper
RUN chmod +x mvnw

# Descargar dependencias
RUN ./mvnw dependency:go-offline -B || mvn dependency:go-offline -B

# Copiar SOLO el código fuente principal (no los tests)
COPY src/main src/main

# Compilar sin ejecutar tests
RUN ./mvnw clean package -DskipTests -Dmaven.test.skip=true -B

# Etapa 2: Imagen ligera para ejecución
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copiar el jar generado
COPY --from=builder /app/target/*.jar app.jar

# Exponer el puerto
EXPOSE 8003

# Variables de entorno
ENV JAVA_OPTS="-Xmx512m -Xms256m"

# Punto de entrada
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]