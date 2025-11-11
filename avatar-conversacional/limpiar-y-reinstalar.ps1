# Script de Limpieza y Reinstalación Completa
# Avatar Conversacional - Docker Setup

Write-Host "🧹 INICIANDO LIMPIEZA COMPLETA DEL PROYECTO AVATAR CONVERSACIONAL" -ForegroundColor Green
Write-Host "================================================================" -ForegroundColor Green

# Paso 1: Detener y eliminar contenedores
Write-Host "`n1. Deteniendo y eliminando contenedores Docker..." -ForegroundColor Yellow
docker-compose down --remove-orphans 2>$null
docker ps -a --filter "name=avatar" --format "{{.ID}}" | ForEach-Object { 
    Write-Host "   🗑️ Eliminando contenedor $_" -ForegroundColor Red
    docker rm -f $_ 2>$null 
}

# Paso 2: Eliminar imágenes
Write-Host "`n2. Eliminando imágenes Docker..." -ForegroundColor Yellow
docker images --filter "reference=avatar*" --format "{{.ID}}" | ForEach-Object {
    Write-Host "   🗑️ Eliminando imagen $_" -ForegroundColor Red
    docker rmi -f $_ 2>$null
}

# Paso 3: Limpiar sistema Docker
Write-Host "`n3. Limpiando sistema Docker..." -ForegroundColor Yellow
docker system prune -f --volumes 2>$null
docker builder prune -f 2>$null

# Paso 4: Backup de archivos importantes
Write-Host "`n4. Creando backup de configuración..." -ForegroundColor Yellow
if (!(Test-Path "backup-config")) {
    New-Item -ItemType Directory -Path "backup-config" -Force
}
Copy-Item "package.json" "backup-config/" -Force
Copy-Item "next.config.mjs" "backup-config/" -Force -ErrorAction SilentlyContinue
Copy-Item "postcss.config.mjs" "backup-config/" -Force -ErrorAction SilentlyContinue
Copy-Item "eslint.config.mjs" "backup-config/" -Force -ErrorAction SilentlyContinue

# Paso 5: Limpiar node_modules
Write-Host "`n5. Limpiando dependencias Node.js..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "   🗑️ Eliminando node_modules" -ForegroundColor Red
    Remove-Item -Recurse -Force "node_modules" -ErrorAction SilentlyContinue
}
if (Test-Path "package-lock.json") {
    Write-Host "   🗑️ Eliminando package-lock.json" -ForegroundColor Red
    Remove-Item "package-lock.json" -Force -ErrorAction SilentlyContinue
}
if (Test-Path "pnpm-lock.yaml") {
    Write-Host "   🗑️ Eliminando pnpm-lock.yaml" -ForegroundColor Red
    Remove-Item "pnpm-lock.yaml" -Force -ErrorAction SilentlyContinue
}

# Paso 6: Reinstalar dependencias
Write-Host "`n6. Reinstalando dependencias Node.js..." -ForegroundColor Yellow
Write-Host "   📦 Instalando dependencias..." -ForegroundColor Cyan
npm install
if (LASTEXITCODE -ne 0) {
    Write-Host "   ❌ Error en npm install" -ForegroundColor Red
    exit 1
}

# Paso 7: Verificar archivos de configuración
Write-Host "`n7. Verificando archivos de configuración..." -ForegroundColor Yellow
$requiredFiles = @("package.json", "next.config.mjs", "postcss.config.mjs")
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "   ✅ $file existe" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $file faltante" -ForegroundColor Red
    }
}

# Paso 8: Construir Docker desde cero
Write-Host "`n8. Construyendo imagen Docker desde cero..." -ForegroundColor Yellow
Write-Host "   🐳 Construyendo con Dockerfile.ultra..." -ForegroundColor Cyan
docker build -f Dockerfile.ultra -t avatar:latest . --no-cache

if (LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Imagen Docker construida exitosamente" -ForegroundColor Green
    
    # Paso 9: Ejecutar contenedor
    Write-Host "`n9. Iniciando contenedor..." -ForegroundColor Yellow
    Write-Host "   🚀 Ejecutando en puerto 3000..." -ForegroundColor Cyan
    docker run -d --name avatar-app -p 3000:3000 avatar:latest
    
    if (LASTEXITCODE -eq 0) {
        Write-Host "`n✅ ¡INSTALACIÓN COMPLETADA EXITOSAMENTE!" -ForegroundColor Green
        Write-Host "================================================================" -ForegroundColor Green
        Write-Host "🌐 Tu aplicación está disponible en: http://localhost:3000" -ForegroundColor Cyan
        Write-Host "📋 Logs del contenedor: docker logs avatar-app" -ForegroundColor Yellow
        Write-Host "🛑 Detener contenedor: docker stop avatar-app" -ForegroundColor Yellow
        Write-Host "🗑️ Eliminar contenedor: docker rm avatar-app" -ForegroundColor Yellow
    } else {
        Write-Host "   ❌ Error al ejecutar contenedor" -ForegroundColor Red
    }
} else {
    Write-Host "   ❌ Error al construir imagen Docker" -ForegroundColor Red
    Write-Host "`n🔧 Ejecuta manualmente: docker system prune -f" -ForegroundColor Yellow
    Write-Host "   Y luego: docker build -f Dockerfile.ultra -t avatar ." -ForegroundColor Yellow
}

Write-Host "`n🎯 LIMPIEZA Y REINSTALACIÓN COMPLETADA" -ForegroundColor Green