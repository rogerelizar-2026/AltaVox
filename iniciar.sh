#!/bin/bash

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "============================================"
echo "  SISTEMA ALTA VOZ - INSTALAÇÃO AUTOMÁTICA"
echo "============================================"
echo ""

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo -e "${RED}[ERRO] Node.js não encontrado!${NC}"
    echo ""
    echo "Por favor, instale o Node.js antes de continuar:"
    echo "  Ubuntu/Debian: sudo apt install nodejs npm"
    echo "  macOS: brew install node"
    echo "  Ou visite: https://nodejs.org/"
    echo ""
    exit 1
fi

echo -e "${GREEN}[OK]${NC} Node.js detectado: $(node --version)"
echo ""

# Verificar se node_modules existe
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}[INFO] Instalando dependências...${NC}"
    echo "Isso pode levar alguns minutos na primeira vez."
    echo ""
    
    if npm install --loglevel=error; then
        echo ""
        echo -e "${GREEN}[OK]${NC} Dependências instaladas com sucesso!"
    else
        echo ""
        echo -e "${RED}[ERRO] Falha na instalação das dependências.${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}[OK]${NC} Dependências já estão instaladas."
fi

echo ""
echo "============================================"
echo "  INICIANDO SERVIDOR DE DESENVOLVIMENTO"
echo "============================================"
echo ""
echo "O sistema será aberto automaticamente no seu navegador."
echo "Para parar o servidor, pressione Ctrl+C neste terminal."
echo ""
echo "============================================"
echo ""

npm run dev
