# Avatar Conversacional 3D en Tiempo Real

Una aplicación web de producción que permite conversar por voz con un asistente de IA a través de un avatar 3D con sincronización labial y gestos faciales. Optimizada para escritorio y dispositivos móviles modernos.

## Características principales

- **Conversación por voz en tiempo real** con latencia < 400ms
- **Avatar 3D con sincronización labial** usando Ready Player Me y morph targets ARKit
- **Dos modos de operación**:
  - **Modo A**: Baja latencia con OpenAI Realtime API y lip-sync heurístico
  - **Modo B**: Lip-sync profesional con Deepgram + Azure Speech TTS + visemes
- **Detección automática de turnos (VAD)** con WebAudio API
- **Barge-in support** - Interrumpe al asistente hablando
- **Subtítulos en vivo** y transcripción completa
- **Accesibilidad** con controles de velocidad, volumen y sensibilidad

## Tecnologías

- **Frontend**: Next.js 14, TypeScript, React 18, TailwindCSS
- **3D**: React Three Fiber, drei, Three.js
- **Avatar**: Ready Player Me (GLTF/GLB con morph targets)
- **Audio**: WebRTC, WebAudio API
- **IA/Voz**:
  - OpenAI Realtime API (conversación)
  - Deepgram Live (STT en Modo B)
  - Azure Speech TTS (TTS con visemes en Modo B)
- **State**: Zustand

## Instalación

### Requisitos previos

- Node.js 18+ (recomendado 20+)
- pnpm 8+
- Claves API (opcional, funciona en modo mock sin ellas):
  - OpenAI API Key
  - Deepgram API Key (solo Modo B)
  - Azure Speech Services Key y Region (solo Modo B)

### Pasos

1. **Clonar el repositorio**

```bash
git clone <tu-repo>
cd avatar-conversacional
```

2. **Instalar dependencias**

```bash
pnpm install
```

3. **Configurar variables de entorno**

Copia el archivo de ejemplo y configura tus claves:

```bash
cp .env.example .env.local
```

Edita `.env.local`:

```env
# OpenAI Realtime API (obligatorio para Modo A)
OPENAI_API_KEY=tu_clave_aqui
OPENAI_REALTIME_MODEL=gpt-4o-realtime-preview

# Deepgram (solo para Modo B - STT)
DEEPGRAM_API_KEY=tu_clave_aqui

# Azure Speech (solo para Modo B - TTS con visemes)
AZURE_SPEECH_KEY=tu_clave_aqui
AZURE_SPEECH_REGION=tu_region_aqui  # ej: eastus

# Configuración (opcional)
NEXT_PUBLIC_MODE=A  # A o B
NEXT_PUBLIC_ENABLE_LOGGING=true
```

4. **Descargar avatar 3D**

Descarga un avatar de Ready Player Me y colócalo en `public/models/avatar.glb`:

```bash
# Opción 1: Crear tu propio avatar
# Visita https://readyplayer.me/ y crea un avatar
# Descarga el archivo .glb

# Opción 2: Usar avatar de ejemplo
# Descarga desde: https://models.readyplayer.me/[avatar-id].glb
# Guárdalo como public/models/avatar.glb
```

Si no tienes un avatar, la aplicación mostrará un error en la consola pero seguirá funcionando en otros aspectos.

5. **Ejecutar en desarrollo**

```bash
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### 🐳 Ejecución con Docker (Windows)

Si prefieres usar Docker en Windows, puedes ejecutar la aplicación de forma aislada y con todos los requisitos preconfigurados.

#### Requisitos

1. **Docker Desktop** para Windows
   - Descarga: https://www.docker.com/products/docker-desktop/
   - Asegúrate de que esté corriendo

#### Uso Rápido

**Opción 1: Script de PowerShell (Recomendado)**
```powershell
# Ejecutar en modo producción
.\start-avatar-docker.ps1

# Ejecutar en modo desarrollo
.\start-avatar-docker.ps1 -Dev

# Detener contenedores
.\start-avatar-docker.ps1 -Stop

