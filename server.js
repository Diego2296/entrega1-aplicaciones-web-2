// server.js
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Helper para obtener la ruta absoluta del directorio actual (compatible con ES Modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Funciones Auxiliares para Manejo de Datos ---

/**
 * Lee los datos desde un archivo JSON.
 * @param {string} fileName - Nombre del archivo JSON (sin extensión).
 * @returns {Promise<Array|Object>} - Promesa que resuelve con los datos parseados.
 */
async function readData(fileName) {
  const filePath = path.join(__dirname, `${fileName}.json`);
  try {
    const data = await readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    // Si el archivo no existe o hay otro error, considera devolver un estado inicial o lanzar el error
    console.error(`Error leyendo el archivo ${fileName}.json:`, error);
    // Podríamos inicializar con un array vacío si el archivo no existe la primera vez
    if (error.code === 'ENOENT') {
      return []; // O un objeto vacío {} según la estructura esperada
    }
    throw error; // Relanzar otros errores
  }
}

/**
 * Escribe datos en un archivo JSON.
 * @param {string} fileName - Nombre del archivo JSON (sin extensión).
 * @param {Array|Object} data - Datos a escribir en el archivo.
 * @returns {Promise<void>} - Promesa que resuelve cuando la escritura finaliza.
 */
async function writeData(fileName, data) {
  const filePath = path.join(__dirname, `${fileName}.json`);
  try {
    // Usamos null, 2 para formatear el JSON con indentación para legibilidad
    await writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Error escribiendo el archivo ${fileName}.json:`, error);
    throw error;
  }
}

// -------------------------------------------------


// server.js
// ... (funciones auxiliares de arriba) ...

import express from 'express';

// --- Inicialización de Express ---
const app = express();
const PORT = 3000; 

// Middleware para parsear JSON en el cuerpo de las solicitudes POST/PUT
app.use(express.json()); 

// --- Carga inicial de datos (en memoria para simplificar) ---

let usuarios = [];
let productos = [];
let ventas = [];

async function cargarDatosIniciales() {
  usuarios = await readData('usuarios');
  productos = await readData('productos');
  ventas = await readData('ventas');
}

// --- Rutas de la API ---

// GET /productos -> devuelve todos los productos (Req. 1 GET)
app.get('/productos', (req, res) => {
  res.status(200).json(productos); 
});

// GET /productos/:desde/:hasta -> devuelve productos en rango de precios (Req. 2 GET)
// Nota: Tomamos :desde y :hasta como parámetros de ruta
app.get('/productos/:desde/:hasta', (req, res) => {
  const { desde, hasta } = req.params; // [
  const minPrecio = parseFloat(desde);
  const maxPrecio = parseFloat(hasta);

  if (isNaN(minPrecio) || isNaN(maxPrecio)) {
    return res.status(400).json({ mensaje: 'Los parámetros desde y hasta deben ser números.' }); 
  }

  const productosFiltrados = productos.filter(p => p.precio >= minPrecio && p.precio <= maxPrecio);
  res.status(200).json(productosFiltrados);
});

// GET /usuarios -> devuelve todos los usuarios (Req. nueva)
app.get('/usuarios', (req, res) => {
  // Los datos ya están en la variable 'usuarios' cargada en memoria
  res.status(200).json(usuarios); 
});

// POST /cargarUsuario -> carga un nuevo usuario (Req. 1 POST)
app.post('/cargarUsuario', async (req, res) => {
  const { nombre, apellido, email, contraseña } = req.body; 

  if (!nombre || !apellido || !email || !contraseña) {
    return res.status(400).json({ mensaje: 'Faltan datos requeridos para crear el usuario.' });
  }

  // Simple generación de ID 
  const nuevoId = usuarios.length > 0 ? Math.max(...usuarios.map(u => u.id)) + 1 : 1;
  const nuevoUsuario = {
    id: nuevoId,
    nombre,
    apellido,
    email,
    contraseña // ¡OJO! En una app real, NUNCA guardes contraseñas en texto plano
  };

  usuarios.push(nuevoUsuario);
  try {
    await writeData('usuarios', usuarios);
    res.status(201).json(nuevoUsuario); // 201 Created 
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al guardar el nuevo usuario.' }); 
  }
});

// POST /login -> ingreso de un usuario ya cargado (Req. 2 POST - Datos sensibles)
app.post('/login', (req, res) => {
  const { email, contraseña } = req.body;

  if (!email || !contraseña) {
    return res.status(400).json({ mensaje: 'Faltan email o contraseña.' });
  }

  const usuarioEncontrado = usuarios.find(u => u.email === email && u.contraseña === contraseña);

  if (usuarioEncontrado) {

    res.status(200).json({ mensaje: 'Login exitoso', usuarioId: usuarioEncontrado.id });
  } else {
    res.status(401).json({ mensaje: 'Credenciales inválidas.' }); // 401 Unauthorized
  }
});

// PUT /productos/:id -> actualiza un producto existente (Req. PUT)
app.put('/productos/:id', async (req, res) => {
  const { id } = req.params;
  const datosActualizar = req.body;
  const productoId = parseInt(id);

  if (isNaN(productoId)) {
    return res.status(400).json({ mensaje: 'El ID debe ser numérico.' });
  }

  const indiceProducto = productos.findIndex(p => p.id === productoId);

  if (indiceProducto === -1) {
    return res.status(404).json({ mensaje: 'Producto no encontrado.' }); // 404 Not Found
  }

  // Actualiza el producto
  // Usamos el spread operator para mantener los campos no enviados
  productos[indiceProducto] = { ...productos[indiceProducto], ...datosActualizar };

  try {
    await writeData('productos', productos);
    res.status(200).json(productos[indiceProducto]);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar el producto.' });
  }
});

// DELETE /usuarios/:id -> elimina un usuario (Req. DELETE con integridad)
app.delete('/usuarios/:id', async (req, res) => {
  const { id } = req.params;
  const usuarioId = parseInt(id);

  if (isNaN(usuarioId)) {
    return res.status(400).json({ mensaje: 'El ID debe ser numérico.' });
  }

  // ---- Verificación de Integridad ----
  const ventasUsuario = ventas.filter(v => v.id_usuario === usuarioId);
  if (ventasUsuario.length > 0) {
    return res.status(409).json({ // 409 Conflict
      mensaje: 'Conflicto: No se puede eliminar el usuario porque tiene ventas asociadas.',
      ventasAsociadas: ventasUsuario.map(v => v.id) // Devuelve solo los IDs de las ventas asociadas
    });
  }
  // ------------------------------------

  const indiceUsuario = usuarios.findIndex(u => u.id === usuarioId);

  if (indiceUsuario === -1) {
    return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
  }

  // Elimina el usuario del array
  usuarios.splice(indiceUsuario, 1);

  try {
    await writeData('usuarios', usuarios);
    res.status(204).send(); // 204 No Content (éxito sin cuerpo de respuesta)
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar el usuario.' });
  }
});


// GET /ventas -> devuelve todas las ventas
app.get('/ventas', (req, res) => {
  if (ventas.length > 0) {
    res.status(200).json(ventas);
  } else {
    // Es bueno manejar el caso de que no haya ventas
    res.status(200).json([]); 
  }
});

// --- Manejo de rutas no encontradas ---
app.use((req, res) => {
  res.status(404).json({ mensaje: `No se encontró el recurso: ${req.method} ${req.url}` });
});

// --- Iniciar Servidor ---
async function iniciarServidor() {
  await cargarDatosIniciales();
  app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
  });
}

iniciarServidor();