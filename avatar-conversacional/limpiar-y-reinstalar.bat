# Script de Limpieza y Reinstalación Completa (Batch)
# Avatar Conversacional - Docker Setup

@echo off
echo 🧹 INICIANDO LIMPIEZA COMPLETA DEL PROYECTO AVATAR CONVERSACIONAL
echo =================================================================

echo.
echo 1. Deteniendo y eliminando contenedores Docker...
docker-compose down --remove-orphans 2>nul
for /f "tokens=*" %%i in ('docker ps -a --filter "name=avatar" --format "{{.ID}}"') do (
    echo    🗑️ Eliminando contenedor %%i
    docker rm -f %%i 2>nul
)

echo.
echo 2. Eliminando imágenes Docker...
for /f "tokens=*" %%i in ('docker images --filter "reference=avatar*" --format "{{.ID}}"') do (
    echo    🗑️ Eliminando imagen %%i
    docker rmi -f %%i 2>nul
)

echo.
echo 3. Limpiando sistema Docker...
docker system prune -f --volumes 2>nul
docker builder prune -f 2>nul

echo.
echo 4. Limpiando dependencias Node.js...
if exist node_modules (
    echo    🗑️ Eliminando node_modules
    rmdir /s /q node_modules 2>nul
)
if exist package-lock.json (
    echo    🗑️ Eliminando package-lock.json
    del package-lock.json 2>nul
)
if exist pnpm-lock.yaml (
    echo    🗑️ Eliminando pnpm-lock.yaml
    del pnpm-lock.yaml 2>nul
)

echo.
echo 5. Reinstalando dependencias Node.js...
echo    📦 Instalando dependencias...
npm install
if errorlevel 1 (
    echo    ❌ Error en npm install
    pause
    exit /b 1
)

echo.
echo 6. Construyendo imagen Docker desde cero...
echo    🐳 Construyendo con Dockerfile.ultra...
docker build -f Dockerfile.ultra -t avatar:latest . --no-cache
if errorlevel 1 (
    echo    ❌ Error al construir imagen Docker
    echo.
    echo 🔧 Ejecuta manualmente: docker system prune -f
    echo    Y luego: docker build -f Dockerfile.ultra -t avatar .
    pause
    exit /b 1
)

echo    ✅ Imagen Docker construida exitosamente
echo.
echo 7. Iniciando contenedor...
echo    🚀 Ejecutando en puerto 3000...
docker run -d --name avatar-app -p 3000:3000 avatar:latest
if errorlevel 1 (
    echo    ❌ Error al ejecutar contenedor
    pause
    exit /b 1
)

echo.
echo ✅ ¡INSTALACIÓN COMPLETADA EXITOSAMENTE!
echo =================================================================
echo 🌐 Tu aplicación está disponible en: http://localhost:3000
echo 📋 Logs del contenedor: docker logs avatar-app
echo 🛑 Detener contenedor: docker stop avatar-app
echo 🗑️ Eliminar contenedor: docker rm avatar-app
echo.
echo 🎯 LIMPIEZA Y REINSTALACIÓN COMPLETADA
pause