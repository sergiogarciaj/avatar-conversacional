# Dockerfile para Avatar Conversacional
FROM node:18-alpine

# Instalar dependencias de sistema
RUN apk add --no-cache \
    ffmpeg \
    python3 \
    make \
    g++

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración de paquetes
COPY package*.json ./
COPY tsconfig.json ./
COPY next.config.mjs ./
COPY tailwind.config.js ./
COPY postcss.config.js ./
COPY vercel.json ./

# Instalar dependencias
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Compilar aplicación
RUN npm run build

# Exponer puerto
EXPOSE 3000

# Iniciar aplicación
CMD ["npm", "start"]