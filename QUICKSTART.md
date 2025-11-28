# GUÍA RÁPIDA DE EJECUCIÓN

## ⚡ Instalación Rápida (Windows)

### 1. Requisitos Previos

Asegúrate de tener instalado:
-  Node.js 18+ (https://nodejs.org/)
-  MySQL 8+ (https://dev.mysql.com/downloads/installer/)
-  Git (https://git-scm.com/downloads)

### 2. Configurar Backend

```powershell
# Navegar al backend
cd backend

# Instalar dependencias
npm install

# Configurar variables de entorno
copy .env.example .env
notepad .env
# Editar DB_PASSWORD con tu password de MySQL

# Crear base de datos en MySQL
mysql -u root -p
# En MySQL: CREATE DATABASE aqi_uv_db;
# EXIT;

# Ejecutar migraciones
npm run migrate

# Cargar datos de ejemplo
npm run seed
```

### 3. Configurar Frontend

```powershell
# Navegar al frontend
cd ..\mobile

# Instalar dependencias
npm install

# Configurar API URL en app.json
# Editar "extra" -> "apiUrl" con tu IP local si usas dispositivo físico
# Para emulador puedes dejar: http://localhost:3000/api
```

## 🚀 Ejecutar el Proyecto

### Terminal 1 - Backend

```powershell
cd backend
npm run dev
```

Verás:
```
 Conexión a la base de datos establecida
🚀 Servidor corriendo en http://localhost:3000
```

### Terminal 2 - Frontend

```powershell
cd mobile
npm start
```

Luego:
- Presiona `a` para Android emulator
- Presiona `w` para web browser
- Escanea QR con Expo Go en tu teléfono

## 👤 Credenciales de Prueba

**Administrador:**
```
Email: admin@encarnacion.com
Password: admin123
```

**Usuario Normal:**
```
Email: user@encarnacion.com
Password: user123
```

## 🔑 API Keys del Seed

**Sensores creados automáticamente:**
```
Sensor Plaza de Armas: sensor_key_plaza_armas_001
Sensor Costanera: sensor_key_costanera_002
Sensor Zona Comercial: sensor_key_comercial_003
```

## 📋 Checklist de Configuración

### Backend (.env)
- [ ] DB_PASSWORD configurado
- [ ] JWT_SECRET cambiado
- [ ] GOOGLE_CLIENT_ID (opcional para Google Auth)
- [ ] Puerto 3000 libre

### Frontend (app.json)
- [ ] apiUrl configurado correctamente
- [ ] mapboxAccessToken (opcional, para mapas mejorados)
- [ ] googleClientId (opcional, para Google Auth)

## 🧪 Probar el Sistema

### 1. Verificar Backend
```powershell
# Abrir navegador en:
http://localhost:3000/health
# Debe mostrar: {"status":"OK","timestamp":"..."}
```

### 2. Probar Endpoints
```powershell
# Datos actuales (público)
curl http://localhost:3000/api/data/current

# Login
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"admin@encarnacion.com\",\"password\":\"admin123\"}"
```

### 3. Simular Sensor ESP32
```powershell
# Enviar datos desde sensor
curl -X POST http://localhost:3000/api/sensors/data -H "Content-Type: application/json" -d "{\"apiKey\":\"sensor_key_plaza_armas_001\",\"uvIndex\":7.5,\"aqi\":85,\"temperature\":28.5,\"humidity\":65.2}"
```

## 🔧 Solución de Problemas Comunes

### Error: "Cannot connect to MySQL"
```powershell
# Verificar que MySQL esté corriendo
# En Servicios de Windows buscar "MySQL80" y iniciarlo
```

### Error: "Port 3000 already in use"
```powershell
# Cambiar puerto en backend/.env:
# PORT=3001
```

### Error: "Unable to resolve host" en móvil
```powershell
# Obtener tu IP local:
ipconfig
# Buscar "IPv4 Address"

# Actualizar en mobile/app.json:
# "apiUrl": "http://TU_IP:3000/api"
# Ejemplo: "http://192.168.1.100:3000/api"
```

### Limpiar todo y reiniciar
```powershell
# Backend
cd backend
Remove-Item node_modules -Recurse -Force
npm install
npm run migrate
npm run seed

# Frontend
cd ..\mobile
Remove-Item node_modules -Recurse -Force
npm install
npx expo start -c
```

## 📊 Estructura de Datos

### Usuario
```json
{
  "email": "usuario@example.com",
  "password": "contraseña",
  "name": "Nombre Usuario",
  "role": "user" | "admin"
}
```

### Dato de Sensor
```json
{
  "apiKey": "sensor_key_xxx",
  "uvIndex": 7.5,
  "aqi": 85,
  "pm25": 25.3,
  "pm10": 42.1,
  "temperature": 28.5,
  "humidity": 65.2,
  "timestamp": "2024-01-15T14:30:00Z"
}
```

### Umbral Personalizado
```json
{
  "type": "UV" | "AQI",
  "value": 6,
  "notificationEnabled": true
}
```

## 🎯 Próximos Pasos

1.  Backend corriendo en puerto 3000
2.  Frontend corriendo en Expo
3.  Login con credenciales de prueba
4.  Ver datos en pantalla principal
5.  Probar mapa interactivo
6.  Configurar umbrales personalizados
7.  Acceder a panel admin (con cuenta admin)
8.  Enviar datos desde simulador ESP32

## 📚 Documentación Adicional

- README.md completo
- Comentarios en código fuente
- Endpoints documentados en controladores
- Modelos documentados en carpeta models/

## 🆘 Ayuda

Si encuentras problemas:
1. Revisar logs del backend en la consola
2. Revisar logs de Expo en la consola
3. Verificar que todos los servicios estén corriendo
4. Consultar sección Troubleshooting en README.md

---

**¡Listo para usar! 🎉**
