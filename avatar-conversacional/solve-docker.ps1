# Script de solución Docker - Avatar Conversacional
# Solucionar problemas comunes de Docker

Write-Host "🐳 Solucionando Docker para Avatar Conversacional..." -ForegroundColor Cyan

# 1. Limpiar Docker completamente
Write-Host "1. Limpiando Docker..." -ForegroundColor Yellow
docker-compose down --volumes --remove-orphans 2>$null
docker system prune -f 2>$null
docker rmi -f avatar-conversacional 2>$null
docker rmi -f avatar-conversacional-dev 2>$null

# 2. Verificar archivos necesarios
Write-Host "2. Verificando archivos..." -ForegroundColor Yellow
$requiredFiles = @("package.json", "next.config.mjs", "app/page.tsx")
$missingFiles = @()

foreach ($file in $requiredFiles) {
    if (-not (Test-Path $file)) {
        $missingFiles += $file
        Write-Host "❌ Falta: $file" -ForegroundColor Red
    } else {
        Write-Host "✅ Encontrado: $file" -ForegroundColor Green
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Host "❌ Error: Faltan archivos requeridos" -ForegroundColor Red
    exit 1
}

# 3. Crear Dockerfile mínimo si no existe
if (-not (Test-Path "Dockerfile")) {
    Write-Host "3. Creando Dockerfile mínimo..." -ForegroundColor Yellow
    @"
# Dockerfile Mínimo - Avatar Conversacional
FROM node:18-alpine

# Instalar pnpm
RUN npm install -g pnpm

WORKDIR /app
COPY . .
RUN pnpm install
EXPOSE 3000
CMD ["pnpm", "dev"]
"@ | Out-File -FilePath "Dockerfile" -Encoding utf8
}

# 4. Construir con build simple
Write-Host "4. Construyendo imagen simple..." -ForegroundColor Yellow
docker build -t avatar-conversacional --no-cache .

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error en el build" -ForegroundColor Red
    exit 1
}

# 5. Ejecutar contenedor
Write-Host "5. Iniciando Avatar Conversacional..." -ForegroundColor Yellow
docker run -d --name avatar-conversacional -p 3000:3000 -v $PWD:/app avatar-conversacional

# 6. Verificar que está corriendo
Write-Host "6. Verificando estado..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
docker ps | Select-String "avatar-conversacional"

Write-Host "`n🎉 Avatar Conversacional iniciado!" -ForegroundColor Green
Write-Host "🌐 Abre: http://localhost:3000" -ForegroundColor Cyan
Write-Host "📋 Logs: docker logs -f avatar-conversacional" -ForegroundColor White
Write-Host "🛑 Parar: docker stop avatar-conversacional" -ForegroundColor White
Write-Host "🗑️ Eliminar: docker rm avatar-conversacional" -ForegroundColor White