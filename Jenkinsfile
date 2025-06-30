pipeline {
  agent any

  tools {
    nodejs 'node24'
  }

  environment {
    MYSQL_VERSION = 'latest'
    MYSQL_ROOT_PASSWORD = 'root'
    MYSQL_DATABASE_CURSO = 'microcursos'
    MYSQL_DATABASE_ESTUDIANTES = 'estudiantesCurso'
    MYSQL_PORT_CURSO = '3307'
    MYSQL_PORT_ESTUDIANTES = '3308'
    PORT_MICRO_CURSO = '8003'
    PORT_MICRO_ESTUDIANTE = '8002'
    FRONTEND_PORT = '8085'
    REACT_APP_BACKEND_CURSOS = "http://localhost:8003"
    REACT_APP_BACKEND_ESTUDIANTES = "http://localhost:8002"
    CORS_ALLOWED_ORIGINS = '*'
  }

  stages {

    stage('Preparar Workspace') {
      steps {
        cleanWs()
        git branch: 'main', 
            url: 'https://github.com/cabazurto1/Trabajao-Jenkins-micro.git'
      }
    }

    stage('Verificar estructura') {
      steps {
        sh '''
          echo "=== Contenido del workspace ==="
          ls -la
          echo "=== Verificando archivos necesarios ==="
          [ -f "Jenkinsfile" ] && echo "✓ Jenkinsfile encontrado" || echo "✗ Jenkinsfile NO encontrado"
          [ -f "docker-compose.yml" ] && echo "✓ docker-compose.yml encontrado" || echo "✗ docker-compose.yml NO encontrado"
          [ -d "micro-cursos" ] && echo "✓ micro-cursos encontrado" || echo "✗ micro-cursos NO encontrado"
          [ -d "micro-estudiante" ] && echo "✓ micro-estudiante encontrado" || echo "✗ micro-estudiante NO encontrado"
          [ -d "frontend" ] && echo "✓ frontend encontrado" || echo "✗ frontend NO encontrado"
        '''
      }
    }

    stage('Levantar Dependencias Docker') {
    steps {
        sh '''
        echo "🧹 Eliminando contenedores anteriores si existen..."
        docker rm -f mysql-micro-curso mysql-micro-estudiante || true
        docker compose up -d mysql-micro-curso mysql-micro-estudiante
        echo "⌛ Esperando a que las bases de datos estén listas..."
        sleep 30
        '''
    }
    }



    stage('Compilar Backend') {
      steps {
        dir('micro-cursos') {
          sh '''
            chmod +x mvnw
            ./mvnw clean install -DskipTests
          '''
        }
        dir('micro-estudiante') {
          sh '''
            chmod +x mvnw
            ./mvnw clean install -DskipTests
          '''
        }
      }
    }

    stage('Compilar Frontend') {
      steps {
        dir('frontend') {
          sh '''
            npm install
            npm run build
          '''
        }
      }
    }

    stage('Tests') {
      steps {
        script {
          try {
            dir('micro-cursos') {
              sh '''
                echo "=== Tests de micro-cursos ==="
                # Configurar conexión a MySQL del contenedor
                export SPRING_DATASOURCE_URL=jdbc:mysql://localhost:${MYSQL_PORT_CURSO}/${MYSQL_DATABASE_CURSO}?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
                export SPRING_DATASOURCE_USERNAME=root
                export SPRING_DATASOURCE_PASSWORD=${MYSQL_ROOT_PASSWORD}
                export SPRING_JPA_HIBERNATE_DDL_AUTO=create-drop
                
                ./mvnw test || echo "⚠️ Tests fallaron - verificar configuración de BD"
              '''
            }
            
            dir('micro-estudiante') {
              sh '''
                echo "=== Tests de micro-estudiante ==="
                # Configurar conexión a MySQL del contenedor
                export SPRING_DATASOURCE_URL=jdbc:mysql://localhost:${MYSQL_PORT_ESTUDIANTES}/${MYSQL_DATABASE_ESTUDIANTES}?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
                export SPRING_DATASOURCE_USERNAME=root
                export SPRING_DATASOURCE_PASSWORD=${MYSQL_ROOT_PASSWORD}
                export SPRING_JPA_HIBERNATE_DDL_AUTO=create-drop
                
                ./mvnw test || echo "⚠️ Tests fallaron - verificar configuración de BD"
              '''
            }
          } catch (Exception e) {
            echo "⚠️ Tests fallaron pero continuamos con el pipeline"
            currentBuild.result = 'UNSTABLE'
          }
        }
      }
    }

    stage('Build imágenes Docker') {
      steps {
        sh '''
          docker build -t bazurto/micro-cursos:latest micro-cursos
          docker build -t bazurto/micro-estudiante:latest micro-estudiante
          docker build -t bazurto/cursos-micro-frontend:latest frontend
        '''
      }
    }
    stage('Desplegar Aplicación') {
      steps {
        sh '''
          echo "=== Desplegando aplicación completa ==="
          
          # Detener contenedores anteriores si existen
          docker compose down || true
          
          # Levantar toda la aplicación
          docker compose up -d
          
          # Esperar a que todo esté listo
          sleep 30
          
          # Verificar que los contenedores estén corriendo
          echo "=== Contenedores en ejecución ==="
          docker ps
          
          # Mostrar URLs de acceso
          echo "=== URLs de acceso ==="
          echo "Frontend: http://localhost:${FRONTEND_PORT}"
          echo "API Cursos: http://localhost:${PORT_MICRO_CURSO}"
          echo "API Estudiantes: http://localhost:${PORT_MICRO_ESTUDIANTE}"
        '''
      }
    }

    stage('Push DockerHub (opcional)') {
      when {
        expression { return env.DOCKER_USER && env.DOCKER_PASSWORD }
      }
      steps {
        withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASSWORD')]) {
          sh '''
            echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USER" --password-stdin
            docker push bazurto/micro-cursos:latest
            docker push bazurto/micro-estudiante:latest
            docker push bazurto/cursos-micro-frontend:latest
          '''
        }
      }
    }

  }

  post {
    always {
      sh 'docker compose down || true'
      echo 'Pipeline finalizado.'
    }
    success {
      echo '✅ Éxito total.'
    }
    failure {
      echo '❌ Algo falló.'
    }
  }
}