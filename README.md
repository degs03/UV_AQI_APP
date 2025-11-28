# Monitor de Radiación UV y Calidad del Aire - Encarnación

Sistema completo de monitoreo ambiental para la zona céntrica de Encarnación, Paraguay. Incluye aplicación móvil (React Native + Expo), backend API (Node.js + Express) y base de datos MySQL.

## 📋 Tabla de Contenidos

- [Características](#características)
- [Tecnologías](#tecnologías)
- [Requisitos Previos](#requisitos-previos)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Ejecución](#ejecución)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [API Endpoints](#api-endpoints)
- [Sensores ESP32](#sensores-esp32)
- [Despliegue](#despliegue)

## ✨ Características

### Frontend Móvil
-  Autenticación con email/contraseña y Google OAuth
-  Visualización en tiempo real de UV y AQI
-  Mapa interactivo con Mapbox
-  Gráficos históricos con Victory Native
-  Notificaciones push personalizadas
-  Configuración de umbrales personalizados
-  Panel de administración

### Backend
-  API REST con Node.js + Express
-  Base de datos MySQL con Sequelize ORM
-  Autenticación JWT
-  Roles de usuario (admin/user)
-  Recepción de datos desde sensores ESP32
-  Sistema de notificaciones push
-  Logs de sistema
-  Gestión de umbrales globales

### Sensores Soportados
- ESP32 + GUVA-S12SD (UV)
- ESP32 + PMS7003 (Calidad del aire)

## 🛠 Tecnologías

### Frontend
- React Native 0.73
- Expo SDK 50
- React Navigation
- Mapbox / React Native Maps
- Victory Native (gráficos)
- Expo Notifications
- Axios

### Backend
- Node.js 18+
- Express 4.x
- MySQL 8.x
- Sequelize ORM
- JWT para autenticación
- Google OAuth
- Expo Server SDK (notificaciones)

## 📦 Requisitos Previos

### Software Necesario

1. **Node.js** (v18 o superior)
   - Descargar: https://nodejs.org/

2. **MySQL** (v8.0 o superior)
   - Windows: https://dev.mysql.com/downloads/installer/
   - Crear usuario y base de datos

3. **Git**
   - Descargar: https://git-scm.com/downloads

4. **Expo CLI** (opcional, se puede usar npx)
   ```bash
   npm install -g expo-cli
   ```

5. **Expo Go** (app móvil para testing)
   - Android: https://play.google.com/store/apps/details?id=host.exp.exponent
   - iOS: https://apps.apple.com/app/expo-go/id982107779

### Cuentas y API Keys Necesarias

1. **Google Cloud Console** (para OAuth)
   - Crear proyecto: https://console.cloud.google.com/
   - Habilitar Google+ API
   - Crear credenciales OAuth 2.0
   - Configurar URI de redirección

2. **Mapbox** (para mapas)
   - Registrarse: https://account.mapbox.com/auth/signup/
   - Obtener access token: https://account.mapbox.com/access-tokens/

3. **Expo** (para notificaciones push - opcional)
   - Crear cuenta: https://expo.dev/signup
   - Obtener access token desde el dashboard

## 🚀 Instalación

### 1. Clonar el Repositorio

```bash
git clone <repository-url>
cd AQI_UV
```

### 2. Configurar Backend

```bash
# Navegar a la carpeta del backend
cd backend

# Instalar dependencias
npm install

# Copiar archivo de configuración
copy .env.example .env

# Editar .env con tus credenciales
notepad .env
```

**Configurar .env del Backend:**

```env
PORT=3000
NODE_ENV=development

# Base de datos
DB_HOST=localhost
DB_PORT=3306
DB_NAME=aqi_uv_db
DB_USER=root
DB_PASSWORD=tu_password_mysql

# JWT
JWT_SECRET=cambia_esto_por_algo_seguro_y_aleatorio

# Google OAuth
GOOGLE_CLIENT_ID=tu_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu_google_client_secret

# CORS
FRONTEND_URL=http://localhost:19006

# Expo (opcional)
EXPO_ACCESS_TOKEN=tu_expo_token_opcional
```

### 3. Configurar Base de Datos

```bash
# Conectarse a MySQL
mysql -u root -p

# Crear la base de datos
CREATE DATABASE aqi_uv_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;

# Ejecutar migraciones (desde la carpeta backend)
npm run migrate

# Cargar datos de ejemplo
npm run seed
```

### 4. Configurar Frontend

```bash
# Navegar a la carpeta mobile
cd ..\mobile

# Instalar dependencias
npm install

# Copiar configuración
copy .env.example .env
```

**Editar app.json:**

```json
{
  "expo": {
    "extra": {
      "apiUrl": "http://TU_IP_LOCAL:3000/api",
      "googleClientId": "TU_GOOGLE_CLIENT_ID.apps.googleusercontent.com",
      "mapboxAccessToken": "TU_MAPBOX_TOKEN"
    }
  }
}
```

**⚠️ IMPORTANTE:** Para probar en dispositivo físico, reemplaza `localhost` con tu IP local (ej: `http://192.168.1.100:3000/api`)

Para obtener tu IP local:
```bash
# Windows
ipconfig

# Buscar "IPv4 Address" en tu conexión activa
```

## ▶️ Ejecución

### Iniciar Backend

```bash
# Desde la carpeta backend

# Modo desarrollo (con auto-reload)
npm run dev

# Modo producción
npm start
```

El servidor estará disponible en: `http://localhost:3000`

### Iniciar Frontend

```bash
# Desde la carpeta mobile

# Iniciar Expo
npm start

# O directamente:
npx expo start
```

Opciones al iniciar Expo:
- Presiona `a` para abrir en Android emulator
- Presiona `i` para abrir en iOS simulator
- Escanea el QR con Expo Go para abrir en dispositivo físico

### Credenciales de Prueba

Después de ejecutar `npm run seed`:

**Administrador:**
- Email: `admin@encarnacion.com`
- Password: `admin123`

**Usuario:**
- Email: `user@encarnacion.com`
- Password: `user123`

## 📁 Estructura del Proyecto

```
AQI_UV/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── dataController.js
│   │   │   ├── sensorController.js
│   │   │   ├── thresholdController.js
│   │   │   └── adminController.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   └── logger.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Sensor.js
│   │   │   ├── SensorData.js
│   │   │   ├── ThresholdUser.js
│   │   │   ├── ThresholdGlobal.js
│   │   │   ├── Log.js
│   │   │   └── index.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── data.js
│   │   │   ├── sensors.js
│   │   │   ├── thresholds.js
│   │   │   └── admin.js
│   │   ├── utils/
│   │   │   ├── notifications.js
│   │   │   └── thresholds.js
│   │   ├── database/
│   │   │   ├── migrate.js
│   │   │   └── seed.js
│   │   └── server.js
│   ├── package.json
│   └── .env
│
├── mobile/
│   ├── src/
│   │   ├── config/
│   │   │   ├── api.js
│   │   │   └── environment.js
│   │   ├── contexts/
│   │   │   └── AuthContext.js
│   │   ├── services/
│   │   │   ├── authService.js
│   │   │   ├── dataService.js
│   │   │   ├── sensorService.js
│   │   │   ├── thresholdService.js
│   │   │   ├── adminService.js
│   │   │   └── notificationService.js
│   │   ├── screens/
│   │   │   ├── LoginScreen.js
│   │   │   ├── RegisterScreen.js
│   │   │   ├── HomeScreen.js
│   │   │   ├── MapScreen.js
│   │   │   ├── HistoryScreen.js
│   │   │   ├── SettingsScreen.js
│   │   │   └── AdminScreen.js
│   │   └── navigation/
│   │       └── AppNavigator.js
│   ├── App.js
│   ├── app.json
│   ├── package.json
│   └── .env
│
└── README.md
```

## 🔌 API Endpoints

### Autenticación

```
POST   /api/auth/register        - Registrar usuario
POST   /api/auth/login           - Iniciar sesión
POST   /api/auth/google          - Login con Google
GET    /api/auth/me              - Obtener usuario actual
POST   /api/auth/push-token      - Actualizar token de notificaciones
```

### Datos

```
GET    /api/data/current         - Datos actuales (público)
GET    /api/data/map             - Datos para mapa (público)
GET    /api/data/history         - Histórico (requiere auth)
GET    /api/data/history/:id     - Histórico por sensor
GET    /api/data/statistics      - Estadísticas
```

### Sensores

```
POST   /api/sensors/data         - Recibir datos desde ESP32 (requiere API key)
GET    /api/sensors              - Listar sensores
POST   /api/sensors              - Crear sensor (admin)
PUT    /api/sensors/:id          - Actualizar sensor (admin)
DELETE /api/sensors/:id          - Eliminar sensor (admin)
```

### Umbrales

```
GET    /api/thresholds/user      - Umbrales del usuario
POST   /api/thresholds/user      - Configurar umbral
DELETE /api/thresholds/user/:id  - Eliminar umbral
GET    /api/thresholds/global    - Umbrales globales
POST   /api/thresholds/global    - Configurar umbral global (admin)
```

### Administración

```
GET    /api/admin/users          - Listar usuarios (admin)
POST   /api/admin/users          - Crear usuario (admin)
PUT    /api/admin/users/:id      - Actualizar usuario (admin)
DELETE /api/admin/users/:id      - Eliminar usuario (admin)
GET    /api/admin/logs           - Ver logs (admin)
GET    /api/admin/stats          - Estadísticas dashboard (admin)
```

## 📡 Sensores ESP32

### Formato de Envío

Los sensores ESP32 deben enviar datos mediante POST a `/api/sensors/data`:

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

### Ejemplo Arduino/ESP32

```cpp
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

const char* ssid = "TU_WIFI";
const char* password = "TU_PASSWORD";
const char* serverUrl = "http://TU_IP:3000/api/sensors/data";
const char* apiKey = "sensor_key_xxx";

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWiFi conectado");
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");
    
    // Leer sensores
    float uvIndex = readUVSensor();
    float aqi = readAQISensor();
    float temp = readTemperature();
    float hum = readHumidity();
    
    // Crear JSON
    StaticJsonDocument<256> doc;
    doc["apiKey"] = apiKey;
    doc["uvIndex"] = uvIndex;
    doc["aqi"] = aqi;
    doc["temperature"] = temp;
    doc["humidity"] = hum;
    
    String jsonData;
    serializeJson(doc, jsonData);
    
    // Enviar
    int httpCode = http.POST(jsonData);
    Serial.printf("HTTP Code: %d\n", httpCode);
    
    http.end();
  }
  
  delay(60000); // Enviar cada minuto
}
```

## 🔧 Comandos Útiles

### Backend

```bash
# Instalar dependencias
npm install

# Crear/actualizar tablas
npm run migrate

# Poblar base de datos con datos de ejemplo
npm run seed

# Iniciar en desarrollo
npm run dev

# Iniciar en producción
npm start
```

### Frontend

```bash
# Instalar dependencias
npm install

# Iniciar Expo
npm start

# Iniciar en Android
npm run android

# Iniciar en iOS
npm run ios

# Iniciar en web
npm run web

# Limpiar caché
npx expo start -c
```

## 📱 Build para Producción

### Usando EAS Build (Recomendado)

```bash
# Instalar EAS CLI
npm install -g eas-cli

# Login en Expo
eas login

# Configurar proyecto
eas build:configure

# Build para Android
eas build --platform android

# Build para iOS
eas build --platform ios

# Build para ambos
eas build --platform all
```

### APK Local (Android)

```bash
# Desde la carpeta mobile
npx expo build:android -t apk
```

## 🐛 Troubleshooting

### Backend no se conecta a MySQL

1. Verificar que MySQL esté corriendo
2. Verificar credenciales en `.env`
3. Verificar que la base de datos exista
4. Verificar permisos del usuario MySQL

### Frontend no conecta con Backend

1. Verificar que la URL en `app.json` sea correcta
2. Si usas dispositivo físico, usar IP local en lugar de localhost
3. Verificar que backend esté corriendo
4. Verificar firewall de Windows

### Expo no inicia

```bash
# Limpiar caché
npx expo start -c

# Reinstalar dependencias
rm -rf node_modules
npm install
```

### Errores de Google Auth

1. Verificar que el Client ID sea correcto
2. Verificar URIs de redirección en Google Console

---

**Desarrollado para el monitoreo ambiental de Encarnación, Paraguay** 🇵🇾
