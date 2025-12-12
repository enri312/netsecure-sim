# Script para iniciar todo el proyecto NetSecure Sim

Write-Host "🚀 Iniciando NetSecure Sim..." -ForegroundColor Green

# 1. Iniciar Base de Datos (Docker)
Write-Host "📦 1. Levantando Base de Datos (PostgreSQL)..." -ForegroundColor Cyan
Set-Location "./backend"
docker-compose up -d
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Error al iniciar Docker. Asegúrate de que Docker Desktop esté corriendo." -ForegroundColor Red
    Pause
    Exit
}
Write-Host "✅ Base de datos iniciada." -ForegroundColor Green

# Esperar unos segundos para que la DB esté lista
Start-Sleep -Seconds 3

# 2. Iniciar Backend (.NET)
Write-Host "⚙️ 2. Iniciando Backend (.NET)..." -ForegroundColor Cyan
$backendPath = Join-Path (Get-Location) "NetSecure.Api"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; dotnet run"
Write-Host "✅ Backend iniciado en nueva ventana." -ForegroundColor Green

# 3. Iniciar Frontend (React/Electron)
Write-Host "💻 3. Iniciando Frontend..." -ForegroundColor Cyan
Set-Location "../../Frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "npm run dev"
Write-Host "✅ Frontend iniciado en nueva ventana." -ForegroundColor Green

Write-Host "✨ ¡Todo listo! Espera a que el Backend cargue y luego abre la aplicación." -ForegroundColor Yellow
Write-Host "Presiona cualquier tecla para salir..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
