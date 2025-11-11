#!/bin/bash

# Script de Integración con GitHub - Avatar Conversacional 3D
# Este script automatiza el proceso de conexión y subida a GitHub

set -e  # Salir si cualquier comando falla

echo "🚀 Integrando Avatar Conversacional 3D con GitHub"
echo "=================================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: No se encontró package.json. Ejecuta desde el directorio del proyecto.${NC}"
    exit 1
fi

echo -e "${BLUE}📁 Verificando configuración del repositorio...${NC}"
git status

echo -e "\n${BLUE}🔧 Configuración inicial...${NC}"

# Verificar si remote ya existe
if git remote get-url origin &> /dev/null; then
    echo -e "${YELLOW}⚠️  Remote 'origin' ya existe.${NC}"
    echo "URL actual:"
    git remote get-url origin
    echo ""
    read -p "¿Deseas actualizar el remote? (s/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        read -p "Ingresa la URL del nuevo repositorio: " new_url
        git remote set-url origin "$new_url"
        echo -e "${GREEN}✅ Remote actualizado${NC}"
    else
        echo -e "${YELLOW}⏭️  Saltando configuración del remote${NC}"
    fi
else
    echo -e "${BLUE}🌐 Configurando remote origin...${NC}"
    read -p "Ingresa la URL del repositorio de GitHub (ej: https://github.com/usuario/repo): " repo_url
    
    if [ -z "$repo_url" ]; then
        echo -e "${RED}❌ URL requerida. Para crear un repositorio: https://github.com/new${NC}"
        exit 1
    fi
    
    git remote add origin "$repo_url"
    echo -e "${GREEN}✅ Remote origin configurado${NC}"
fi

echo -e "\n${BLUE}📊 Estado actual del repositorio:${NC}"
git log --oneline -3

echo -e "\n${BLUE}📋 Archivos principales:${NC}"
ls -la

echo -e "\n${YELLOW}🎯 Próximos pasos automáticos:${NC}"
echo "1. Verificar configuraciones"
echo "2. Preparar .gitignore"
echo "3. Crear documentación adicional"
echo "4. Mostrar comandos finales"

# Verificar .gitignore
echo -e "\n${BLUE}🔍 Verificando .gitignore...${NC}"
if [ -f ".gitignore" ]; then
    echo -e "${GREEN}✅ .gitignore encontrado${NC}"
    head -10 .gitignore
else
    echo -e "${YELLOW}⚠️  No se encontró .gitignore${NC}"
fi

# Crear .github/workflows para CI/CD
echo -e "\n${BLUE}🔧 Configurando CI/CD...${NC}"
mkdir -p .github/workflows

cat > .github/workflows/ci.yml << 'EOF'
name: CI/CD Pipeline

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'pnpm'
    
    - name: Install pnpm
      uses: pnpm/action-setup@v2
      with:
        version: 8
    
    - name: Install dependencies
      run: pnpm install
    
    - name: Type check
      run: pnpm type-check
    
    - name: Lint
      run: pnpm lint
    
    - name: Build
      run: pnpm build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main' || github.ref == 'refs/heads/master'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to Vercel
      uses: vercel/action@v1
      with:
        vercel-token: ${{ secrets.VERCEL_TOKEN }}
        vercel-org-id: ${{ secrets.ORG_ID }}
        vercel-project-id: ${{ secrets.PROJECT_ID }}
EOF

echo -e "${GREEN}✅ Pipeline de CI/CD configurado${NC}"

# Verificar package.json para scripts
echo -e "\n${BLUE}📦 Scripts disponibles en package.json:${NC}"
if [ -f "package.json" ]; then
    grep -A 5 '"scripts"' package.json || echo "No se encontraron scripts"
fi

echo -e "\n${GREEN}🎉 ¡Configuración completada!${NC}"

echo -e "\n${BLUE}📋 Para finalizar la integración:${NC}"
echo "1. Asegúrate de que el repositorio existe en GitHub:"
echo "   https://github.com/new"
echo ""
echo "2. Sube el código (SIEMPRE haz un backup antes):"
echo "   git push -u origin master"
echo ""
echo "3. Configura variables de entorno en el hosting:"
echo "   - Vercel (recomendado)"
echo "   - Netlify"
echo "   - GitHub Pages"
echo ""
echo "4. Para desarrollo local:"
echo "   git clone <tu-repo>"
echo "   cd avatar-conversacional"
echo "   pnpm install"
echo "   pnpm dev"

echo -e "\n${YELLOW}💡 Tips adicionales:${NC}"
echo "- Configura protection rules para la rama main"
echo "- Habilita GitHub Actions para testing automático"
echo "- Crea releases con tags para versiones estables"
echo "- Configura Renovate para actualizaciones automáticas"

echo -e "\n${GREEN}✨ ¡Tu avatar conversacional 3D está listo para GitHub!${NC}"
