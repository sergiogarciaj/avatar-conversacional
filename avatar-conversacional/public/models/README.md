# Guía para obtener tu avatar 3D de Ready Player Me

## Opción 1: Crear tu propio avatar personalizado

1. **Visita Ready Player Me**
   - Ve a https://readyplayer.me/
   - Haz clic en "Create Avatar"

2. **Personaliza tu avatar**
   - Elige género y características faciales
   - Personaliza cabello, ojos, piel, ropa
   - Usa la opción de foto para crear un avatar basado en tu rostro (opcional)

3. **Descarga el modelo**
   - Una vez satisfecho con tu avatar, copia la URL que aparece
   - La URL será algo como: `https://models.readyplayer.me/[avatar-id].glb`
   - Descarga directamente desde esa URL

4. **Instala el modelo**
   ```bash
   # Desde la raíz del proyecto
   curl -o public/models/avatar.glb https://models.readyplayer.me/[tu-avatar-id].glb
   ```

## Opción 2: Usar un avatar de ejemplo

Si solo quieres probar la aplicación rápidamente, puedes usar estos avatars de ejemplo:

```bash
# Avatar masculino ejemplo
curl -o public/models/avatar.glb https://models.readyplayer.me/6419e5d6c62ad5e0690bf1e5.glb

# Avatar femenino ejemplo
curl -o public/models/avatar.glb https://models.readyplayer.me/6419e616c62ad5e0690bf21d.glb
```

## Opción 3: Usar la integración directa (futuro)

En una futura versión, la aplicación permitirá:
- Pegar directamente la URL de Ready Player Me
- Cambiar de avatar sin reiniciar
- Guardar múltiples avatares favoritos

## Requisitos del modelo

Para que el avatar funcione correctamente con la sincronización labial, debe tener:

1. **Morph targets** (blendshapes) ARKit compatibles
   - Los avatares de Ready Player Me incluyen estos por defecto
   - Busca especialmente estos targets:
     - `jawOpen`
     - `mouthFunnel`
     - `mouthPucker`
     - `mouthSmileLeft` y `mouthSmileRight`
     - `eyeBlinkLeft` y `eyeBlinkRight`

2. **Formato GLTF/GLB**
   - El archivo debe ser `.glb` (GLTF binario)
   - Peso recomendado: < 10 MB para rendimiento óptimo

3. **Hueso de cabeza** (Head bone)
   - Para animaciones de idle (movimientos sutiles)

## Verificar que el avatar funciona

1. Después de colocar el archivo en `public/models/avatar.glb`, inicia el servidor:
   ```bash
   pnpm dev
   ```

2. Abre la consola del navegador (F12)

3. Busca mensajes relacionados con:
   - "Loading model..." - Confirma que está cargando
   - Errores de Three.js - Indica problemas con el modelo
   - "Morph targets found: [...]" - Lista los blendshapes disponibles

4. Si el avatar aparece pero no se mueve:
   - Verifica que el modelo tiene morph targets
   - Revisa que los nombres coincidan con los de ARKit
   - Consulta la sección de troubleshooting en el README

## Avatares alternativos

Si Ready Player Me no funciona para ti, puedes usar otros servicios compatibles:

- **VRoid Studio**: https://vroid.com/studio
  - Exporta como VRM, luego convierte a GLTF
  - Usa https://github.com/pixiv/three-vrm para cargar

- **Mixamo**: https://www.mixamo.com/
  - Avatares con rigging completo
  - Pueden requerir ajustes de blendshapes

- **Modelos personalizados**
  - Crea en Blender con ARKit Face Blendshapes
  - Tutorial: https://www.youtube.com/watch?v=xxx

## Troubleshooting

### El avatar no carga

```bash
# Verifica que el archivo existe
ls -lh public/models/avatar.glb

# Verifica el tamaño (debe ser > 0 bytes)
```

### Error "Failed to load model"

- Asegúrate de que la URL de descarga es correcta
- Verifica que tienes conexión a internet
- Intenta descargar manualmente y colocar el archivo

### Avatar sin boca/movimientos

- El modelo puede no tener morph targets
- Descarga un avatar diferente de Ready Player Me
- Verifica en Blender que tiene shape keys

## Recursos adicionales

- [Ready Player Me Developer Hub](https://docs.readyplayer.me/)
- [ARKit Blendshapes Reference](https://arkit-face-blendshapes.com/)
- [Three.js GLTF Loader Docs](https://threejs.org/docs/#examples/en/loaders/GLTFLoader)

---

¿Preguntas? Abre un issue en el repositorio de GitHub.
