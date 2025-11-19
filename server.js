import 'dotenv/config'; 
import express from 'express';
import cookieParser from 'cookie-parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Importa conexión y modelos
import { connectDB } from './db/connect.js';
import { Product } from './db/models/Product.js';
import { User } from './db/models/User.js';
import { Sale } from './db/models/Sale.js';

// Importa utilidades de seguridad
import { hashPassword, verifyPassword, generateToken, authenticateToken } from './utils/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Utilizo el puerto que me da el entorno de Render (hosting de la app) o el 3000 para desarrollo local
const PORT = process.env.PORT || 3000; 

const app = express();

// --- Middlewares ---
app.use(express.json());
app.use(cookieParser()); // lee JWT de cookies
app.use(express.static(path.join(__dirname, 'public')));

// --- Conexión a DB ---
connectDB();

// ================= RUTAS =================

// GET /productos
app.get('/productos', async (req, res) => {
  try {
    const productos = await Product.find();
    res.status(200).json(productos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener productos' });
  }
});

// GET /productos filtrado
app.get('/productos/:desde/:hasta', async (req, res) => {
  const { desde, hasta } = req.params;
  try {
    // Filtrado nativo de MongoDB 
    const productos = await Product.find({
      precio: { $gte: desde, $lte: hasta }
    });
    res.status(200).json(productos);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al filtrar productos' });
  }
});

// POST /cargarUsuario (Registro con Encriptación)
app.post('/cargarUsuario', async (req, res) => {
  const { nombre, apellido, email, contraseña } = req.body;

  if (!nombre || !email || !contraseña) {
    return res.status(400).json({ mensaje: 'Faltan datos.' });
  }

  try {
    const existe = await User.findOne({ email });
    if (existe) return res.status(400).json({ mensaje: 'El email ya está registrado.' });

    // 1. Encripta la contraseña
    const hashedPassword = await hashPassword(contraseña);

    // ID autoincremental 
    const lastUser = await User.findOne().sort({ id: -1 });
    const nuevoId = lastUser ? lastUser.id + 1 : 1;

    // 2. Guarda con la contraseña encriptada
    const nuevoUsuario = new User({
      id: nuevoId,
      nombre,
      apellido,
      email,
      contraseña: hashedPassword 
    });

    await nuevoUsuario.save();
    res.status(201).json({ mensaje: 'Usuario creado', id: nuevoId });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al registrar usuario.' });
  }
});

// POST /login (Verificación + JWT)
app.post('/login', async (req, res) => {
  const { email, contraseña } = req.body;

  try {
    const usuario = await User.findOne({ email });
    if (!usuario) return res.status(401).json({ mensaje: 'Credenciales inválidas.' });

    // 1. Verifica contraseña encriptada
    const esValida = await verifyPassword(contraseña, usuario.contraseña);
    if (!esValida) return res.status(401).json({ mensaje: 'Credenciales inválidas.' });

    // 2. Genera Token JWT
    const token = generateToken(usuario);

    // 3. Envia Token en una Cookie (HttpOnly para seguridad)
    res.cookie('auth_token', token, {
      httpOnly: true, // no accesible desde JS del cliente
      maxAge: 3600000 // 1 hora
    });

    res.status(200).json({ 
      mensaje: 'Login exitoso', 
      usuarioId: usuario.id, 
      nombre: usuario.nombre 
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error en el servidor.' });
  }
});

// POST /logout
app.post('/logout', (req, res) => {
  res.clearCookie('auth_token');
  res.status(200).json({ mensaje: 'Sesión cerrada' });
});

// POST /ventas (Ruta Protegida con JWT)
// Agrega 'authenticateToken' como middleware antes de la función
app.post('/ventas', authenticateToken, async (req, res) => {
  const { productos: productosVenta } = req.body;
  const usuarioId = req.user.id; // Obtiene el ID del usuario desde el TOKEN

  if (!productosVenta || productosVenta.length === 0) {
    return res.status(400).json({ mensaje: 'No hay productos.' });
  }

  try {
    let totalVenta = 0;
    const itemsProcesados = [];

    for (const item of productosVenta) {
      // Consulta a MongoDB
      const productoDB = await Product.findOne({ id: item.id_producto });
      if (!productoDB) return res.status(404).json({ mensaje: `Producto ${item.id_producto} no encontrado` });

      const subtotal = productoDB.precio * item.cantidad;
      totalVenta += subtotal;
      
      itemsProcesados.push({
        id_producto: item.id_producto,
        cantidad: item.cantidad,
        precio_unitario: productoDB.precio
      });
    }

    const lastSale = await Sale.findOne().sort({ id: -1 });
    const nuevoIdVenta = lastSale ? lastSale.id + 1 : 1001;

    const nuevaVenta = new Sale({
      id: nuevoIdVenta,
      id_usuario: usuarioId,
      total: totalVenta,
      productos: itemsProcesados
    });

    await nuevaVenta.save();
    res.status(201).json({ id: nuevoIdVenta, mensaje: 'Venta registrada' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ mensaje: 'Error al procesar la venta.' });
  }
});

// Iniciar
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});