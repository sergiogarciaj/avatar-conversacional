# Avatar Conversacional 3D - Guía de despliegue

## Opción 1: Despliegue automático con Vercel (Recomendado)

### Prerequisitos
1. Cuenta de Vercel (gratis): https://vercel.com/signup
2. Claves API configuradas

### Pasos

1. **Inicializar Git** (si aún no está inicializado)
```bash
git init
git add .
git commit -m "Initial commit - Avatar Conversacional 3D"
```

2. **Conectar con GitHub** (opcional pero recomendado)
```bash
# Crear repositorio en GitHub
# Luego:
git remote add origin https://github.com/tu-usuario/avatar-conversacional.git
git branch -M main
git push -u origin main
```

3. **Desplegar con Vercel CLI**
```bash
# Instalar Vercel CLI globalmente (si no está instalado)
npm i -g vercel

# Login a Vercel
vercel login

# Desplegar
vercel

# Para producción
vercel --prod
```

4. **Configurar variables de entorno en Vercel**

Después del primer despliegue, ve a tu proyecto en Vercel Dashboard:
- Settings → Environment Variables
- Agrega las siguientes variables:

```
OPENAI_API_KEY=sk-...
OPENAI_REALTIME_MODEL=gpt-4o-realtime-preview
DEEPGRAM_API_KEY=...  (opcional)
AZURE_SPEECH_KEY=...  (opcional)
AZURE_SPEECH_REGION=eastus  (opcional)
NEXT_PUBLIC_MODE=A
NEXT_PUBLIC_ENABLE_LOGGING=true
```

5. **Redesplegar** después de configurar las variables
```bash
vercel --prod
```

## Opción 2: Despliegue desde GitHub (CI/CD automático)

1. **Push a GitHub**
```bash
git init
git add .
git commit -m "Avatar Conversacional 3D"
git remote add origin https://github.com/tu-usuario/avatar-conversacional.git
git push -u origin main
```

2. **Importar en Vercel**
- Ve a https://vercel.com/new
- Selecciona tu repositorio
- Vercel detectará automáticamente Next.js
- Configura las variables de entorno
- Click en "Deploy"

3. **Actualizaciones automáticas**
- Cada push a main desplegará automáticamente
- Los pull requests tendrán preview deployments

## Opción 3: Netlify

```bash
# Instalar Netlify CLI
npm i -g netlify-cli

# Login
netlify login

# Inicializar
netlify init

# Desplegar
netlify deploy --prod
```

Variables de entorno en Netlify:
- Site settings → Environment variables
- Agregar las mismas variables que Vercel

## Opción 4: Docker (Auto-hospedaje)

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

COPY . .

RUN pnpm build

ENV PORT=3000
EXPOSE 3000

CMD ["pnpm", "start"]
```

Build y run:
```bash
docker build -t avatar-conversacional .
docker run -p 3000:3000 \
  -e OPENAI_API_KEY=sk-... \
  -e DEEPGRAM_API_KEY=... \
  -e AZURE_SPEECH_KEY=... \
  -e AZURE_SPEECH_REGION=eastus \
  avatar-conversacional
```

## Verificación post-despliegue

1. **Verificar APIs**
   - Visita `https://tu-app.vercel.app/api/realtime` (GET)
   - Verifica que retorna `configured: true`

2. **Probar avatar**
   - Ve a `https://tu-app.vercel.app/avatar`
   - Click en "Conectar"
   - Permite acceso al micrófono
   - Habla y verifica transcripción

3. **Revisar logs**
   - Vercel Dashboard → Deployments → Logs
   - Busca errores de API

## Troubleshooting

### Build falla con error de Node.js
- Vercel usa Node.js 20+ por defecto
- Si falla, verifica en Project Settings → Node.js Version

### Variables de entorno no funcionan
- Asegúrate de redesplegar después de configurarlas
- Verifica que no tienen espacios al inicio/fin
- Para variables client-side, usa prefijo `NEXT_PUBLIC_`

### Error 500 en /api/realtime
- Verifica que OPENAI_API_KEY está configurada
- Revisa los logs en Vercel Dashboard
- Prueba la clave manualmente con curl

### Avatar no carga
- Asegúrate de haber subido avatar.glb a public/models/
- Verifica el tamaño (< 10 MB recomendado)
- Si Git no lo incluye, usa Git LFS o súbelo manualmente

## Monitoreo

### Métricas de Vercel
- Dashboard → Analytics
- Monitorea:
  - Request count
  - Error rate
  - Response time
  - Bandwidth usage

### Logs en tiempo real
```bash
vercel logs
vercel logs --follow
```

### Custom monitoring
Agrega logging personalizado:
```typescript
// lib/logger.ts
export function logLatency(metric: string, value: number) {
  if (process.env.NEXT_PUBLIC_ENABLE_LOGGING === 'true') {
    console.log(`[LATENCY] ${metric}: ${value}ms`);
  }
}
```

## Costos estimados

### Vercel (Hobby - Gratis)
- 100 GB bandwidth/mes
- Serverless Functions: 100 horas
- Suficiente para demos y uso personal

### OpenAI
- Realtime API: ~$0.06/min de audio (input) + ~$0.24/min (output)
- Uso típico: $3-5/hora de conversación

### Deepgram (opcional)
- Tier gratuito: $200 en créditos
- Pay as you go: $0.0043/min

### Azure Speech (opcional)
- Tier gratuito: 5 horas audio/mes
- Pay as you go: $1/hora

## Escalabilidad

Para producción con alto tráfico:
- Considera Vercel Pro ($20/mes)
- Implementa rate limiting
- Usa CDN para assets estáticos
- Considera Redis para sesiones

## Seguridad

1. **HTTPS obligatorio** (Vercel lo provee automáticamente)
2. **CORS configurado** en las APIs
3. **No exponer claves** en el frontend
4. **Rate limiting** para prevenir abuso
5. **Validación de input** en todos los endpoints

---

¿Necesitas ayuda? Revisa los logs o abre un issue en GitHub.
