@echo off
REM Script batch para Avatar Conversacional con Docker
REM Usar en CMD o Git Bash
REM Guardar como: start-avatar-docker.bat

if "%1"=="--help" goto :HELP
if "%1"=="-h" goto :HELP
if "%1"=="help" goto :HELP

echo.
echo 🐳 Avatar Conversacional con Docker
echo ================================
echo.

REM Verificar Docker
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: Docker no está instalado o no está corriendo
    echo    Instala Docker Desktop desde: https://www.docker.com/products/docker-desktop/
    echo.
    pause
    exit /b 1
)
echo ✅ Docker encontrado
docker --version

REM Verificar Docker Compose
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: Docker Compose no está disponible
    echo.
    pause
    exit /b 1
)
echo ✅ Docker Compose encontrado
docker-compose --version
echo.

REM Verificar si existe docker-compose.yml
if not exist "docker-compose.yml" (
    echo ❌ Error: No se encontró docker-compose.yml
    echo    Asegúrate de ejecutar este script en la carpeta del proyecto
    echo.
    pause
    exit /b 1
)

REM Determinar acción
if "%1"=="stop" goto :STOP
if "%1"=="down" goto :STOP
if "%1"=="logs" goto :LOGS
if "%1"=="build" goto :BUILD
if "%1"=="dev" goto :DEV

REM Acción por defecto: iniciar
echo 🚀 Iniciando Avatar Conversacional...
echo    Modo: Production
echo    Puerto: 3000
echo    URL: http://localhost:3000
echo.

docker-compose down --remove-orphans 2>nul
docker-compose up -d --build

if %errorlevel% equ 0 (
    echo.
    echo ✅ Avatar Conversacional iniciado correctamente!
    echo 🌐 Abre tu navegador en: http://localhost:3000
    echo 📋 Para ver logs: docker-compose logs -f
    echo 🛑 Para detener: docker-compose down
    echo.
) else (
    echo ❌ Error al iniciar el contenedor
    echo.
)
pause
exit /b 0

:BUILD
echo 🔨 Construyendo imagen Docker...
docker-compose build
if %errorlevel% equ 0 (
    echo ✅ Imagen construida correctamente
) else (
    echo ❌ Error al construir imagen
)
echo.
pause
exit /b 0

:DEV
echo 🚀 Iniciando Avatar Conversacional en modo desarrollo...
echo    Modo: Development
echo    Puerto: 3000
echo    URL: http://localhost:3000
echo.

docker-compose down --remove-orphans 2>nul
docker-compose up -d --build avatar-dev

if %errorlevel% equ 0 (
    echo.
    echo ✅ Avatar Conversacional iniciado en modo desarrollo!
    echo 🌐 Abre tu navegador en: http://localhost:3000
    echo 📋 Para ver logs: docker-compose logs -f
    echo 🛑 Para detener: docker-compose down
    echo.
) else (
    echo ❌ Error al iniciar el contenedor
    echo.
)
pause
exit /b 0

:STOP
echo 🛑 Deteniendo contenedores...
docker-compose down --remove-orphans
echo ✅ Contenedores detenidos
echo.
pause
exit /b 0

:LOGS
echo 📋 Mostrando logs... (Ctrl+C para salir)
echo ==============================================
docker-compose logs -f --tail=50
pause
exit /b 0

:HELP
echo.
echo 🐳 Avatar Conversacional - Script Docker para Windows
echo ===================================================
echo.
echo Uso:
echo   start-avatar-docker.bat [comando]
echo.
echo Comandos:
echo   (sin parametro)  Iniciar en modo producción
echo   dev              Iniciar en modo desarrollo
echo   build            Construir imagen sin iniciar
echo   stop             Detener contenedores
echo   logs             Ver logs en tiempo real
echo   help             Mostrar esta ayuda
echo.
echo Ejemplos:
echo   start-avatar-docker.bat
echo   start-avatar-docker.bat dev
echo   start-avatar-docker.bat stop
echo   start-avatar-docker.bat logs
echo.
echo URLs:
echo   http://localhost:3000
echo.
pause
exit /b 0