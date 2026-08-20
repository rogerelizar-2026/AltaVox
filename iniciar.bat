@echo off
title Servidor Altavoz - Rodando
color 0A

echo ==========================================
echo   SERVIDOR ALTAVOZ
echo ==========================================
echo.
echo Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    color 0C
    echo.
    echo ERRO CRITICO: Node.js nao esta instalado!
    echo Por favor, instale o Node.js em https://nodejs.org
    echo.
    pause
    exit /b 1
)
echo Node.js encontrado!
echo.

echo Instalando/Verificando dependencias (isso pode demorar na primeira vez)...
call npm install
if errorlevel 1 (
    color 0C
    echo.
    echo ERRO: Falha ao instalar dependencias.
    pause
    exit /b 1
)
echo Dependencias OK!
echo.

echo ==========================================
echo Iniciando servidor de desenvolvimento...
echo.
echo O navegador sera aberto automaticamente!
echo MANTENHA ESTA JANELA ABERTA.
echo Para parar, pressione Ctrl+C ou feche esta janela.
echo ==========================================
echo.

REM Executa o vite via npm run dev que e a forma mais confiavel no Windows
call npm run dev

REM Se o comando acima retornar, mantem a janela aberta
if errorlevel 1 (
    echo.
    echo O servidor foi interrompido ou ocorreu um erro.
    echo Pressione qualquer tecla para fechar...
    pause >nul
)
