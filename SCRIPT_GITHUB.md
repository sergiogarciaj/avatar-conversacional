# 📤 Script de ayuda para subir archivos a GitHub

## 🎯 Script Bash (para usuarios avanzados)

Si tienes Git instalado en tu computadora, puedes usar este script:

```bash
#!/bin/bash
echo "🚀 Subiendo Avatar Conversacional a GitHub..."

# Inicializar repositorio git
git init
git add .
git commit -m "🚀 Initial commit: Avatar Conversacional"

# Agregar repositorio remoto (cambia TU-USUARIO por tu usuario de GitHub)
git remote add origin https://github.com/TU-USUARIO/avatar-conversacional.git

# Hacer push
git branch -M main
git push -u origin main

echo "✅ ¡Proyecto subido exitosamente!"
echo "🌐 Ahora ve a Vercel para desplegar: https://vercel.com"
```

## 📋 Lista de archivos para subir manualmente

Si prefieres subir manualmente, asegúrate de incluir TODOS estos archivos:

### ✅ Archivos raíz obligatorios:
- `package.json`
- `package-lock.json` (o `pnpm-lock.yaml`)
- `next.config.js`
- `tailwind.config.js`
- `tsconfig.json`
- `.gitignore`

### ✅ Carpetas obligatorias:
- `src/` (completa con todas las subcarpetas)
- `public/` (completa con todos los archivos)

### ✅ Archivos adicionales útiles:
- `Dockerfile` (para referencia)
- `docker-compose.yml` (para referencia)
- Cualquier archivo de configuración adicional

## 🔍 Verificación de archivos

Antes de subir, verifica que tu carpeta de proyecto tenga:
```
avatar-conversacional/
├── src/
│   ├── components/
│   ├── pages/
│   ├── styles/
│   └── ...
├── public/
│   ├── assets/
│   └── ...
├── package.json
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── .gitignore
```

## ⚠️ Archivos que NO subir:

❌ `node_modules/` (se recrea automáticamente)
❌ `.next/` (se genera durante build)
❌ Archivos con secretos/API keys
❌ Archivos temporales del sistema

## 🎉 ¡Después de subir!

1. Verifica en GitHub que todos los archivos aparezcan
2. Ve a https://vercel.com
3. Importa tu repositorio
4. ¡Obtén tu URL pública!