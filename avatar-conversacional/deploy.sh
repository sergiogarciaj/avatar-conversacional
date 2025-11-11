#!/bin/bash

# Script de despliegue para Avatar Conversacional 3D
# Uso: ./deploy.sh [--skip-tests]

set -e

echo "=========================================="
echo "Avatar Conversacional 3D - Deployment"
echo "=========================================="
echo ""

# Colores
RED='\033[0:31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: package.json no encontrado. Ejecuta este script desde la raíz del proyecto.${NC}"
    exit 1
fi

# Verificar que Vercel CLI está instalado
if ! command -v vercel &> /dev/null; then
    echo -e "${YELLOW}Vercel CLI no encontrado. Instalando...${NC}"
    npm install -g vercel
fi

# Verificar que el usuario está logueado en Vercel
echo -e "${YELLOW}Verificando login de Vercel...${NC}"
if ! vercel whoami &> /dev/null; then
    echo -e "${YELLOW}No estás logueado en Vercel. Iniciando login...${NC}"
    vercel login
fi

# Preguntar por las claves API
echo ""
echo -e "${GREEN}Configuración de claves API${NC}"
echo "============================================"
echo ""

read -p "¿Tienes OPENAI_API_KEY? (s/n): " has_openai
if [ "$has_openai" = "s" ] || [ "$has_openai" = "S" ]; then
    read -sp "Ingresa tu OPENAI_API_KEY: " openai_key
    echo ""
    vercel env add OPENAI_API_KEY production <<< "$openai_key"
    echo -e "${GREEN}✓ OPENAI_API_KEY configurada${NC}"
else
    echo -e "${YELLOW}⚠ OPENAI_API_KEY no configurada. La app usará modo mock.${NC}"
fi

read -p "¿Tienes DEEPGRAM_API_KEY? (s/n): " has_deepgram
if [ "$has_deepgram" = "s" ] || [ "$has_deepgram" = "S" ]; then
    read -sp "Ingresa tu DEEPGRAM_API_KEY: " deepgram_key
    echo ""
    vercel env add DEEPGRAM_API_KEY production <<< "$deepgram_key"
    echo -e "${GREEN}✓ DEEPGRAM_API_KEY configurada${NC}"
fi

read -p "¿Tienes Azure Speech? (s/n): " has_azure
if [ "$has_azure" = "s" ] || [ "$has_azure" = "S" ]; then
    read -sp "Ingresa tu AZURE_SPEECH_KEY: " azure_key
    echo ""
    read -p "Ingresa tu AZURE_SPEECH_REGION (ej: eastus): " azure_region
    vercel env add AZURE_SPEECH_KEY production <<< "$azure_key"
    vercel env add AZURE_SPEECH_REGION production <<< "$azure_region"
    echo -e "${GREEN}✓ Azure Speech configurado${NC}"
fi

# Configurar otras variables
echo ""
vercel env add OPENAI_REALTIME_MODEL production <<< "gpt-4o-realtime-preview"
vercel env add NEXT_PUBLIC_MODE production <<< "A"
vercel env add NEXT_PUBLIC_ENABLE_LOGGING production <<< "true"

echo ""
echo -e "${GREEN}Configuración completada${NC}"
echo ""

# Desplegar a producción
echo -e "${YELLOW}Desplegando a producción...${NC}"
echo ""

DEPLOY_OUTPUT=$(vercel --prod --yes 2>&1)
echo "$DEPLOY_OUTPUT"

# Extraer URL de despliegue
DEPLOY_URL=$(echo "$DEPLOY_OUTPUT" | grep -oP 'https://[^ ]+' | tail -1)

if [ -z "$DEPLOY_URL" ]; then
    echo -e "${RED}Error: No se pudo obtener la URL de despliegue${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}=========================================="
echo "Despliegue exitoso!"
echo "=========================================="
echo ""
echo "URL: $DEPLOY_URL"
echo ""
echo -e "${NC}"

# Testing (opcional)
if [ "$1" != "--skip-tests" ]; then
    echo -e "${YELLOW}Realizando pruebas básicas...${NC}"
    echo ""
    
    # Test 1: Verificar que la app responde
    echo -n "Test 1: Verificando que la app está online... "
    if curl -s -o /dev/null -w "%{http_code}" "$DEPLOY_URL" | grep -q "200"; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${RED}✗${NC}"
    fi
    
    # Test 2: Verificar API de Realtime
    echo -n "Test 2: Verificando API de Realtime... "
    REALTIME_RESPONSE=$(curl -s "$DEPLOY_URL/api/realtime")
    if echo "$REALTIME_RESPONSE" | grep -q "configured"; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${RED}✗${NC}"
    fi
    
    # Test 3: Verificar API de Deepgram
    echo -n "Test 3: Verificando API de Deepgram... "
    DEEPGRAM_RESPONSE=$(curl -s "$DEPLOY_URL/api/deepgram")
    if echo "$DEEPGRAM_RESPONSE" | grep -q "configured"; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${YELLOW}⚠${NC}"
    fi
    
    # Test 4: Verificar API de Azure
    echo -n "Test 4: Verificando API de Azure Speech... "
    AZURE_RESPONSE=$(curl -s "$DEPLOY_URL/api/azure-tts")
    if echo "$AZURE_RESPONSE" | grep -q "configured"; then
        echo -e "${GREEN}✓${NC}"
    else
        echo -e "${YELLOW}⚠${NC}"
    fi
    
    echo ""
fi

# Instrucciones finales
echo -e "${GREEN}=========================================="
echo "Próximos pasos"
echo "=========================================="
echo ""
echo -e "${NC}1. Abre la aplicación: $DEPLOY_URL/avatar"
echo ""
echo "2. Testing manual:"
echo "   - Click en 'Conectar'"
echo "   - Permite acceso al micrófono"
echo "   - Habla: 'Hola, ¿cómo estás?'"
echo "   - Verifica transcripción y respuesta"
echo ""
echo "3. Para ver logs en tiempo real:"
echo "   vercel logs --follow"
echo ""
echo "4. Para ver analytics:"
echo "   https://vercel.com/dashboard"
echo ""
echo -e "${YELLOW}Nota: Si encuentras problemas, revisa DEPLOYMENT_GUIDE.md${NC}"
echo ""
