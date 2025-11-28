# Script de Instalación Automática - Monitor UV y AQI
# Windows PowerShell

Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "  Monitor UV y AQI - Encarnación" -ForegroundColor Cyan
Write-Host "  Script de Instalación Automática" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Verificar Node.js
Write-Host "Verificando Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✓ Node.js encontrado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Node.js no encontrado" -ForegroundColor Red
    Write-Host "Por favor instala Node.js desde: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Verificar MySQL
Write-Host "Verificando MySQL..." -ForegroundColor Yellow
try {
    $mysqlVersion = mysql --version
    Write-Host "✓ MySQL encontrado" -ForegroundColor Green
} catch {
    Write-Host "⚠ MySQL no encontrado en PATH" -ForegroundColor Yellow
    Write-Host "Asegúrate de tener MySQL instalado y configurado" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "  CONFIGURACIÓN DEL BACKEND" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Navegar a backend
Set-Location backend

# Instalar dependencias del backend
Write-Host "Instalando dependencias del backend..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Error al instalar dependencias del backend" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Dependencias del backend instaladas" -ForegroundColor Green

# Crear archivo .env si no existe
if (-Not (Test-Path .env)) {
    Write-Host ""
    Write-Host "Creando archivo de configuración .env..." -ForegroundColor Yellow
    Copy-Item .env.example .env
    
    # Solicitar configuración
    Write-Host ""
    Write-Host "Ingresa la configuración de MySQL:" -ForegroundColor Cyan
    $dbPassword = Read-Host "Password de MySQL"
    $dbName = Read-Host "Nombre de la base de datos (default: aqi_uv_db)"
    if ([string]::IsNullOrWhiteSpace($dbName)) {
        $dbName = "aqi_uv_db"
    }
    
    # Actualizar .env
    $envContent = Get-Content .env -Raw
    $envContent = $envContent -replace 'DB_PASSWORD=your_password', "DB_PASSWORD=$dbPassword"
    $envContent = $envContent -replace 'DB_NAME=aqi_uv_db', "DB_NAME=$dbName"
    $envContent | Set-Content .env
    
    Write-Host "✓ Archivo .env creado" -ForegroundColor Green
} else {
    Write-Host "⚠ Archivo .env ya existe, saltando configuración" -ForegroundColor Yellow
}

# Crear base de datos
Write-Host ""
$createDB = Read-Host "¿Deseas crear la base de datos automáticamente? (s/n)"
if ($createDB -eq 's' -or $createDB -eq 'S') {
    Write-Host "Creando base de datos..." -ForegroundColor Yellow
    $dbPassword = Read-Host "Password de MySQL root"
    $dbName = "aqi_uv_db"
    
    $sqlCommand = "CREATE DATABASE IF NOT EXISTS $dbName CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
    echo $sqlCommand | mysql -u root -p$dbPassword
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Base de datos creada" -ForegroundColor Green
    } else {
        Write-Host "⚠ Error al crear base de datos (puede que ya exista)" -ForegroundColor Yellow
    }
}

# Ejecutar migraciones
Write-Host ""
$runMigrations = Read-Host "¿Deseas ejecutar las migraciones? (s/n)"
if ($runMigrations -eq 's' -or $runMigrations -eq 'S') {
    Write-Host "Ejecutando migraciones..." -ForegroundColor Yellow
    npm run migrate
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Migraciones ejecutadas" -ForegroundColor Green
    } else {
        Write-Host "✗ Error al ejecutar migraciones" -ForegroundColor Red
    }
}

# Cargar datos de ejemplo
Write-Host ""
$runSeed = Read-Host "¿Deseas cargar datos de ejemplo? (s/n)"
if ($runSeed -eq 's' -or $runSeed -eq 'S') {
    Write-Host "Cargando datos de ejemplo..." -ForegroundColor Yellow
    npm run seed
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Datos de ejemplo cargados" -ForegroundColor Green
        Write-Host ""
        Write-Host "Credenciales de acceso:" -ForegroundColor Cyan
        Write-Host "  Admin: admin@encarnacion.com / admin123" -ForegroundColor White
        Write-Host "  User:  user@encarnacion.com / user123" -ForegroundColor White
    } else {
        Write-Host "✗ Error al cargar datos de ejemplo" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "  CONFIGURACIÓN DEL FRONTEND" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Navegar a mobile
Set-Location ..\mobile

# Instalar dependencias del frontend
Write-Host "Instalando dependencias del frontend..." -ForegroundColor Yellow
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Error al instalar dependencias del frontend" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Dependencias del frontend instaladas" -ForegroundColor Green

# Obtener IP local
Write-Host ""
Write-Host "Detectando IP local..." -ForegroundColor Yellow
$ipAddress = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -notlike "*Loopback*" -and $_.InterfaceAlias -notlike "*Bluetooth*"} | Select-Object -First 1).IPAddress

if ($ipAddress) {
    Write-Host "✓ IP local detectada: $ipAddress" -ForegroundColor Green
    Write-Host ""
    Write-Host "Para usar en dispositivo móvil físico, actualiza app.json:" -ForegroundColor Cyan
    Write-Host "  apiUrl: http://${ipAddress}:3000/api" -ForegroundColor White
} else {
    Write-Host "⚠ No se pudo detectar IP local automáticamente" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "  INSTALACIÓN COMPLETADA" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Para iniciar el sistema:" -ForegroundColor Green
Write-Host ""
Write-Host "Backend:" -ForegroundColor Yellow
Write-Host "  cd backend" -ForegroundColor White
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "Frontend (en otra terminal):" -ForegroundColor Yellow
Write-Host "  cd mobile" -ForegroundColor White
Write-Host "  npm start" -ForegroundColor White
Write-Host ""

Write-Host "Documentación adicional:" -ForegroundColor Cyan
Write-Host "  - README.md - Documentación completa" -ForegroundColor White
Write-Host "  - QUICKSTART.md - Guía rápida de uso" -ForegroundColor White
Write-Host "  - API_Examples.http - Ejemplos de peticiones HTTP" -ForegroundColor White
Write-Host ""

# Volver al directorio raíz
Set-Location ..

Write-Host "¡Instalación completada con éxito! 🎉" -ForegroundColor Green
Write-Host ""
