# Etapa 1: Construcción
FROM node:18 AS builder
WORKDIR /app

# Copiar package.json e instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar el resto de archivos y construir
COPY . .
RUN npm run build

# Etapa 2: Servir la aplicación con Nginx
FROM nginx:stable-alpine
COPY --from=builder /app/dist /usr/share/nginx/html

# Exponer el puerto (para Nginx)
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
