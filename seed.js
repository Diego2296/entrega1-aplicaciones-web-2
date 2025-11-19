
import 'dotenv/config'; // Para leer la URI de conexión
import mongoose from 'mongoose';
import { readFile } from 'node:fs/promises';
import { Product } from './db/models/Product.js';
import { User } from './db/models/User.js';
import { Sale } from './db/models/Sale.js';
import { hashPassword } from './utils/auth.js';

const seedDatabase = async () => {
  try {
    // 1. Conexion
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🌱 Conectado a MongoDB para siembra...');

    // 2. Borrar datos viejos (Limpiar la DB para empezar de cero)
    await Product.deleteMany({});
    await User.deleteMany({});
    await Sale.deleteMany({});
    console.log('🧹 Base de datos limpiada.');

    // 3. Leer archivos JSON
    const productosRaw = JSON.parse(await readFile('./productos.json', 'utf-8'));
    const usuariosRaw = JSON.parse(await readFile('./usuarios.json', 'utf-8'));

    // 4. Insertar Productos 
    await Product.insertMany(productosRaw);
    console.log(`✅ ${productosRaw.length} productos insertados.`);

    // 5. Insertar Usuarios 
    const usuariosEncriptados = await Promise.all(usuariosRaw.map(async (u) => {
      return {
        ...u,
        contraseña: await hashPassword(u.contraseña) // Encripta la pass del JSON
      };
    }));

    await User.insertMany(usuariosEncriptados);
    console.log(`✅ ${usuariosEncriptados.length} usuarios insertados.`);

    console.log('🚀 ¡Semillero finalizado con éxito!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en el semillero:', error);
    process.exit(1);
  }
};

seedDatabase();