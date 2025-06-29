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
COPY . .

# Dar permisos y empaquetar
RUN chmod +x mvnw
RUN ./mvnw clean package -DskipTests -Dfile.encoding=UTF-8

# Etapa 2: Imagen ligera para ejecución
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copiar el jar generado
COPY --from=builder /app/target/*.jar app.jar

# Exponer el puerto (asegúrate de que coincida con el .env y docker-compose)
EXPOSE 8002

ENTRYPOINT ["java", "-jar", "app.jar"]
