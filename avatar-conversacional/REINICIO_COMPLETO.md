# 🚀 REINICIO COMPLETO - Avatar Conversacional

## ⚡ Método 1: Limpieza Automática (Recomendado)

### PowerShell (Windows)
```powershell
./limpiar-y-reinstalar.ps1
```

### Batch (CMD/Windows)
```cmd
limpiar-y-reinstalar.bat
```

---

## 🛠️ Método 2: Comandos Manuales

### 1. Limpiar Docker
```bash
# Detener y eliminar contenedores
docker-compose down --remove-orphans

# Eliminar contenedores relacionados con avatar
docker ps -a --filter "name=avatar" --format "{{.ID}}" | xargs docker rm -f

# Eliminar imágenes
docker images --filter "reference=avatar*" --format "{{.ID}}" | xargs docker rmi -f

# Limpiar sistema
docker system prune -f --volumes
```

### 2. Reinstalar Dependencias
```bash
# Limpiar node_modules
rmdir /s node_modules
del package-lock.json
del pnpm-lock.yaml

# Reinstalar
npm install
```

### 3. Construir y Ejecutar
```bash
# Método A: Docker Compose Simple
docker-compose -f docker-compose.simple.yml up -d --build

# Método B: Docker Manual
docker build -f Dockerfile.ultra -t avatar .
docker run -d --name avatar-app -p 3000:3000 avatar

# Método C: Docker Compose Principal
docker-compose up -d --build
```

---

## 🔍 Verificar Estado

### Verificar contenedores
```bash
docker ps
```

### Ver logs
```bash
docker logs avatar-app
```

### Acceder a la aplicación
🌐 **http://localhost:3000**

---

## 🆘 Solución de Problemas

### Si el build falla:
```bash
# Limpiar todo el sistema Docker
docker system prune -a -f --volumes

# Volver a construir sin caché
docker build -f Dockerfile.ultra -t avatar . --no-cache
```

### Si el contenedor no inicia:
```bash
# Ver logs detallados
docker logs -f avatar-app

# Reiniciar contenedor
docker restart avatar-app

# Verificar puertos
netstat -an | findstr :3000
```

### Si hay errores de permisos (Windows):
```bash
# Ejecutar PowerShell como Administrador
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 📋 Comandos de Mantenimiento

### Detener aplicación
```bash
docker stop avatar-app
```

### Eliminar contenedor
```bash
docker rm avatar-app
```

### Eliminar imagen
```bash
docker rmi avatar:latest
```

### Verificar espacio Docker
```bash
docker system df
```

---

## 🎯 Verificación Final

Después de la instalación, verifica que todo funcione:

1. ✅ **Contenedor corriendo**: `docker ps | grep avatar`
2. ✅ **Puerto disponible**: `netstat -an | findstr :3000`
3. ✅ **Aplicación responding**: Abrir http://localhost:3000
4. ✅ **Sin errores en logs**: `docker logs avatar-app`

---

**🎉 ¡Listo! Tu Avatar Conversacional debe estar funcionando perfectamente.**