const bcrypt = require('bcryptjs');
const { User, Log, Sensor } = require('../models');

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'email', 'name', 'role', 'isActive', 'createdAt'],
      order: [['createdAt', 'DESC']]
    });

    res.json({ users });
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

// Create user
exports.createUser = async (req, res) => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, contraseña y nombre son requeridos' });
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      role: role || 'user'
    });

    await Log.create({
      userId: req.user.id,
      action: 'CREATE_USER',
      description: `Usuario ${email} creado por administrador`,
      ipAddress: req.ip
    });

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
};

// Update user
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, name, role, isActive, password } = req.body;

    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const updateData = {
      email: email || user.email,
      name: name || user.name,
      role: role || user.role,
      isActive: isActive !== undefined ? isActive : user.isActive
    };

    // Si se proporciona nueva contraseña
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    await user.update(updateData);

    await Log.create({
      userId: req.user.id,
      action: 'UPDATE_USER',
      description: `Usuario ${user.email} actualizado`,
      ipAddress: req.ip
    });

    res.json({
      message: 'Usuario actualizado exitosamente',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'No puedes eliminar tu propia cuenta' });
    }

    const user = await User.findByPk(id);
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    await user.destroy();

    await Log.create({
      userId: req.user.id,
      action: 'DELETE_USER',
      description: `Usuario ${user.email} eliminado`,
      ipAddress: req.ip
    });

    res.json({ message: 'Usuario eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
};

// Get system logs
exports.getLogs = async (req, res) => {
  try {
    const { limit = 100, level, action } = req.query;

    const whereClause = {};
    
    if (level) {
      whereClause.level = level;
    }
    
    if (action) {
      whereClause.action = action;
    }

    const logs = await Log.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          attributes: ['id', 'email', 'name']
        }
      ],
      order: [['timestamp', 'DESC']],
      limit: parseInt(limit)
    });

    res.json({ logs });
  } catch (error) {
    console.error('Error al obtener logs:', error);
    res.status(500).json({ error: 'Error al obtener logs' });
  }
};

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const activeUsers = await User.count({ where: { isActive: true } });
    const totalSensors = await Sensor.count();
    const activeSensors = await Sensor.count({ where: { isActive: true } });

    res.json({
      stats: {
        totalUsers,
        activeUsers,
        totalSensors,
        activeSensors
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};
