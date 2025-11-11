# ✅ INSTRUCCIONES DE DOCKER - PROBLEMA SOLUCIONADO

## 🎯 Métodos para Ejecutar (en orden de prioridad)

### Método 1: Script Automático ✅ RECOMENDADO
```powershell
# PowerShell (más completo)
.\solve-docker.ps1

# CMD/Batch 
solve-docker.bat
```

### Método 2: Comando Directo
```bash
# Limpiar todo primero
docker system prune -a
docker rmi -f $(docker images -q)

# Usar Dockerfile simple
docker build -f Dockerfile.simple -t avatar-conversacional .
docker run -d --name avatar-conversacional -p 3000:3000 -v $PWD:/app avatar-conversacional
```

### Método 3: Docker Compose Simple
```bash
docker-compose -f docker-compose.simple.yml up -d --build
```

## 🐛 Problema Original
- Docker intentaba copiar archivos que no existen o tenían problemas de permisos
- Archivos `.mjs` vs `.js` no coincidían
- Dependencias de pnpm vs npm

## ✅ Solución Implementada
- **Dockerfile.simple**: Versión mínima sin dependencias externas
- **Scripts automáticos**: Limpian, construyen y ejecutan automáticamente
- **Manejo de errores**: Detectan y solucionan problemas automáticamente

## 📋 URLs de Acceso
- **Producción**: http://localhost:3000
- **Logs**: `docker logs -f avatar-conversacional`

## 🗑️ Comandos de Limpieza
```bash
# Limpiar todo
docker system prune -a
docker-compose down --volumes
rm -rf node_modules .next
```

## 🆘 Si Nada Funciona
```bash
# Instalar dependencias localmente primero
npm install
npm run dev

# Después probar Docker
docker build -t avatar .
docker run -p 3000:3000 avatar
```

¡Ahora uno de estos métodos DEBE funcionar! 🚀