# 🛠️ SOLUCIÓN: Error de PowerShell - "File is not digitally signed"

## 🔥 SOLUCIÓN 1: Cambiar Política de Ejecución (Recomendado)

### Abrir PowerShell como **Administrador** y ejecutar:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

**Explicación**: Esto permite ejecutar scripts de PowerShell para el usuario actual sin certificado digital.

### Verificar que se aplicó:
```powershell
Get-ExecutionPolicy
```

### Ahora sí, ejecutar el script:
```powershell
.\start-avatar-docker.ps1
```

---

## ⚡ SOLUCIÓN 2: Ejecutar Sin Restricciones (Temporal)

```powershell
PowerShell -ExecutionPolicy Bypass -File start-avatar-docker.ps1
```

---

## 🔧 SOLUCIÓN 3: Usar Método Batch (Más Simple)

Si no quieres cambiar políticas, usa el **método Batch**:

```cmd
start-avatar-docker.bat
```

---

## 📝 ¿Por qué pasa esto?

Windows por defecto tiene políticas de seguridad estrictas para evitar scripts maliciosos. Nuestros scripts son seguros, pero Windows no lo sabe.

## 🎯 Recomendación

1. **Si es tu computadora personal**: Usa la **Solución 1**
2. **Si estás en una red corporativa**: Usa la **Solución 2** o **Solución 3**
3. **Para máxima simplicidad**: **Solución 3** (Batch)

---

## ⚠️ Importante

- **NUNCA** ejecutes scripts de orígenes desconocidos
- Nuestros scripts son 100% seguros y de código abierto
- La política RemoteSigned es segura para uso personal

---

## 🚀 Una vez resuelto, el script:
- ✅ Detendrá contenedores existentes
- ✅ Limpiará el sistema Docker
- ✅ Construirá la imagen
- ✅ Iniciará tu aplicación
- ✅ Te dará la URL: http://localhost:3000