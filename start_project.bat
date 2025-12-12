@echo off
cd /d "%~dp0"
TITLE NetSecure Sim - UNIFIED LAUNCHER
CLS

ECHO ===================================================
ECHO    NetSecure Sim - INICIANDO TODO EN UNA VENTANA
ECHO ===================================================
ECHO.

ECHO [1/2] Verificando Docker...
docker-compose --version >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    ECHO [ERROR] Docker no encontrado. Por favor instalalo.
    PAUSE
    EXIT /B
)

ECHO [2/2] Iniciando Base de Datos...
cd backend
docker-compose up -d
cd ..
ECHO.

ECHO ---------------------------------------------------
ECHO  AVISO: Se iniciaran Backend (.NET) y Frontend (React)
ECHO  en ESTA MISMA VENTANA. 
ECHO  Si cierras esta ventana, se cierra todo.
ECHO ---------------------------------------------------
ECHO.
ECHO Iniciando...
ECHO.

:: Ejecutar el script unificado
npm start

PAUSE
