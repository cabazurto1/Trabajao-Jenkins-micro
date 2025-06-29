#!/bin/bash
# Script para automatizar el despliegue en Kubernetes

# Colores para mensajes
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}=== Iniciando despliegue de la aplicación en Kubernetes ===${NC}"

# Crear directorio para los manifests
mkdir -p k8s

# Crear los archivos de manifests
echo -e "${GREEN}Creando archivos de configuración...${NC}"

# Función para crear archivos de manifests
create_manifest() {
  local filename=$1
  local content=$2
  echo "$content" > "k8s/$filename"
  echo -e "${GREEN}Archivo k8s/$filename creado${NC}"
}

# Crear namespace.yaml
create_manifest "namespace.yaml" "apiVersion: v1
kind: Namespace
metadata:
  name: microservices-app"

# Crear configmap.yaml
create_manifest "configmap.yaml" "apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: microservices-app
data:
  MYSQL_DATABASE_CURSO: \"microcursos\"
  MYSQL_DATABASE_ESTUDIANTES: \"estudiantesCurso\"
  CORS_ALLOWED_ORIGINS: \"*\""

# Crear secret.yaml
create_manifest "secret.yaml" "apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
  namespace: microservices-app
type: Opaque
data:
  MYSQL_ROOT_PASSWORD: MTIzNA=="

# Crear PVs y PVCs
create_manifest "mysql-volumes.yaml" "apiVersion: v1
kind: PersistentVolume
metadata:
  name: mysql-curso-pv
  namespace: microservices-app
spec:
  capacity:
    storage: 1Gi
  accessModes:
    - ReadWriteOnce
  hostPath:
    path: \"/mnt/data/mysql-curso\"
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: mysql-curso-pvc
  namespace: microservices-app
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
---
apiVersion: v1
kind: PersistentVolume
metadata:
  name: mysql-estudiante-pv
  namespace: microservices-app
spec:
  capacity:
    storage: 1Gi
  accessModes:
    - ReadWriteOnce
  hostPath:
    path: \"/mnt/data/mysql-estudiante\"
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: mysql-estudiante-pvc
  namespace: microservices-app
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi"

# Crear MySQL deployments y services
create_manifest "mysql-deployments.yaml" "apiVersion: apps/v1
kind: Deployment
metadata:
  name: mysql-curso
  namespace: microservices-app
spec:
  selector:
    matchLabels:
      app: mysql-curso
  strategy:
    type: Recreate
  template:
    metadata:
      labels:
        app: mysql-curso
    spec:
      containers:
      - image: mysql:latest
        name: mysql
        env:
        - name: MYSQL_ROOT_PASSWORD
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: MYSQL_ROOT_PASSWORD
        - name: MYSQL_DATABASE
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: MYSQL_DATABASE_CURSO
        ports:
        - containerPort: 3306
          name: mysql
        volumeMounts:
        - name: mysql-curso-persistent-storage
          mountPath: /var/lib/mysql
      volumes:
      - name: mysql-curso-persistent-storage
        persistentVolumeClaim:
          claimName: mysql-curso-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: mysql-micro-curso
  namespace: microservices-app
spec:
  ports:
  - port: 3306
    targetPort: 3306
  selector:
    app: mysql-curso
  type: ClusterIP
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mysql-estudiante
  namespace: microservices-app
spec:
  selector:
    matchLabels:
      app: mysql-estudiante
  strategy:
    type: Recreate
  template:
    metadata:
      labels:
        app: mysql-estudiante
    spec:
      containers:
      - image: mysql:latest
        name: mysql
        env:
        - name: MYSQL_ROOT_PASSWORD
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: MYSQL_ROOT_PASSWORD
        - name: MYSQL_DATABASE
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: MYSQL_DATABASE_ESTUDIANTES
        ports:
        - containerPort: 3306
          name: mysql
        volumeMounts:
        - name: mysql-estudiante-persistent-storage
          mountPath: /var/lib/mysql
      volumes:
      - name: mysql-estudiante-persistent-storage
        persistentVolumeClaim:
          claimName: mysql-estudiante-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: mysql-micro-estudiante
  namespace: microservices-app
spec:
  ports:
  - port: 3306
    targetPort: 3306
  selector:
    app: mysql-estudiante
  type: ClusterIP"

# Crear microservicios
create_manifest "microservices.yaml" "apiVersion: apps/v1
kind: Deployment
metadata:
  name: micro-curso
  namespace: microservices-app
spec:
  replicas: 1
  selector:
    matchLabels:
      app: micro-curso
  template:
    metadata:
      labels:
        app: micro-curso
    spec:
      containers:
      - name: micro-curso
        image: davidrouet/micro-cursos:latest
        ports:
        - containerPort: 8003
        env:
        - name: SPRING_DATASOURCE_URL
          value: \"jdbc:mysql://mysql-micro-curso:3306/microcursos\"
        - name: SPRING_DATASOURCE_USERNAME
          value: \"root\"
        - name: SPRING_DATASOURCE_PASSWORD
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: MYSQL_ROOT_PASSWORD
        - name: CORS_ALLOWED_ORIGINS
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: CORS_ALLOWED_ORIGINS
---
apiVersion: v1
kind: Service
metadata:
  name: micro-cursos-app
  namespace: microservices-app
spec:
  selector:
    app: micro-curso
  ports:
  - port: 8003
    targetPort: 8003
  type: ClusterIP
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: micro-estudiante
  namespace: microservices-app
