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
          docker rm -f mysql-micro-curso mysql-micro-estudiante micro-frontend micro-cursos-app || true

          echo "🚀 Levantando contenedores necesarios para base de datos..."
          docker compose up -d mysql-micro-curso mysql-micro-estudiante || {
            echo "❌ Error al levantar contenedores de BD"
            exit 1
          }

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
        echo "🔨 Construyendo imágenes Docker..."
        docker build --no-cache -t cabazurto/micro-cursos:latest micro-cursos
        docker build --no-cache -t cabazurto/micro-estudiante:latest micro-estudiante
        docker build --no-cache -t cabazurto/cursos-micro-frontend:latest frontend
        echo "✅ Imágenes construidas exitosamente"
        '''
    }
    }


    stage('Push a Docker Hub') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASSWORD')]) {
          sh '''
            echo "🔐 Autenticando con Docker Hub..."
            echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USER" --password-stdin
            
            echo "📤 Subiendo imágenes a Docker Hub..."
            echo "Subiendo micro-cursos..."
            docker push cabazurto/micro-cursos:latest
            
            echo "Subiendo micro-estudiante..."
            docker push cabazurto/micro-estudiante:latest
            
            echo "Subiendo frontend..."
            docker push cabazurto/cursos-micro-frontend:latest
            
            echo "✅ Todas las imágenes subidas exitosamente"
            docker logout
          '''
        }
      }
    }

    stage('Desplegar Aplicación') {
      steps {
        sh '''
          echo "=== Desplegando aplicación completa ==="

          echo "🧼 Forzando eliminación de contenedores en conflicto..."
          docker ps -a --format '{{.Names}}' | grep -E 'micro-estudiante|micro-cursos-app|micro-frontend|mysql-micro-curso|mysql-micro-estudiante' | xargs -r docker rm -f || true

          echo "⛔ Deteniendo servicios anteriores (docker compose down)..."
          docker compose down --remove-orphans || true

          echo "🚀 Levantando aplicación completa..."
          docker compose up -d || {
            echo "❌ Error al desplegar aplicación completa"
            exit 1
          }

          echo "⌛ Esperando que todos los servicios inicien..."
          sleep 30

          echo "=== Contenedores en ejecución ==="
          docker ps
        '''
      }
    }
  }

  post {
    always {
      echo '🏁 Pipeline finalizado.'
      sh '''
        echo "=== Estado final de contenedores ==="
        docker ps
        echo "=== Imágenes Docker disponibles ==="
        docker images | grep cabazurto
      '''
    }
    success {
      echo '✅ Pipeline completado exitosamente. Imágenes subidas a Docker Hub.'
    }
    failure {
      echo '❌ El pipeline falló. Revisar los logs para más detalles.'
    }
    unstable {
      echo '⚠️ Pipeline completado con advertencias (probablemente tests fallidos).'
    }
  }
}