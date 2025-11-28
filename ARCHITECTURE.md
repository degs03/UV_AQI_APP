# ARQUITECTURA DEL SISTEMA

## 📐 Visión General

El sistema está compuesto por tres capas principales:

```
┌─────────────────────────────────────────────────────────────┐
│                    CAPA DE PRESENTACIÓN                     │
│                  (React Native + Expo)                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Login   │  │   Home   │  │   Map    │  │  Admin   │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                    CAPA DE APLICACIÓN                       │
│                   (Node.js + Express)                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │   Auth   │  │   Data   │  │ Sensors  │  │  Admin   │  │
│  │Controller│  │Controller│  │Controller│  │Controller│  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                    CAPA DE DATOS                            │
│                       (MySQL)                               │
│  ┌────────┐ ┌────────┐ ┌───────────┐ ┌──────────────┐    │
│  │ Users  │ │Sensors │ │SensorData │ │  Thresholds  │    │
│  └────────┘ └────────┘ └───────────┘ └──────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                   CAPA DE HARDWARE                          │
│                     (Sensores IoT)                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│  │ ESP32 +  │  │ ESP32 +  │  │ ESP32 +  │                 │
│  │GUVA-S12SD│  │ PMS7003  │  │  DHT22   │                 │
│  └──────────┘  └──────────┘  └──────────┘                 │
└─────────────────────────────────────────────────────────────┘
```

## 🏗️ Componentes del Sistema

### 1. Frontend Móvil (React Native + Expo)

#### Estructura de Carpetas
```
mobile/
├── src/
│   ├── config/          # Configuración (API, environment)
│   ├── contexts/        # Contextos React (Auth)
│   ├── services/        # Servicios de API
│   ├── screens/         # Pantallas de la app
│   ├── navigation/      # Navegación
│   └── components/      # Componentes reutilizables (futuro)
├── App.js              # Punto de entrada
└── app.json            # Configuración Expo
```

#### Pantallas Principales
- **LoginScreen**: Autenticación email/Google
- **RegisterScreen**: Registro de usuarios
- **HomeScreen**: Dashboard principal con datos en tiempo real
- **MapScreen**: Mapa interactivo con sensores
- **HistoryScreen**: Gráficos históricos
- **SettingsScreen**: Configuración y umbrales personalizados
- **AdminScreen**: Panel de administración

#### Flujo de Navegación
```
Stack Navigator
├── Main (Tab Navigator)
│   ├── Home
│   ├── Map
│   ├── History (solo autenticados)
│   └── Settings
├── Login
├── Register
└── Admin (solo admin)
```

#### Gestión de Estado
- **AuthContext**: Estado global de autenticación
- **AsyncStorage**: Almacenamiento local de token y usuario
- **Axios Interceptors**: Inyección automática de token JWT

### 2. Backend API (Node.js + Express)

#### Estructura de Carpetas
```
backend/
├── src/
│   ├── config/          # Configuración (database)
│   ├── controllers/     # Lógica de negocio
│   ├── models/          # Modelos Sequelize
│   ├── routes/          # Definición de rutas
│   ├── middleware/      # Auth, logger, etc
│   ├── utils/           # Utilidades (notifications, thresholds)
│   ├── database/        # Migraciones y seeds
│   └── server.js        # Punto de entrada
└── package.json
```

#### Controladores

**authController.js**
- Registro de usuarios
- Login email/password
- Login con Google OAuth
- Gestión de tokens JWT
- Actualización de push tokens

**dataController.js**
- Obtener datos actuales
- Datos para mapa
- Históricos con filtros
- Estadísticas
- Clasificación UV/AQI

**sensorController.js**
- Recepción de datos desde ESP32
- CRUD de sensores
- Validación de API keys
- Activación/desactivación

**thresholdController.js**
- Umbrales personalizados por usuario
- Umbrales globales
- Gestión de notificaciones

**adminController.js**
- Gestión de usuarios
- Visualización de logs
- Estadísticas del sistema

#### Modelos de Datos

**User**
```javascript
{
  id: INTEGER (PK),
  email: STRING (UNIQUE),
  password: STRING (nullable),
  name: STRING,
  role: ENUM('user', 'admin'),
  googleId: STRING (UNIQUE, nullable),
  pushToken: STRING (nullable),
  isActive: BOOLEAN,
  createdAt: DATE,
  updatedAt: DATE
}
```

**Sensor**
```javascript
{
  id: INTEGER (PK),
  name: STRING,
  type: ENUM('UV', 'AQI', 'MULTI'),
  location: STRING,
  latitude: DECIMAL(10,8),
  longitude: DECIMAL(11,8),
  description: TEXT,
  isActive: BOOLEAN,
  apiKey: STRING (UNIQUE),
  createdAt: DATE,
  updatedAt: DATE
}
```

**SensorData**
```javascript
{
  id: INTEGER (PK),
  sensorId: INTEGER (FK),
  uvIndex: FLOAT,
  aqi: FLOAT,
  pm25: FLOAT,
  pm10: FLOAT,
  temperature: FLOAT,
  humidity: FLOAT,
  timestamp: DATE
}
```

**ThresholdUser**
```javascript
{
  id: INTEGER (PK),
  userId: INTEGER (FK),
  type: ENUM('UV', 'AQI'),
  value: FLOAT,
  notificationEnabled: BOOLEAN,
  createdAt: DATE,
  updatedAt: DATE
}
```

**ThresholdGlobal**
```javascript
{
  id: INTEGER (PK),
  type: ENUM('UV', 'AQI'),
  level: STRING,
  minValue: FLOAT,
  maxValue: FLOAT (nullable),
  color: STRING,
  message: TEXT,
  createdAt: DATE,
  updatedAt: DATE
}
```