spec:
  replicas: 1
  selector:
    matchLabels:
      app: micro-estudiante
  template:
    metadata:
      labels:
        app: micro-estudiante
    spec:
      containers:
      - name: micro-estudiante
        image: davidrouet/micro-estudiantes:latest
        ports:
        - containerPort: 8002
        env:
        - name: SPRING_DATASOURCE_URL
          value: \"jdbc:mysql://mysql-micro-estudiante:3306/estudiantesCurso\"
        - name: SPRING_DATASOURCE_USERNAME
          value: \"root\"
        - name: SPRING_DATASOURCE_PASSWORD
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: MYSQL_ROOT_PASSWORD
        - name: CORS_ALLOWED_ORIGINS
          valueFrom:
            configMapKeyRef:
              name: app-config
              key: CORS_ALLOWED_ORIGINS
---
apiVersion: v1
kind: Service
metadata:
  name: micro-estudiante
  namespace: microservices-app
spec:
  selector:
    app: micro-estudiante
  ports:
  - port: 8002
    targetPort: 8002
  type: ClusterIP"

# Crear frontend
create_manifest "frontend.yaml" "apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend
  namespace: microservices-app
spec:
  replicas: 1
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: davidrouet/cursos-micro-frontend:latest
        ports:
        - containerPort: 80
        env:
        - name: REACT_APP_BACKEND_CURSOS
          value: \"http://micro-cursos-app:8003\"
        - name: REACT_APP_BACKEND_ESTUDIANTES
          value: \"http://micro-estudiante:8002\"
---
apiVersion: v1
kind: Service
metadata:
  name: micro-frontend
  namespace: microservices-app
spec:
  selector:
    app: frontend
  ports:
  - port: 80
    targetPort: 80
  type: NodePort"

# Crear ingress
create_manifest "ingress.yaml" "apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: microservices-ingress
  namespace: microservices-app
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /$2
spec:
  rules:
  - host: microservices.local
    http:
      paths:
      - path: /(.*)
        pathType: Prefix
        backend:
          service:
            name: micro-frontend
            port:
              number: 80
      - path: /api/cursos(/|$)(.*)
        pathType: Prefix
        backend:
          service:
            name: micro-cursos-app
            port:
              number: 8003
      - path: /api/estudiantes(/|$)(.*)
        pathType: Prefix
        backend:
          service:
            name: micro-estudiante
            port:
              number: 8002"

# Verificar si minikube está instalado
if command -v minikube &> /dev/null; then
    echo -e "${GREEN}Minikube detectado. Iniciando minikube...${NC}"
    minikube start
    minikube addons enable ingress
    MINIKUBE_IP=$(minikube ip)
    echo -e "${YELLOW}IP de minikube: $MINIKUBE_IP${NC}"
    echo -e "${YELLOW}Añadir al archivo hosts: $MINIKUBE_IP microservices.local${NC}"
else
    echo -e "${YELLOW}Minikube no detectado. Asegúrate de tener un clúster de Kubernetes configurado.${NC}"
fi

# Aplicar configuraciones a Kubernetes
echo -e "${GREEN}Aplicando configuraciones a Kubernetes...${NC}"

# Aplicar namespace primero
kubectl apply -f k8s/namespace.yaml

# Luego ConfigMap y Secret
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml

# Aplicar volúmenes
kubectl apply -f k8s/mysql-volumes.yaml

# Esperar un momento para que los volúmenes se creen
echo -e "${YELLOW}Esperando a que los volúmenes se creen...${NC}"
sleep 5

# Aplicar MySQL
kubectl apply -f k8s/mysql-deployments.yaml

# Esperar a que MySQL esté listo
echo -e "${YELLOW}Esperando a que MySQL esté listo (esto puede tomar un tiempo)...${NC}"
kubectl wait --for=condition=available deployment/mysql-curso --timeout=300s -n microservices-app
kubectl wait --for=condition=available deployment/mysql-estudiante --timeout=300s -n microservices-app

# Aplicar microservicios
kubectl apply -f k8s/microservices.yaml

# Aplicar frontend
kubectl apply -f k8s/frontend.yaml

# Aplicar ingress
kubectl apply -f k8s/ingress.yaml

echo -e "${GREEN}¡Despliegue completado! Verificando servicios...${NC}"

# Verificar pods
echo -e "${YELLOW}Pods:${NC}"
kubectl get pods -n microservices-app

# Verificar servicios
echo -e "${YELLOW}Servicios:${NC}"
kubectl get services -n microservices-app

# Verificar ingress
echo -e "${YELLOW}Ingress:${NC}"
kubectl get ingress -n microservices-app

# Instrucciones finales
echo -e "${GREEN}=== Instrucciones para acceder a la aplicación ===${NC}"
echo -e "1. Asegúrate de añadir la siguiente entrada a tu archivo hosts:"
echo -e "   (${YELLOW}$MINIKUBE_IP o 127.0.0.1) microservices.local${NC}"
echo -e "2. Accede a la aplicación en tu navegador: ${YELLOW}http://microservices.local${NC}"
echo -e "3. Para ver los logs de los servicios:"
echo -e "   ${YELLOW}kubectl logs -f deployment/micro-curso -n microservices-app${NC}"
echo -e "   ${YELLOW}kubectl logs -f deployment/micro-estudiante -n microservices-app${NC}"
echo -e "   ${YELLOW}kubectl logs -f deployment/frontend -n microservices-app${NC}"