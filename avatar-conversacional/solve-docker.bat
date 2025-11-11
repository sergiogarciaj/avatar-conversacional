@echo off
REM Script para solucionar Docker - Avatar Conversacional
echo 🐳 Solucionando Docker para Avatar Conversacional...

REM 1. Limpiar Docker
echo 1. Limpiando Docker...
docker-compose down --volumes --remove-orphans 2>nul
docker system prune -f 2>nul
docker rmi -f avatar-conversacional 2>nul
docker rmi -f avatar-conversacional-dev 2>nul

REM 2. Verificar archivos
echo 2. Verificando archivos...
if not exist "package.json" (
    echo ❌ Falta: package.json
    goto :error
)
echo ✅ Encontrado: package.json

if not exist "next.config.mjs" (
    echo ❌ Falta: next.config.mjs
    goto :error
)
echo ✅ Encontrado: next.config.mjs

if not exist "app\page.tsx" (
    echo ❌ Falta: app\page.tsx
    goto :error
)
echo ✅ Encontrado: app\page.tsx

REM 3. Crear Dockerfile mínimo si no existe
if not exist "Dockerfile" (
    echo 3. Creando Dockerfile mínimo...
    (
        echo # Dockerfile Mínimo - Avatar Conversacional
        echo FROM node:18-alpine
        echo.
        echo RUN npm install -g pnpm
        echo.
        echo WORKDIR /app
        echo COPY . .
        echo RUN pnpm install
        echo EXPOSE 3000
        echo CMD ["pnpm", "dev"]
    ) > Dockerfile
)

REM 4. Construir imagen simple
echo 4. Construyendo imagen simple...
docker build -t avatar-conversacional --no-cache .

if %errorlevel% neq 0 (
    echo ❌ Error en el build
    goto :error
)

REM 5. Ejecutar contenedor
echo 5. Iniciando Avatar Conversacional...
docker run -d --name avatar-conversacional -p 3000:3000 -v %cd%:/app avatar-conversacional

REM 6. Verificar que está corriendo
echo 6. Verificando estado...
timeout /t 3 /nobreak >nul
docker ps | findstr "avatar-conversacional"

echo.
echo 🎉 Avatar Conversacional iniciado!
echo 🌐 Abre: http://localhost:3000
echo 📋 Logs: docker logs -f avatar-conversacional
echo 🛑 Parar: docker stop avatar-conversacional
echo 🗑️ Eliminar: docker rm avatar-conversacional
echo.
pause
exit /b 0

:error
echo ❌ Error en la configuración
echo.
pause
exit /b 1