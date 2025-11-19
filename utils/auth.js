import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Usa process.env
const SECRET_KEY = process.env.SECRET_KEY; 

/**
 * Encripta la contraseña.
 */
export const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Verifica si la contraseña coincide con el hash.
 */
export const verifyPassword = async (password, hash) => {
  return await bcrypt.compare(password, hash);
};

/**
 * Genera un Token JWT.
 */
export const generateToken = (user) => {
  // Guarda en el token solo datos no sensibles (ID y nombre)
  return jwt.sign({ id: user.id, email: user.email, nombre: user.nombre }, SECRET_KEY, { expiresIn: '1h' });
};

/**
 * Middleware para proteger rutas (verificar si hay token).
 */
export const authenticateToken = (req, res, next) => {
  const token = req.cookies.auth_token; // Lee de la cookie

  if (!token) {
    return res.status(401).json({ mensaje: 'Acceso denegado. No se proporcionó token.' });
  }

  try {
    const verified = jwt.verify(token, SECRET_KEY);
    req.user = verified; // Agrega los datos del usuario a la petición
    next(); // Continua a la siguiente función
  } catch (error) {
    res.status(403).json({ mensaje: 'Token inválido o expirado.' });
  }
};