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

# OPTIMIZACIÓN: Copiar primero solo los archivos de configuración de Maven
# Esto permite que Docker cachee las dependencias si pom.xml no cambia
COPY pom.xml .
COPY mvnw .
COPY .mvn .mvn

# Dar permisos al wrapper
RUN chmod +x mvnw

# OPTIMIZACIÓN: Descargar dependencias primero (se cachea si pom.xml no cambia)
# Usar timeout más largo y modo batch
RUN timeout 600 ./mvnw dependency:go-offline -B || \
    timeout 600 mvn dependency:go-offline -B

# Ahora copiar el código fuente
COPY src src

# Compilar con reintentos en caso de fallo
RUN ./mvnw clean package -DskipTests -Dfile.encoding=UTF-8 -B || \
    (echo "Reintentando compilación..." && \
     ./mvnw clean package -DskipTests -Dfile.encoding=UTF-8 -B)

# Etapa 2: Imagen ligera para ejecución
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Agregar usuario no root por seguridad
RUN addgroup -g 1000 spring && \
    adduser -u 1000 -G spring -s /bin/sh -D spring

# Copiar el jar generado
COPY --from=builder /app/target/*.jar app.jar

# Cambiar propietario
RUN chown spring:spring app.jar

# Cambiar a usuario no root
USER spring:spring

# Exponer el puerto
EXPOSE 8003

# Variables de entorno útiles
ENV JAVA_OPTS="-Xmx512m -Xms256m"

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8003/actuator/health || exit 1

# Punto de entrada con opciones Java configurables
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]