# Ver logs
.\start-avatar-docker.ps1 -Logs
```

**Opción 2: Script Batch (CMD/Git Bash)**
```cmd
REM Modo producción
start-avatar-docker.bat

REM Modo desarrollo
start-avatar-docker.bat dev

REM Detener
start-avatar-docker.bat stop

REM Ver logs
start-avatar-docker.bat logs
```

**Opción 3: Comandos Directos**
```bash
# Modo producción
docker-compose up -d --build

# Modo desarrollo (con hot-reload)
docker-compose up -d --build avatar-dev

# Detener
docker-compose down

# Ver logs
docker-compose logs -f
```

#### URLs de Acceso

- **Producción**: http://localhost:3000
- **Desarrollo**: http://localhost:3000 (con hot-reload)

#### Comandos Útiles

```bash
# Ver estado de contenedores
docker-compose ps

# Ver logs en tiempo real
docker-compose logs -f --tail=50

# Parar contenedores
docker-compose down

# Rebuild completo
docker-compose build --no-cache
```

#### Solución de Problemas

**Puerto ocupado:**
```bash
# Ver qué usa el puerto 3000
netstat -ano | findstr :3000

# Usar otro puerto
docker-compose up -d -p 3001:3000
```

**Ver documentación completa:** [DOCKER_WINDOWS.md](./DOCKER_WINDOWS.md)

## Uso

### Modo A - Baja latencia (OpenAI Realtime)

1. Navega a `/avatar`
2. Asegúrate de que "Modo A" esté seleccionado
3. Haz clic en "Conectar"
4. Permite acceso al micrófono
5. Habla naturalmente - el sistema detectará tu voz automáticamente
6. El avatar responderá con sincronización labial aproximada basada en energía de audio

**Características del Modo A**:
- Latencia ultra-baja (< 250ms)
- Conexión WebRTC directa con OpenAI
- Lip-sync heurístico (jawOpen, mouthFunnel, mouthPucker)
- Ideal para conversaciones fluidas

### Modo B - Lip-sync profesional

1. Navega a `/settings` y selecciona "Modo B"
2. Regresa a `/avatar` y haz clic en "Conectar"
3. El sistema usará:
   - Deepgram para transcripción (STT)
   - OpenAI para generación de respuesta (LLM)
   - Azure Speech para síntesis con visemes (TTS)
4. La sincronización labial será precisa frame-by-frame

**Características del Modo B**:
- Lip-sync preciso con visemes Azure/ARKit
- Mapeo completo de visemes a blendshapes
- Mayor latencia (~400-600ms) pero mejor calidad visual
- Ideal para demos, presentaciones, tutoriales

### Controles

- **Conectar/Desconectar**: Inicia o termina la sesión
- **Silenciar**: Desactiva tu micrófono temporalmente
- **Push to Talk**: Mantén presionada la barra espaciadora para hablar
- **Selector de voz**: Elige entre 6 voces de OpenAI
- **Sensibilidad VAD**: Ajusta qué tan sensible es la detección de voz

## Arquitectura

### Estructura del proyecto

```
avatar-conversacional/
├── app/
│   ├── api/
│   │   ├── realtime/route.ts      # Endpoint para OpenAI Realtime
│   │   ├── deepgram/route.ts      # Proxy para Deepgram STT
│   │   └── azure-tts/route.ts     # Azure TTS con visemes
│   ├── avatar/page.tsx             # Página principal de conversación
│   ├── settings/page.tsx           # Configuración
│   └── page.tsx                    # Landing page
├── components/
│   ├── AvatarCanvas.tsx            # Avatar 3D con React Three Fiber
│   ├── Controls.tsx                # UI de controles
│   └── Captions.tsx                # Subtítulos y transcripción
├── lib/
│   ├── state.ts                    # Zustand store
│   ├── audio.ts                    # Captura de micrófono y VAD
│   ├── webrtc.ts                   # Cliente WebRTC para Realtime API
│   ├── viseme-mapper.ts            # Mapeo viseme→ARKit blendshapes
│   └── lip-sync-energy.ts          # Lip-sync heurístico (Modo A)
└── public/
    └── models/
        └── avatar.glb              # Modelo 3D del avatar
