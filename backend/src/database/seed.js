require('dotenv').config();
const bcrypt = require('bcryptjs');
const { User, Sensor, ThresholdGlobal, SensorData } = require('../models');

const seed = async () => {
  try {
    console.log(' Iniciando seed de datos...');

    // Crear usuario administrador
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      email: 'admin@encarnacion.com',
      password: adminPassword,
      name: 'Administrador',
      role: 'admin'
    });
    console.log(' Usuario administrador creado');

    // Crear usuario de prueba
    const userPassword = await bcrypt.hash('user123', 10);
    const user = await User.create({
      email: 'user@encarnacion.com',
      password: userPassword,
      name: 'Usuario de Prueba',
      role: 'user'
    });
    console.log(' Usuario de prueba creado');

    // Crear sensores en la zona céntrica de Encarnación
    const sensors = await Sensor.bulkCreate([
      {
        name: 'Sensor Centro - Plaza de Armas',
        type: 'MULTI',
        location: 'Plaza de Armas, Encarnación',
        latitude: -27.330,
        longitude: -55.867,
        description: 'Sensor principal en el centro de la ciudad',
        apiKey: 'sensor_key_plaza_armas_001',
        isActive: true
      },
      {
        name: 'Sensor Costanera',
        type: 'MULTI',
        location: 'Costanera de Encarnación',
        latitude: -27.340,
        longitude: -55.865,
        description: 'Sensor ubicado en la costanera',
        apiKey: 'sensor_key_costanera_002',
        isActive: true
      },
      {
        name: 'Sensor Zona Comercial',
        type: 'MULTI',
        location: 'Zona Comercial Centro',
        latitude: -27.335,
        longitude: -55.870,
        description: 'Sensor en zona comercial céntrica',
        apiKey: 'sensor_key_comercial_003',
        isActive: true
      }
    ]);
    console.log(' Sensores creados');

    // Crear umbrales globales para UV
    await ThresholdGlobal.bulkCreate([
      {
        type: 'UV',
        level: 'low',
        minValue: 0,
        maxValue: 2,
        color: '#4CAF50',
        message: 'Radiación UV baja. Seguro estar al aire libre.'
      },
      {
        type: 'UV',
        level: 'moderate',
        minValue: 3,
        maxValue: 5,
        color: '#FFC107',
        message: 'Radiación UV moderada. Use protector solar.'
      },
      {
        type: 'UV',
        level: 'high',
        minValue: 6,
        maxValue: 7,
        color: '#FF9800',
        message: 'Radiación UV alta. Protección necesaria.'
      },
      {
        type: 'UV',
        level: 'critical',
        minValue: 8,
        maxValue: null,
        color: '#F44336',
        message: 'Radiación UV muy alta. Evite exposición prolongada.'
      }
    ]);
    console.log(' Umbrales UV globales creados');

    // Crear umbrales globales para AQI
    await ThresholdGlobal.bulkCreate([
      {
        type: 'AQI',
        level: 'good',
        minValue: 0,
        maxValue: 50,
        color: '#4CAF50',
        message: 'Calidad del aire buena.'
      },
      {
        type: 'AQI',
        level: 'moderate',
        minValue: 51,
        maxValue: 100,
        color: '#FFC107',
        message: 'Calidad del aire moderada.'
      },
      {
        type: 'AQI',
        level: 'sensitive',
        minValue: 101,
        maxValue: 150,
        color: '#FF9800',
        message: 'No saludable para grupos sensibles.'
      },
      {
        type: 'AQI',
        level: 'unhealthy',
        minValue: 151,
        maxValue: 200,
        color: '#F44336',
        message: 'No saludable. Limite actividades al aire libre.'
      },
      {
        type: 'AQI',
        level: 'critical',
        minValue: 201,
        maxValue: null,
        color: '#9C27B0',
        message: 'Muy perjudicial. Evite salir.'
      }
    ]);
    console.log('Umbrales AQI globales creados');

    const now = new Date();
    const sampleData = [];

    for (let sensor of sensors) {
      for (let i = 0; i < 168; i++) { // 7 días * 24 horas
        const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
      
        const hour = timestamp.getHours();
        const baseUV = hour >= 10 && hour <= 16 ? 
          Math.random() * 4 + 6 : // Alto durante el mediodía
          Math.random() * 3 + 1;  // Bajo en otros horarios
        
        const baseAQI = Math.random() * 60 + 30; // AQI entre 30 y 90

        sampleData.push({
          sensorId: sensor.id,
          uvIndex: Math.max(0, baseUV + (Math.random() - 0.5) * 2),
          aqi: Math.max(0, baseAQI + (Math.random() - 0.5) * 20),
          pm25: Math.random() * 35 + 10,
          pm10: Math.random() * 50 + 15,
          temperature: Math.random() * 10 + 20, // 20-30°C
          humidity: Math.random() * 30 + 50, // 50-80%
          timestamp
        });
      }
    }

    await SensorData.bulkCreate(sampleData);
    console.log('Datos de ejemplo creados');

    console.log('\nCREDENCIALES DE ACCESO:');
    console.log('═══════════════════════════════════════');
    console.log('Admin:');
    console.log('  Email: admin@encarnacion.com');
    console.log('  Password: admin123');
    console.log('\nUsuario:');
    console.log('  Email: user@encarnacion.com');
    console.log('  Password: user123');
    console.log('═══════════════════════════════════════');
    console.log('\n📡 API KEYS DE SENSORES:');
    console.log('═══════════════════════════════════════');
    sensors.forEach(sensor => {
      console.log(`${sensor.name}:`);
      console.log(`  API Key: ${sensor.apiKey}`);
    });
    console.log('═══════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('Error al hacer seed:', error);
    process.exit(1);
  }
};

seed();
