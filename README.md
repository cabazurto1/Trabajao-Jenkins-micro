# PIPELINE DE MICROSERVICIOS CON JENKINS Y DOCKER

## Información del Proyecto

**Universidad de las Fuerzas Armadas – "ESPE"**  
**Departamento de Ciencias de la Computación**  
**Construcción y evolución de Software**

**Autores:** Christopher Bazurto, Diego Jiménez & Nicole Lara  
**Fecha:** 01 de julio del 2025

## Descripción General

Este proyecto implementa un sistema completo de CI/CD utilizando Jenkins y Docker para gestionar una aplicación basada en microservicios. La arquitectura incluye dos microservicios backend desarrollados en Spring Boot, un frontend en React, y bases de datos MySQL independientes para cada servicio.

## Arquitectura del Sistema

### Componentes Principales

- **Microservicio de Cursos** (micro-cursos): Gestiona la información de cursos académicos
- **Microservicio de Estudiantes** (micro-estudiante): Administra datos de estudiantes
- **Frontend React**: Interfaz de usuario para interacción con los microservicios
- **Bases de Datos MySQL**: Instancias separadas para cada microservicio
- **Jenkins**: Servidor de automatización CI/CD
- **Docker & Docker Compose**: Containerización y orquestación

## Estructura del Proyecto

```
├── frontend/                    # Aplicación React
│   ├── src/
│   │   ├── components/         # Componentes React
│   │   ├── pages/             # Páginas de la aplicación
│   │   └── services/          # Servicios de API
│   └── Dockerfile
├── micro-cursos/               # Microservicio de cursos
│   ├── src/
│   │   ├── main/java/         # Código fuente Java
│   │   └── test/              # Pruebas unitarias
│   └── Dockerfile
├── micro-estudiante/           # Microservicio de estudiantes
│   ├── src/
│   │   ├── main/java/         # Código fuente Java
│   │   └── test/              # Pruebas unitarias
│   └── Dockerfile
├── docker-compose.yml          # Configuración de Docker Compose
├── docker-compose.override.yml # Configuración para desarrollo local
└── Jenkinsfile                # Pipeline de CI/CD
```

## Requisitos Previos

### Software Requerido

- Docker Desktop 20.10 o superior
- Git 2.30 o superior
- Java JDK 17 (para desarrollo local)
- Node.js 16+ (para desarrollo frontend)
- Maven 3.8+ (para desarrollo backend)

### Recursos de Hardware

- CPU: 4 cores mínimo
- RAM: 8GB mínimo, 16GB recomendado
- Almacenamiento: 20GB libres

## Instalación Rápida

### 1. Clonar el Repositorio

```bash
git clone https://github.com/cabazurto1/Trabajao-Jenkins-micro.git
cd Trabajao-Jenkins-micro
```

### 2. Configurar Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto con las siguientes variables:

```
MYSQL_ROOT_PASSWORD=root
MYSQL_DATABASE_CURSO=microcursos
MYSQL_DATABASE_ESTUDIANTES=estudiantesCurso
MYSQL_PORT_CURSO=3307
MYSQL_PORT_ESTUDIANTES=3308
PORT_MICRO_CURSO=8003
PORT_MICRO_ESTUDIANTE=8002
FRONTEND_PORT=8085
```

### 3. Iniciar los Servicios

```bash
# Levantar todos los servicios
docker-compose up -d

# Verificar que estén corriendo
docker-compose ps
```

### 4. Acceder a las Aplicaciones

- Frontend: http://localhost:8085
- API Cursos: http://localhost:8003
- API Estudiantes: http://localhost:8002

## Configuración de Jenkins

### 1. Instalar Jenkins con Docker

```bash
# Crear directorio para Jenkins
mkdir -p jenkins/jenkins_home

# Iniciar Jenkins
docker run -d \
  --name jenkins \
  -p 8080:8080 \
  -p 50000:50000 \
  -v $(pwd)/jenkins/jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  jenkins/jenkins:lts
```

### 2. Configurar Pipeline

