# 🚀 Guía Completa: GitHub + Vercel para Avatar Conversacional

## ✅ Paso 1: Preparar GitHub

### 1.1 Crear cuenta en GitHub (si no tienes)
- Ve a https://github.com
- Haz clic en "Sign up"
- Completa el registro con tu email

### 1.2 Crear nuevo repositorio
- Haz clic en el botón verde "New" o "+" → "New repository"
- Nombre del repositorio: `avatar-conversacional`
- Descripción: `Avatar 3D conversacional con IA`
- Selecciona "Public" (necesario para Vercel gratuito)
- ✅ Marca "Add a README file"
- Haz clic en "Create repository"

## ✅ Paso 2: Subir archivos del proyecto

### 2.1 Opción A: Subir archivos manualmente (Más fácil)
1. En tu nuevo repositorio, haz clic en "uploading an existing file"
2. **IMPORTANTE**: Primero arrastra TODOS los archivos de tu proyecto:
   - package.json
   - package-lock.json  
   - next.config.js
   - tailwind.config.js
   - tsconfig.json
   - .gitignore
   - La carpeta `src/` completa
   - La carpeta `public/` completa
   - Todos los archivos .tsx, .ts, .css
   - El Dockerfile (si lo quieres)

3. En el mensaje del commit escribe: "Subir proyecto Avatar Conversacional"
4. Haz clic en "Commit changes"

### 2.2 Verificar que se subieron correctamente
- Tu repositorio debe mostrar todas las carpetas y archivos
- Verifica que aparezca la estructura: src/, public/, package.json, etc.

## ✅ Paso 3: Conectar con Vercel

### 3.1 Crear cuenta en Vercel
- Ve a https://vercel.com
- Haz clic en "Sign Up"
- **IMPORTANTE**: Usa la misma cuenta de GitHub (es más fácil)
- Autoriza a Vercel a acceder a tu GitHub

### 3.2 Importar proyecto
1. En el dashboard de Vercel, haz clic en "New Project"
2. Busca tu repositorio `avatar-conversacional`
3. Haz clic en "Import"

### 3.3 Configurar deployment
Vercel detectará automáticamente que es un proyecto Next.js. Verifica:

**Configuración de Build:**
- Framework Preset: `Next.js`
- Build Command: `npm run build` (automático)
- Output Directory: `.next` (automático)
- Install Command: `npm install` (automático)

**Variables de entorno (opcional):**
Si tu proyecto usa variables de entorno (como API keys), agrégalas aquí.
Pero para comenzar, déjalo vacío.

4. Haz clic en "Deploy"

## ✅ Paso 4: Esperar y obtener URL

### 4.1 Proceso de deploy
- Vercel construirá tu proyecto (2-3 minutos)
- Verás el progreso en tiempo real
- Una vez terminado, obtendrás una URL como:
  `https://avatar-conversacional-xyz.vercel.app`

### 4.2 URL pública
Tu proyecto estará disponible públicamente 24/7 en esa URL.

## ✅ Paso 5: Acceder y probar

### 5.1 Abrir tu proyecto
- Haz clic en la URL que te dio Vercel
- Debería cargar tu Avatar Conversacional

### 5.2 Si hay errores
- Vercel muestra logs de error
- Puedes hacer click en "Functions" para ver los errores
- Los errores más comunes:
  - Variables de entorno faltantes
  - Errores de importación
  - Problemas de build

## 🔄 Actualizaciones futuras

**Para actualizar tu proyecto:**
1. Modifica archivos en GitHub (subiendo nuevos archivos)
2. Vercel redesplegará automáticamente
3. La URL stays sama

## 📋 Resumen de URLs
- **GitHub**: `https://github.com/TU-USUARIO/avatar-conversacional`
- **Vercel**: `https://avatar-conversacional-xyz.vercel.app`

## ⚡ Ventajas de este método
- ✅ URL pública 24/7
- ✅ HTTPS automático
- ✅ Actualizaciones automáticas
- ✅ Gratis para proyectos personales
- ✅ Excelente performance
- ✅ No necesitas servidor propio

## 🚨 Notas importantes
- El repositorio debe ser "Public" para el plan gratuito
- Vercel tiene límites de bandwidth pero suficientes para desarrollo
- Las variables de entorno son seguras (Vercel las cifra)