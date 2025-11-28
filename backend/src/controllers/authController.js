const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { User, Log } = require('../models');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Register with email/password
exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validar datos
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      role: 'user'
    });

    // Crear log
    await Log.create({
      userId: user.id,
      action: 'REGISTER',
      description: 'Usuario registrado',
      ipAddress: req.ip
    });

    // Generar token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
};

// Login with email/password
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar datos
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    // Buscar usuario
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Verificar contraseña
    if (!user.password) {
      return res.status(401).json({ error: 'Usuario registrado con Google. Use login con Google.' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Verificar si está activo
    if (!user.isActive) {
      return res.status(401).json({ error: 'Usuario inactivo' });
    }

    // Crear log
    await Log.create({
      userId: user.id,
      action: 'LOGIN',
      description: 'Usuario inició sesión',
      ipAddress: req.ip
    });

    // Generar token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};

// Login with Google
exports.googleAuth = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ error: 'Token de Google requerido' });
    }

    // Verificar token de Google
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name } = payload;

    // Buscar o crear usuario
    let user = await User.findOne({ where: { googleId } });

    if (!user) {
      // Verificar si existe con el mismo email
      user = await User.findOne({ where: { email } });
      
      if (user) {
        // Vincular cuenta existente con Google
        user.googleId = googleId;
        await user.save();
      } else {
        // Crear nuevo usuario
        user = await User.create({
          email,
          name,
          googleId,
          role: 'user'
        });

        await Log.create({
          userId: user.id,
          action: 'REGISTER_GOOGLE',
          description: 'Usuario registrado con Google',
          ipAddress: req.ip
        });
      }
    }

    // Verificar si está activo
    if (!user.isActive) {
      return res.status(401).json({ error: 'Usuario inactivo' });
    }

    // Crear log
    await Log.create({
      userId: user.id,
      action: 'LOGIN_GOOGLE',
      description: 'Usuario inició sesión con Google',
      ipAddress: req.ip
    });

    // Generar token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login con Google exitoso',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error en login con Google:', error);
    res.status(500).json({ error: 'Error al autenticar con Google' });
  }
};

// Get current user
exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ['id', 'email', 'name', 'role', 'createdAt']
    });

    res.json({ user });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ error: 'Error al obtener datos del usuario' });
  }
};

// Update push token
exports.updatePushToken = async (req, res) => {
  try {
    const { pushToken } = req.body;

    await User.update(
      { pushToken },
      { where: { id: req.user.id } }
    );

    res.json({ message: 'Token de notificaciones actualizado' });
  } catch (error) {
    console.error('Error al actualizar push token:', error);
    res.status(500).json({ error: 'Error al actualizar token' });
  }
};
