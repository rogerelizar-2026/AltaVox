@echo off
chcp 65001 >nul
title Instalacao e Inicializacao do AltaVoz

echo ============================================
echo   SISTEMA ALTA VOZ - INSTALACAO AUTOMATICA
echo ============================================
echo.

REM Verificar se Node.js esta instalado
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERRO] Node.js nao encontrado!
    echo.
    echo Por favor, instale o Node.js antes de continuar:
    echo https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js detectado: 
node --version
echo.

REM Verificar se node_modules existe
if not exist "node_modules" (
    echo [INFO] Instalando dependencias...
    echo Isso pode levar alguns minutos na primeira vez.
    echo.
    call npm install --loglevel=error
    if %errorlevel% neq 0 (
        echo.
        echo [ERRO] Falha na instalacao das dependencias.
        pause
        exit /b 1
    )
    echo.
    echo [OK] Dependencias instaladas com sucesso!
) else (
    echo [OK] Dependencias ja estao instaladas.
)

echo.
echo ============================================
echo   INICIANDO SERVIDOR DE DESENVOLVIMENTO
echo ============================================
echo.
echo O sistema sera aberto automaticamente no seu navegador.
echo Para parar o servidor, pressione Ctrl+C nesta janela.
echo.
echo ============================================
echo.

call npm run dev

pause