1. Acceder a Jenkins: http://localhost:8080
2. Crear nuevo item tipo "Pipeline"
3. Configurar SCM con la URL del repositorio
4. Especificar la ruta del Jenkinsfile

## Desarrollo Local

### Backend (Spring Boot)

```bash
# Microservicio de Cursos
cd micro-cursos
./mvnw spring-boot:run

# Microservicio de Estudiantes
cd micro-estudiante
./mvnw spring-boot:run
```

### Frontend (React)

```bash
cd frontend
npm install
npm run dev
```

## Pipeline CI/CD

El pipeline automatizado realiza las siguientes etapas:

1. **Preparación del Workspace**: Limpia y clona el repositorio
2. **Verificación de Estructura**: Valida la presencia de archivos necesarios
3. **Compilación Backend**: Construye los microservicios con Maven
4. **Compilación Frontend**: Instala dependencias y construye React
5. **Ejecución de Tests**: Ejecuta pruebas unitarias
6. **Construcción de Imágenes**: Crea imágenes Docker
7. **Push a Registry**: Sube imágenes a Docker Hub
8. **Despliegue**: Despliega la aplicación completa

## API Endpoints

### Microservicio de Cursos

- `GET /api/cursos` - Listar todos los cursos
- `GET /api/cursos/{id}` - Obtener curso por ID
- `POST /api/cursos` - Crear nuevo curso
- `PUT /api/cursos/{id}` - Actualizar curso
- `DELETE /api/cursos/{id}` - Eliminar curso

### Microservicio de Estudiantes

- `GET /api/estudiantes` - Listar todos los estudiantes
- `GET /api/estudiantes/{id}` - Obtener estudiante por ID
- `POST /api/estudiantes` - Crear nuevo estudiante
- `PUT /api/estudiantes/{id}` - Actualizar estudiante
- `DELETE /api/estudiantes/{id}` - Eliminar estudiante

## Configuración de Base de Datos

### MySQL para Cursos
- Host: localhost
- Puerto: 3307
- Base de datos: microcursos
- Usuario: root
- Contraseña: root

### MySQL para Estudiantes
- Host: localhost
- Puerto: 3308
- Base de datos: estudiantesCurso
- Usuario: root
- Contraseña: root

## Solución de Problemas

### Problemas Comunes

1. **Error de conexión a base de datos**
   - Verificar que los contenedores MySQL estén corriendo
   - Comprobar puertos y credenciales

2. **Error en compilación de frontend**
   - Limpiar caché de npm: `npm clean-cache --force`
   - Eliminar node_modules y reinstalar

3. **Docker Compose no encuentra servicios**
   - Verificar sintaxis del archivo docker-compose.yml
   - Asegurar que las variables de entorno estén definidas

## Contribución al Proyecto

### Flujo de Trabajo

1. Crear una rama para la nueva funcionalidad
2. Realizar los cambios necesarios
3. Ejecutar pruebas localmente
4. Hacer commit con mensajes descriptivos
5. Crear Pull Request hacia la rama main

### Estándares de Código

- Java: Seguir convenciones de Spring Boot
- React: Utilizar hooks y componentes funcionales
- Commits: Usar mensajes descriptivos en español

## Mantenimiento

### Actualización de Servicios

```bash
# Reconstruir y actualizar servicios
docker-compose build
docker-compose up -d
```

### Limpieza del Sistema

```bash
# Detener y eliminar contenedores
docker-compose down

# Eliminar volúmenes (¡CUIDADO! Borra datos)
docker-compose down -v

# Limpiar imágenes no utilizadas
docker system prune -a
```

## Licencia

Este proyecto es desarrollado con fines académicos para la Universidad de las Fuerzas Armadas ESPE.

## Contacto

Para preguntas o soporte relacionado con este proyecto, contactar a:

- Christopher Bazurto
- Diego Jiménez
- Nicole Lara

Universidad de las Fuerzas Armadas – "ESPE"  
Departamento de Ciencias de la Computación

---

**Última actualización:** 01 de julio de 2025