```

### Flujo de datos

#### Modo A (Baja latencia)

```
Usuario (micrófono)
  ↓
AudioCapture (VAD)
  ↓
OpenAI Realtime API (WebRTC)
  ↓ (audio + transcripción)
LipSyncEnergy (análisis de energía)
  ↓
AvatarCanvas (morph targets)
```

#### Modo B (Lip-sync Pro)

```
Usuario (micrófono)
  ↓
AudioCapture (VAD)
  ↓
Deepgram Live (STT WebSocket)
  ↓ (transcripción)
OpenAI API (LLM)
  ↓ (texto respuesta)
Azure Speech TTS (con visemes)
  ↓ (audio + visemes)
VisemeMapper
  ↓ (ARKit blendshapes)
AvatarCanvas (morph targets)
```

### Componentes clave

#### AudioCapture

- Captura audio del micrófono con WebAudio API
- Implementa VAD (Voice Activity Detection) con AnalyserNode
- Configuración de echo cancellation, noise suppression
- Eventos: `onSpeechStart`, `onSpeechEnd`, `onAudioLevel`

#### OpenAIRealtimeClient

- Conexión WebRTC con OpenAI Realtime API
- Manejo de data channels para eventos
- Streaming de audio bidireccional
- Soporte para barge-in (interrupciones)

#### VisemeMapper

- Mapeo de visemes Azure (0-21 + sil) a blendshapes ARKit
- Interpolación suave entre estados
- Smoothing temporal para evitar jitter

#### LipSyncEnergy

- Análisis de energía RMS y crest factor
- Heurística para calcular jawOpen, mouthFunnel, mouthPucker
- Attack/release configurable (30ms/80ms)

## Métricas de latencia

### Objetivo (Modo A)

- **Captura → Transcripción parcial**: ≤ 250ms
- **Audio de respuesta streaming**: < 400ms tras fin de turno
- **Latencia total E2E**: < 600ms

### Medición

Activa logging con `NEXT_PUBLIC_ENABLE_LOGGING=true` en `.env.local`. Las métricas aparecerán en la UI de subtítulos.

## Despliegue

### Vercel (recomendado)

1. Push tu código a GitHub
2. Importa el proyecto en Vercel
3. Configura variables de entorno en Vercel:
   - `OPENAI_API_KEY`
   - `DEEPGRAM_API_KEY` (opcional)
   - `AZURE_SPEECH_KEY` (opcional)
   - `AZURE_SPEECH_REGION` (opcional)
4. Deploy

```bash
pnpm build
vercel --prod
```

### Otros proveedores

El proyecto es compatible con cualquier proveedor que soporte Next.js:
- Netlify
- Railway
- Render
- Cloudflare Pages

### TURN Server (opcional)

Para redes con NAT/CGNAT restrictivo, configura un servidor TURN:

```bash
# Usando coturn con Docker
docker run -d --network=host \
  -e DETECT_EXTERNAL_IP=yes \
  coturn/coturn \
  -n --log-file=stdout \
  --min-port=49152 --max-port=65535 \
  --lt-cred-mech \
  --user=usuario:contraseña \
  --realm=tu-dominio.com
```

Luego configura en `.env.local`:

```env
TURN_URI=turn:tu-servidor.com:3478
TURN_USER=usuario
TURN_PASS=contraseña
```

## Tests

### Tests manuales

1. **Test de conexión**
   - [ ] El botón "Conectar" solicita permisos de micrófono
   - [ ] La conexión se establece en < 3 segundos
   - [ ] El indicador de estado muestra "Conectado"

2. **Test de VAD**
   - [ ] El nivel de audio responde a tu voz
   - [ ] La detección de habla inicia/termina correctamente
   - [ ] No hay falsos positivos con ruido de fondo moderado

3. **Test de conversación**
   - [ ] La transcripción aparece en subtítulos en vivo
   - [ ] El asistente responde en < 1 segundo
   - [ ] El audio del asistente se reproduce claramente

4. **Test de lip-sync**
   - **Modo A**: Los labios se mueven sincronizados con la energía del audio
   - **Modo B**: Los labios forman visemes específicos para cada fonema

5. **Test de barge-in**
   - [ ] Hablar mientras el asistente habla lo interrumpe
   - [ ] El audio del asistente se detiene inmediatamente
   - [ ] El sistema está listo para recibir tu entrada

6. **Test de accesibilidad**
   - [ ] Los subtítulos son legibles y precisos
   - [ ] Los controles funcionan con teclado (Tab, Enter, Espacio)
   - [ ] Funciona en modo de alto contraste

### Script de medición de latencia

```typescript
// En lib/latency-logger.ts
export class LatencyLogger {
  private timestamps: { [key: string]: number } = {};

