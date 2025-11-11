@echo off
title Avatar Conversacional - Comandos Rapidos
color 0A

:MENU
cls
echo.
echo ╔══════════════════════════════════════════════════════════╗
echo ║           AVATAR CONVERSACIONAL - COMANDOS RÁPIDOS        ║
echo ╚══════════════════════════════════════════════════════════╝
echo.
echo  🔧 LIMPIEZA Y REINSTALACIÓN:
echo    1) 🧹 Limpieza completa y reinstalar
echo    2) 🐳 Construir con Docker Compose
echo    3) ⚡ Docker rápido con Dockerfile.ultra
echo.
echo  🔍 VERIFICACIÓN:
echo    4) 👀 Ver estado de contenedores
echo    5) 📋 Ver logs del avatar
echo    6) 🌐 Abrir aplicación (localhost:3000)
echo.
echo  🛠️ MANTENIMIENTO:
echo    7) 🛑 Detener avatar
echo    8) 🗑️ Eliminar contenedor avatar
echo    9) 🧹 Limpiar sistema Docker
echo.
echo  🔄 DESARROLLO:
echo    10) 🚀 Ejecutar en modo desarrollo
echo    11) 🔨 Rebuild completo
echo.
echo  0) ❌ Salir
echo.
set /p choice="Selecciona una opción (0-11): "

if "%choice%"=="1" goto LIMPIAR
if "%choice%"=="2" goto DOCKER_COMPOSE
if "%choice%"=="3" goto DOCKER_RAPIDO
if "%choice%"=="4" goto VER_ESTADO
if "%choice%"=="5" goto VER_LOGS
if "%choice%"=="6" goto ABRIR_APP
if "%choice%"=="7" goto DETENER
if "%choice%"=="8" goto ELIMINAR
if "%choice%"=="9" goto LIMPIAR_DOCKER
if "%choice%"=="10" goto DEV_MODE
if "%choice%"=="11" goto REBUILD
if "%choice%"=="0" goto SALIR

echo Opción no válida. Presiona cualquier tecla para continuar...
pause >nul
goto MENU

:LIMPIAR
echo.
echo 🧹 Ejecutando limpieza completa...
call limpiar-y-reinstalar.bat
pause
goto MENU

:DOCKER_COMPOSE
echo.
echo 🐳 Construyendo con Docker Compose...
docker-compose -f docker-compose.simple.yml up -d --build
if errorlevel 1 (
    echo ❌ Error en Docker Compose. Presiona cualquier tecla...
    pause
) else (
    echo ✅ Avatar iniciado exitosamente en http://localhost:3000
)
pause
goto MENU

:DOCKER_RAPIDO
echo.
echo ⚡ Construyendo con Docker rápido...
docker build -f Dockerfile.ultra -t avatar .
if errorlevel 1 (
    echo ❌ Error en build. Presiona cualquier tecla...
    pause
) else (
    echo 🚀 Ejecutando contenedor...
    docker run -d --name avatar-app -p 3000:3000 avatar
    if errorlevel 1 (
        echo ❌ Error ejecutando contenedor. Presiona cualquier tecla...
        pause
    ) else (
        echo ✅ Avatar iniciado en http://localhost:3000
    )
)
pause
goto MENU

:VER_ESTADO
echo.
echo 👀 Estado de contenedores:
docker ps -a | findstr avatar || echo No hay contenedores con "avatar"
pause
goto MENU

:VER_LOGS
echo.
echo 📋 Logs del avatar:
docker logs avatar-app --tail 20
pause
goto MENU

:ABRIR_APP
echo.
echo 🌐 Abriendo aplicación...
start http://localhost:3000
echo ✅ Aplicación abierta en el navegador
pause
goto MENU

:DETENER
echo.
echo 🛑 Deteniendo avatar...
docker stop avatar-app 2>nul
if errorlevel 1 (
    echo ⚠️ Contenedor avatar-app no encontrado o ya está detenido
) else (
    echo ✅ Avatar detenido exitosamente
)
pause
goto MENU

:ELIMINAR
echo.
echo 🗑️ Eliminando contenedor avatar...
docker rm avatar-app 2>nul
if errorlevel 1 (
    echo ⚠️ Contenedor avatar-app no encontrado
) else (
    echo ✅ Contenedor eliminado exitosamente
)
pause
goto MENU

:LIMPIAR_DOCKER
echo.
echo 🧹 Limpiando sistema Docker...
docker system prune -f --volumes
echo ✅ Sistema Docker limpiado
pause
goto MENU

:DEV_MODE
echo.
echo 🚀 Ejecutando en modo desarrollo...
docker-compose -f docker-compose.simple.yml up avatar-dev -d
if errorlevel 1 (
    echo ❌ Error iniciando modo desarrollo
) else (
    echo ✅ Modo desarrollo iniciado en http://localhost:3001
)
pause
goto MENU

:REBUILD
echo.
echo 🔨 Rebuild completo del proyecto...
docker-compose -f docker-compose.simple.yml up -d --build --force-recreate
if errorlevel 1 (
    echo ❌ Error en rebuild
) else (
    echo ✅ Rebuild completado exitosamente
)
pause
goto MENU

:SALIR
echo.
echo 👋 ¡Hasta luego!
timeout /t 2 >nul
exit