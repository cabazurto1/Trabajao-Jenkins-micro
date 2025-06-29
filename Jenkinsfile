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
    FRONTEND_PORT = '80'
    REACT_APP_BACKEND_CURSOS = "http://localhost:8003"
    REACT_APP_BACKEND_ESTUDIANTES = "http://localhost:8002"
    CORS_ALLOWED_ORIGINS = '*'
  }

  stages {

    stage('Preparar Workspace') {
      steps {
        cleanWs()
        checkout scm
      }
    }

    stage('Levantar Dependencias Docker') {
      steps {
        sh 'docker compose up -d'
      }
    }

    stage('Compilar Backend') {
      steps {
        dir('micro-cursos') {
          sh './mvnw clean install -DskipTests'
        }
        dir('micro-estudiante') {
          sh './mvnw clean install -DskipTests'
        }
      }
    }

    stage('Compilar Frontend') {
      steps {
        dir('frontend') {
          sh 'npm install'
          sh 'npm run build'
        }
      }
    }

    stage('Tests') {
      steps {
        dir('micro-cursos') {
          sh './mvnw test'
        }
        dir('micro-estudiante') {
          sh './mvnw test'
        }
      }
    }

    stage('Build imágenes Docker') {
      steps {
        sh 'docker build -t davidrouet/micro-cursos:latest micro-cursos'
        sh 'docker build -t davidrouet/micro-estudiante:latest micro-estudiante'
        sh 'docker build -t davidrouet/cursos-micro-frontend:latest frontend'
      }
    }

    stage('Push DockerHub (opcional)') {
      when {
        expression { return env.DOCKER_USER && env.DOCKER_PASSWORD }
      }
      steps {
        withCredentials([usernamePassword(credentialsId: 'dockerhub-creds', usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASSWORD')]) {
          sh 'echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USER" --password-stdin'
          sh 'docker push davidrouet/micro-cursos:latest'
          sh 'docker push davidrouet/micro-estudiante:latest'
          sh 'docker push davidrouet/cursos-micro-frontend:latest'
        }
      }
    }

  }

  post {
    always {
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