  mark(event: string) {
    this.timestamps[event] = performance.now();
  }

  measure(from: string, to: string): number {
    return this.timestamps[to] - this.timestamps[from];
  }

  report() {
    console.table({
      'Captura → STT': this.measure('capture', 'transcription'),
      'STT → LLM': this.measure('transcription', 'llm_response'),
      'LLM → TTS': this.measure('llm_response', 'audio_start'),
      'Total E2E': this.measure('capture', 'audio_start'),
    });
  }
}
```

## Troubleshooting

### El micrófono no funciona

- **Chrome/Edge**: Asegúrate de usar HTTPS (o localhost)
- **Safari**: Verifica permisos en Preferencias del Sistema
- **Firefox**: Revisa `about:permissions` para el sitio

### Audio entrecortado o con eco

- Activa echo cancellation en `lib/audio.ts`
- Usa auriculares en lugar de altavoces
- Reduce la sensibilidad VAD en Settings

### El avatar no aparece

- Verifica que `public/models/avatar.glb` existe
- Asegúrate de que el modelo tiene morph targets
- Revisa la consola del navegador para errores de Three.js

### Alta latencia

- **Modo A**: Verifica tu conexión a internet (ping a api.openai.com)
- **Modo B**: Considera cambiar a Modo A si no necesitas lip-sync preciso
- Configura un servidor TURN más cercano geográficamente

### Error "API Key not configured"

- Copia `.env.example` a `.env.local`
- Configura las claves API necesarias
- Reinicia el servidor de desarrollo (`pnpm dev`)

## Modo Mock (sin APIs)

Si no tienes claves API, la aplicación funciona en modo mock:

- **Realtime API**: Respuestas simuladas tras 2 segundos
- **Transcripción**: Texto hardcodeado
- **TTS**: Sin audio real, pero visemes generados
- **Lip-sync**: Movimientos aleatorios del avatar

Esto es útil para:
- Desarrollo de UI sin consumir créditos
- Testing de la lógica de sincronización
- Demos sin conexión

## Limitaciones conocidas

- **Safari iOS**: WebRTC puede requerir interacción del usuario para iniciar
- **Modo B**: Latencia mayor (400-600ms) vs Modo A (< 250ms)
- **Avatar personalizado**: Requiere descarga manual de Ready Player Me
- **Idiomas**: Optimizado para español, pero soporta otros idiomas configurando la voz

## Extras opcionales (roadmap)

- [ ] Selector de avatar desde URL de Ready Player Me
- [ ] Análisis de sentimiento para expresiones faciales
- [ ] Editor de system prompt en UI
- [ ] Exportar conversación como SRT/VTT
- [ ] Soporte para múltiples idiomas con detección automática
- [ ] Modo oscuro mejorado
- [ ] Animaciones de idle más complejas (respiración, micro-gestos)

## Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

MIT License - ver el archivo LICENSE para más detalles.

## Agradecimientos

- [OpenAI](https://openai.com/) por la Realtime API
- [Ready Player Me](https://readyplayer.me/) por los avatares
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/) por el rendering 3D
- [Deepgram](https://deepgram.com/) por el STT de baja latencia
- [Microsoft Azure](https://azure.microsoft.com/es-es/services/cognitive-services/speech-services/) por los servicios de voz

## Soporte

Para preguntas o issues, abre un issue en GitHub o contacta al maintainer.

---

Hecho con ❤️ usando Next.js, React Three Fiber y OpenAI Realtime API
