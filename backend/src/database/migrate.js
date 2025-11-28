require('dotenv').config();
const { sequelize } = require('../models');

const migrate = async () => {
  try {
    console.log('🔄 Conectando a la base de datos...');
    
    await sequelize.authenticate();
    console.log('✅ Conexión establecida exitosamente.');

    console.log('🔄 Sincronizando modelos...');
    
    // force: false no elimina las tablas existentes
    // alter: true modifica las tablas existentes para que coincidan con los modelos
    await sequelize.sync({ alter: true });
    
    console.log('✅ Base de datos sincronizada exitosamente.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al migrar:', error);
    process.exit(1);
  }
};

migrate();
