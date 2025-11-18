// server.js
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';

// --- Constantes y Helpers ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = 3000;

// --- Funciones Auxiliares para Manejo de Datos ---

/**
 * Lee los datos desde un archivo JSON.
 * @param {string} fileName - Nombre del archivo JSON.
 * @returns {Promise<Array|Object>} - Promesa que resuelve con los datos parseados.
 */
async function readData(fileName) {
  const filePath = path.join(__dirname, `${fileName}.json`);
  try {
    const data = await readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error leyendo el archivo ${fileName}.json:`, error);
    if (error.code === 'ENOENT') {
      return []; // Devuelve array vacío si no existe
    }
    throw error;
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
    await writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error(`Error escribiendo el archivo ${fileName}.json:`, error);
    throw error;
  }
}

// --- Inicialización de Express ---
const app = express();

// --- Middlewares ---
app.use(express.json()); // Para parsear JSON en el body
// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// --- Carga inicial de datos (en memoria) ---
let usuarios = [];
let productos = [];
let ventas = [];

async function cargarDatosIniciales() {
  try {
    usuarios = await readData('usuarios');
    productos = await readData('productos');
    ventas = await readData('ventas');
  } catch (error) {
    console.error("Error fatal al cargar datos iniciales. Saliendo.", error);
    process.exit(1); // Si no podemos leer los datos, no iniciamos el server.
  }
}

// --- Rutas de la API ---

// GET /productos -> devuelve todos los productos
app.get('/productos', (req, res) => {
  res.status(200).json(productos);
});

// GET /productos/:desde/:hasta -> devuelve productos en rango de precios
app.get('/productos/:desde/:hasta', (req, res) => {
  const { desde, hasta } = req.params;
  const minPrecio = parseFloat(desde);
  const maxPrecio = parseFloat(hasta);

  if (isNaN(minPrecio) || isNaN(maxPrecio)) {
    return res.status(400).json({ mensaje: 'Los parámetros desde y hasta deben ser números.' });
  }

  const productosFiltrados = productos.filter(p => p.precio >= minPrecio && p.precio <= maxPrecio);
  res.status(200).json(productosFiltrados);
});

// GET /usuarios -> devuelve todos los usuarios
app.get('/usuarios', (req, res) => {
  res.status(200).json(usuarios);
});

// POST /cargarUsuario -> carga un nuevo usuario
app.post('/cargarUsuario', async (req, res) => {
  const { nombre, apellido, email, contraseña } = req.body;

  if (!nombre || !apellido || !email || !contraseña) {
    return res.status(400).json({ mensaje: 'Faltan datos requeridos para crear el usuario.' });
  }

  const nuevoId = usuarios.length > 0 ? Math.max(...usuarios.map(u => u.id)) + 1 : 1;
  const nuevoUsuario = {
    id: nuevoId,
    nombre,
    apellido,
    email,
    contraseña
  };

  usuarios.push(nuevoUsuario);
  try {
    await writeData('usuarios', usuarios);
    res.status(201).json(nuevoUsuario);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al guardar el nuevo usuario.' });
  }
});

// POST /login -> ingreso de un usuario
app.post('/login', (req, res) => {
  const { email, contraseña } = req.body;

  if (!email || !contraseña) {
    return res.status(400).json({ mensaje: 'Faltan email o contraseña.' });
  }
  
  // NUNCA compares contraseñas en texto plano en producción. Esto es solo para simular.
  const usuarioEncontrado = usuarios.find(u => u.email === email && u.contraseña === contraseña);

  if (usuarioEncontrado) {
    res.status(200).json({ 
      mensaje: 'Login exitoso', usuarioId: usuarioEncontrado.id, nombre: usuarioEncontrado.nombre});
  } else {
    res.status(401).json({ mensaje: 'Credenciales inválidas.' });
  }
});

// PUT /productos/:id -> actualiza un producto
app.put('/productos/:id', async (req, res) => {
  const { id } = req.params;
  const datosActualizar = req.body;
  const productoId = parseInt(id);

  if (isNaN(productoId)) {
    return res.status(400).json({ mensaje: 'El ID debe ser numérico.' });
  }

  const indiceProducto = productos.findIndex(p => p.id === productoId);

  if (indiceProducto === -1) {
    return res.status(404).json({ mensaje: 'Producto no encontrado.' });
  }

  productos[indiceProducto] = { ...productos[indiceProducto], ...datosActualizar };

  try {
    await writeData('productos', productos);
    res.status(200).json(productos[indiceProducto]);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al actualizar el producto.' });
  }
});

// DELETE /usuarios/:id -> elimina un usuario
app.delete('/usuarios/:id', async (req, res) => {
  const { id } = req.params;
  const usuarioId = parseInt(id);

  if (isNaN(usuarioId)) {
    return res.status(400).json({ mensaje: 'El ID debe ser numérico.' });
  }

  const ventasUsuario = ventas.filter(v => v.id_usuario === usuarioId);
  if (ventasUsuario.length > 0) {
    return res.status(409).json({
      mensaje: 'Conflicto: No se puede eliminar el usuario porque tiene ventas asociadas.',
      ventasAsociadas: ventasUsuario.map(v => v.id)
    });
  }

  const indiceUsuario = usuarios.findIndex(u => u.id === usuarioId);

  if (indiceUsuario === -1) {
    return res.status(404).json({ mensaje: 'Usuario no encontrado.' });
  }

  usuarios.splice(indiceUsuario, 1);

  try {
    await writeData('usuarios', usuarios);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al eliminar el usuario.' });
  }
});

// GET /ventas -> devuelve todas las ventas
app.get('/ventas', (req, res) => {
  res.status(200).json(ventas);
});

// ----------------------------------------------------------------
// Requerimiento 4: Comprar
// ----------------------------------------------------------------
/**
 * Crea una nueva venta.
 * Recibe: { id_usuario: number, productos: [{ id_producto: number, cantidad: number }] }
 * El precio y el total se calculan en el backend por seguridad.
 */
app.post('/ventas', async (req, res) => {
  const { id_usuario, productos: productosVenta } = req.body; // { id_producto, cantidad }

  if (!id_usuario || !productosVenta || !Array.isArray(productosVenta) || productosVenta.length === 0) {
    return res.status(400).json({ mensaje: 'Faltan datos requeridos: id_usuario o productos.' });
  }

  try {
    let totalVenta = 0;
    const productosConPrecio = [];

    // Validar productos y calcular total (Lógica de negocio en el backend)
    for (const item of productosVenta) {
      const productoDB = productos.find(p => p.id === item.id_producto);
      if (!productoDB) {
        return res.status(404).json({ mensaje: `Producto con ID ${item.id_producto} no encontrado.` });
      }

      const precioUnitario = parseFloat(productoDB.precio);
      totalVenta += precioUnitario * item.cantidad;
      productosConPrecio.push({
        id_producto: item.id_producto,
        cantidad: item.cantidad,
        precio_unitario: precioUnitario // Aseguramos el precio desde el servidor
      });
    }

    const nuevaIdVenta = ventas.length > 0 ? Math.max(...ventas.map(v => v.id)) + 1 : 1001;
    
    const nuevaVenta = {
      id: nuevaIdVenta,
      id_usuario: parseInt(id_usuario),
      fecha: new Date().toISOString(),
      total: totalVenta,
      direccion: "Dirección de ejemplo", // En un caso real, esto vendría del body
      productos: productosConPrecio
    };

    ventas.push(nuevaVenta);
    await writeData('ventas', ventas);
    
    // 201 Created
    res.status(201).json(nuevaVenta); 
  } catch (error) {
    console.error("Error al procesar la venta:", error);
    res.status(500).json({ mensaje: 'Error al procesar la venta.' });
  }
});


// --- Manejo de rutas no encontradas (404) ---
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