**Log**
```javascript
{
  id: INTEGER (PK),
  userId: INTEGER (FK, nullable),
  action: STRING,
  description: TEXT,
  ipAddress: STRING,
  level: ENUM('info', 'warning', 'error'),
  timestamp: DATE
}
```

#### Middleware

**auth.js**
- `authenticate`: Verifica token JWT
- `isAdmin`: Verifica rol de administrador

**logger.js**
- Registra acciones en la tabla logs

#### Utilidades

**notifications.js**
- `sendPushNotification`: Envía notificación a un usuario
- `sendBulkNotifications`: Envía notificaciones masivas
- Integración con Expo Push Notifications

**thresholds.js**
- `checkThresholds`: Verifica umbrales después de recibir datos
- `checkUVThresholds`: Validación específica para UV
- `checkAQIThresholds`: Validación específica para AQI
- Envío automático de notificaciones

### 3. Base de Datos (MySQL)

#### Diagrama ER

```
┌─────────────┐         ┌──────────────┐
│    Users    │────────<│ThresholdUser │
└─────────────┘         └──────────────┘
      │
      │
      ↓
┌─────────────┐
│    Logs     │
└─────────────┘

┌─────────────┐         ┌──────────────┐
│   Sensors   │────────<│  SensorData  │
└─────────────┘         └──────────────┘

┌──────────────┐
│ThresholdGlobal│
└──────────────┘
```

#### Índices

- `users.email`: UNIQUE
- `users.googleId`: UNIQUE
- `sensors.apiKey`: UNIQUE
- `sensor_data(sensorId, timestamp)`: COMPOSITE

### 4. Sensores IoT (ESP32)

#### Hardware Soportado

**Sensor UV (GUVA-S12SD)**
- Rango: 0-15 UV Index
- Salida: Analógica 0-1V
- Conexión: ADC del ESP32

**Sensor Calidad del Aire (PMS7003)**
- Mediciones: PM1.0, PM2.5, PM10
- Protocolo: UART (9600 baud)
- Salida: µg/m³

**Sensor Temperatura/Humedad (DHT22)**
- Temperatura: -40 a 80°C
- Humedad: 0-100% RH
- Protocolo: 1-Wire

#### Comunicación

**Protocolo**: HTTP POST (JSON)
**Endpoint**: `/api/sensors/data`
**Autenticación**: API Key en body
**Frecuencia**: Configurable (recomendado: 1-5 minutos)

#### Formato de Datos
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

## 🔄 Flujos de Datos

### Flujo de Autenticación

```
Usuario → LoginScreen → authService.login() → API /auth/login
                                                    ↓
                                             authController.login
                                                    ↓
                                             Verificar credenciales
                                                    ↓
                                             Generar JWT token
                                                    ↓
AsyncStorage ← AuthContext ← Response { token, user }
```

### Flujo de Datos en Tiempo Real

```
ESP32 Sensor → POST /sensors/data → sensorController.receiveSensorData
                                              ↓
                                    Validar API Key
                                              ↓
                                    Guardar en SensorData
                                              ↓
                                    checkThresholds()
                                              ↓
                                    [Si supera umbral]
                                              ↓
                                    sendPushNotification()
                                              ↓
                                    Expo Push Service → Usuario Móvil
```

### Flujo de Consulta de Históricos

```
Usuario → HistoryScreen → dataService.getHistory(from, to)
                                    ↓
                          API /data/history?from=...&to=...
                                    ↓
                          dataController.getHistory
                                    ↓
                          Query a SensorData con JOIN Sensor
                                    ↓
                          VictoryChart ← Response { history[] }
```

## 🔒 Seguridad

### Autenticación
- JWT con expiración de 7 días
- Hashing de contraseñas con bcrypt (10 rounds)
- Google OAuth 2.0

### Autorización
- Roles: user, admin
- Middleware de verificación en rutas protegidas
- Endpoints públicos limitados (solo lectura de datos actuales)

### Validación
- API Keys únicas para cada sensor
- Validación de entrada con express-validator
- Sanitización de datos

### CORS
- Configurado para permitir frontend específico
- Credenciales habilitadas

## 📊 Escalabilidad

### Backend
- Pooling de conexiones MySQL
- Posibilidad de agregar Redis para caché
- API stateless (escalamiento horizontal)

### Base de Datos
- Índices en campos de búsqueda frecuente
- Posibilidad de particionamiento de `sensor_data` por fecha
- Archivado automático de datos antiguos (futuro)

### Sensores
- Sistema multi-sensor desde diseño
- API Key único por sensor
- Sin límite de sensores activos

## 🔄 Mejoras Futuras

1. **WebSockets** para datos en tiempo real sin polling
2. **Redis** para caché de datos frecuentes
3. **Docker** para despliegue simplificado
4. **Prometheus + Grafana** para monitoreo del sistema
5. **Testing** automatizado (Jest, React Testing Library)
6. **CI/CD** con GitHub Actions
7. **Backup** automático de base de datos
8. **Mapas de calor** más sofisticados en MapScreen
9. **PWA** para acceso web
10. **Reportes** en PDF exportables

## 📈 Métricas del Sistema

### Performance
- Tiempo de respuesta API: < 200ms
- Tiempo de carga app móvil: < 3s
- Soporte para 1000+ sensores simultáneos

### Disponibilidad
- Uptime objetivo: 99.5%
- Backup diario automático
- Logs persistentes

### Capacidad
- 1 millón+ registros de sensor_data
- 10,000+ usuarios concurrentes
- Notificaciones push ilimitadas

---

**Versión**: 1.0.0  
**Última actualización**: 2024
