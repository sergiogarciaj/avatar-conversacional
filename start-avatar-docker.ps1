# Script de PowerShell para Avatar Conversacional con Docker
# Guardar como: start-avatar-docker.ps1

param(
    [string]$Mode = "production",
    [string]$Port = "3000",
    [switch]$Build,
    [switch]$Dev,
    [switch]$Stop,
    [switch]$Logs,
    [switch]$Help
)

# Colores para output
function Write-ColorOutput {
    param(
        [string]$Text,
        [string]$Color = "White"
    )
    Write-Host $Text -ForegroundColor $Color
}

# Mostrar ayuda
function Show-Help {
    Write-ColorOutput "`n🐳 Avatar Conversacional - Script Docker para Windows" "Cyan"
    Write-ColorOutput "===================================================" "Cyan"
    Write-ColorOutput "`nUso:" "Yellow"
    Write-ColorOutput "  .\start-avatar-docker.ps1 [opciones]" "White"
    Write-ColorOutput "`nOpciones:" "Yellow"
    Write-ColorOutput "  -Mode <production|development>  Modo de ejecución (default: production)" "White"
    Write-ColorOutput "  -Port <puerto>                Puerto a usar (default: 3000)" "White"
    Write-ColorOutput "  -Build                        Forzar rebuild de imagen" "White"
    Write-ColorOutput "  -Dev                          Modo desarrollo" "White"
    Write-ColorOutput "  -Stop                         Detener contenedores" "White"
    Write-ColorOutput "  -Logs                         Ver logs en tiempo real" "White"
    Write-ColorOutput "  -Help                         Mostrar esta ayuda" "White"
    Write-ColorOutput "`nEjemplos:" "Yellow"
    Write-ColorOutput "  .\start-avatar-docker.ps1 -Mode production" "White"
    Write-ColorOutput "  .\start-avatar-docker.ps1 -Dev -Build" "White"
    Write-ColorOutput "  .\start-avatar-docker.ps1 -Port 3001" "White"
    Write-ColorOutput "  .\start-avatar-docker.ps1 -Stop" "White"
    Write-ColorOutput "  .\start-avatar-docker.ps1 -Logs" "White"
    Write-ColorOutput "`nURLs:" "Yellow"
    Write-ColorOutput "  http://localhost:3000" "Green"
    Write-ColorOutput "  http://localhost:3001 (si usas -Port 3001)" "Green"
    Write-ColorOutput ""
}

# Verificar Docker
function Test-Docker {
    try {
        $dockerVersion = docker --version
        if ($dockerVersion) {
            Write-ColorOutput "✅ Docker encontrado: $dockerVersion" "Green"
            return $true
        }
    } catch {
        Write-ColorOutput "❌ Error: Docker no está instalado o no está corriendo" "Red"
        Write-ColorOutput "   Instala Docker Desktop desde: https://www.docker.com/products/docker-desktop/" "Yellow"
        return $false
    }
}

# Verificar Docker Compose
function Test-DockerCompose {
    try {
        $composeVersion = docker-compose --version
        if ($composeVersion) {
            Write-ColorOutput "✅ Docker Compose encontrado: $composeVersion" "Green"
            return $true
        }
    } catch {
        Write-ColorOutput "❌ Error: Docker Compose no está disponible" "Red"
        return $false
    }
}

# Detener contenedores
function Stop-Containers {
    Write-ColorOutput "`n🛑 Deteniendo contenedores..." "Yellow"
    docker-compose down --remove-orphans
    Write-ColorOutput "✅ Contenedores detenidos" "Green"
}

# Construir imagen
function Build-Image {
    param([string]$TargetMode = "production")
    Write-ColorOutput "`n🔨 Construyendo imagen Docker..." "Yellow"
    
    if ($TargetMode -eq "development") {
        docker-compose build avatar-dev
    } else {
        docker-compose build
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput "✅ Imagen construida correctamente" "Green"
    } else {
        Write-ColorOutput "❌ Error al construir imagen" "Red"
        exit 1
    }
}

# Iniciar aplicación
function Start-Application {
    param([string]$TargetMode = "production", [string]$TargetPort = "3000")
    Write-ColorOutput "`n🚀 Iniciando Avatar Conversacional..." "Yellow"
    Write-ColorOutput "   Modo: $TargetMode" "White"
    Write-ColorOutput "   Puerto: $TargetPort" "White"
    Write-ColorOutput "   URL: http://localhost:$TargetPort" "Green"
    
    # Detener contenedores existentes si están corriendo
    docker-compose down --remove-orphans 2>$null
    
    if ($TargetMode -eq "development") {
        docker-compose -f docker-compose.yml up -d --build avatar-dev
    } else {
        docker-compose -f docker-compose.yml up -d --build
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput "`n✅ Avatar Conversacional iniciado correctamente!" "Green"
        Write-ColorOutput "🌐 Abre tu navegador en: http://localhost:$TargetPort" "Cyan"
        Write-ColorOutput "📋 Para ver logs: .\start-avatar-docker.ps1 -Logs" "White"
        Write-ColorOutput "🛑 Para detener: .\start-avatar-docker.ps1 -Stop" "White"
    } else {
        Write-ColorOutput "❌ Error al iniciar el contenedor" "Red"
    }
}

# Mostrar logs
function Show-Logs {
    Write-ColorOutput "`n📋 Mostrando logs... (Ctrl+C para salir)" "Yellow"
    Write-ColorOutput "======================================" "Yellow"
    docker-compose logs -f --tail=50
}

# Verificar estado
function Check-Status {
    Write-ColorOutput "`n📊 Estado de los contenedores:" "Cyan"
    docker-compose ps
    Write-ColorOutput "`n🔍 Logs recientes:" "Cyan"
    docker-compose logs --tail=10
}

# Función principal
function Main {
    if ($Help) {
        Show-Help
        return
    }
    
    # Verificar Docker
    if (-not (Test-Docker)) {
        exit 1
    }
    
    if (-not (Test-DockerCompose)) {
        exit 1
    }
    
    # Mostrar banner
    Write-ColorOutput "`n🐳 Avatar Conversacional con Docker" "Cyan"
    Write-ColorOutput "=====================================" "Cyan"
    
    # Verificar si existe docker-compose.yml
    if (-not (Test-Path "docker-compose.yml")) {
        Write-ColorOutput "❌ Error: No se encontró docker-compose.yml" "Red"
        Write-ColorOutput "   Asegúrate de ejecutar este script en la carpeta del proyecto" "Yellow"
        exit 1
    }
    
    # Determinar modo
    $targetMode = $Mode
    if ($Dev) {
        $targetMode = "development"
    }
    
    # Ejecutar acción solicitada
    if ($Stop) {
        Stop-Containers
    } elseif ($Logs) {
        Show-Logs
    } elseif ($Build) {
        Build-Image -TargetMode $targetMode
    } else {
        Start-Application -TargetMode $targetMode -TargetPort $Port
    }
}

# Ejecutar función principal
Main