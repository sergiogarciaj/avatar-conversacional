# 🐳 Avatar Conversacional con Docker en Windows

## 📋 Requisitos Previos

### 1. Docker Desktop para Windows
1. Descarga Docker Desktop desde: https://www.docker.com/products/docker-desktop/
2. Instala Docker Desktop en tu PC con Windows
3. Inicia Docker Desktop y asegúrate de que esté funcionando
4. Verifica que puedas ejecutar: `docker --version` en la terminal

### 2. Comandos Básicos de Docker
```bash
# Verificar que Docker funciona
docker --version
docker-compose --version

# Ver qué contenedores están corriendo
docker ps
```

## 🚀 Opciones para Ejecutar con Docker

### Opción 1: Ejecución Rápida con Docker Compose (RECOMENDADA)

#### 1.1 Abrir Terminal en la Carpeta del Proyecto
- Abre PowerShell, CMD o Git Bash
- Navega hasta la carpeta donde tienes el proyecto:
```bash
cd "C:\ruta\a\tu\proyecto\avatar-conversacional"
```

#### 1.2 Ejecutar con Docker Compose
```bash
# Para producción (build y run)
docker-compose up -d --build

# Para desarrollo (con hot-reload)
docker-compose up -d --build avatar-dev

# Ver logs en tiempo real
docker-compose logs -f

# Detener contenedores
docker-compose down
```

#### 1.3 Verificar que Está Funcionando
- Abre tu navegador en: http://localhost:3000
- Deberías ver tu aplicación ejecutándose

### Opción 2: Ejecución Directa con Docker

#### 2.1 Construir la Imagen
```bash
# Construir imagen para producción
docker build -t avatar-conversacional .

# Construir imagen para desarrollo
docker build -f Dockerfile.dev -t avatar-conversacional-dev .
```

#### 2.2 Ejecutar el Contenedor
```bash
# Para producción
docker run -p 3000:3000 --name avatar-app avatar-conversacional

# Para desarrollo
docker run -p 3000:3000 -v $(pwd):/app -v /app/node_modules --name avatar-dev avatar-conversacional-dev
```

## 🛠️ Comandos Útiles para Windows

### Gestión de Contenedores
```bash
# Ver contenedores corriendo
docker ps

# Ver todos los contenedores (incluidos los detenidos)
docker ps -a

# Ver logs de un contenedor
docker logs avatar-app

# Ver logs en tiempo real
docker logs -f avatar-app

# Parar un contenedor
docker stop avatar-app

# Eliminar un contenedor
docker rm avatar-app

# Verificar uso de recursos
docker stats
```

### Gestión de Imágenes
```bash
# Ver todas las imágenes
docker images

# Eliminar una imagen
docker rmi avatar-conversacional

# Limpiar imágenes no utilizadas
docker system prune
```

### Volúmenes y Redes
```bash
# Ver volúmenes
docker volume ls

# Ver redes
docker network ls

# Limpiar todo lo no utilizado
docker system prune -a
```

## 🔧 Solución de Problemas Comunes

### Error: "Port 3000 is already in use"
```bash
# Encontrar qué está usando el puerto
netstat -ano | findstr :3000

# Matar el proceso (reemplaza PID con el número que salga)
taskkill /PID <PID> /F

# O usar un puerto diferente
docker run -p 3001:3000 avatar-conversacional
```

### Error: "Docker daemon is not running"
- Asegúrate de que Docker Desktop esté iniciado
- Reinicia Docker Desktop si es necesario
- Verifica que tienes permisos de administrador

### Error: "Build failed" o "Permission denied"
```bash
# En Windows, usar comillas para rutas con espacios
docker build -t avatar-conversacional "C:\ruta con espacios\proyecto"

# O navegar a la carpeta y usar rutas relativas
cd "C:\ruta a\proyecto"
docker build -t avatar-conversacional .
```

### Error: "Cannot connect to the Docker daemon"
- Verifica que Docker Desktop esté corriendo
- Reinicia la terminal (PowerShell/CMD)
- Verifica que estés en el grupo de usuarios de Docker (si se requiere)

## 📁 Estructura de Archivos Docker

Tu proyecto ahora incluye:
- `Dockerfile` - Imagen para producción
- `Dockerfile.dev` - Imagen para desarrollo con hot-reload
- `docker-compose.yml` - Orquestación de servicios
- `.dockerignore` - Archivos a ignorar en el build

## 🌐 Acceso a la Aplicación

Una vez ejecutándose, tu aplicación estará disponible en:
- **Producción**: http://localhost:3000
- **Desarrollo**: http://localhost:3000 (con hot-reload)

## 🔄 Desarrollo con Docker

Para desarrollo continuo, usa:
```bash
# Ejecutar en modo desarrollo
docker-compose up -d --build avatar-dev

# Ver cambios en tiempo real
docker-compose logs -f avatar-dev

# Entrar al contenedor para debugging
docker exec -it avatar-dev sh
```

## ⚡ Performance en Windows

### Recomendaciones:
1. **Asignar más recursos a Docker Desktop**:
   - Ve a Settings → Resources → Advanced
   - Asigna al menos 4GB de RAM
   - Asigna al menos 2 CPUs

2. **Usar WSL 2** (recomendado):
   - Habilita WSL 2 en Windows
   - Docker Desktop usará WSL 2 automáticamente
   - Mejor rendimiento para contenedores Linux

3. **Antivirus**:
   - Excluye la carpeta del proyecto de los escaneos de antivirus
   - Excluye Docker Desktop de las verificaciones en tiempo real

## 📞 Soporte

Si encuentras problemas:
1. Verifica que Docker Desktop esté corriendo
2. Revisa los logs con `docker logs avatar-app`
3. Asegúrate de que el puerto 3000 no esté siendo usado
4. Reinicia Docker Desktop si es necesario

¡Listo! Ya tienes tu avatar conversacional ejecutándose con Docker en Windows. 🎉