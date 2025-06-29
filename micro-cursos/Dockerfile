# Etapa 1: Build con Maven
FROM eclipse-temurin:17-jdk-alpine AS builder
WORKDIR /app

RUN apk add --no-cache maven

ENV LANG=en_US.UTF-8
ENV LANGUAGE=en_US:en
ENV LC_ALL=en_US.UTF-8

COPY . .

RUN chmod +x mvnw
RUN ./mvnw clean package -DskipTests -Dfile.encoding=UTF-8

# Etapa 2: Imagen ligera
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8003
ENTRYPOINT ["java", "-jar", "app.jar"]
