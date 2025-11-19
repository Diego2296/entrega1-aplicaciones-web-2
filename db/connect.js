
import mongoose from 'mongoose';

// Usa process.env
const MONGO_URI = process.env.MONGO_URI;

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('🟢 Conectado exitosamente a MongoDB');
  } catch (error) {
    console.error('🔴 Error conectando a MongoDB:', error);
    process.exit(1); // Detener la app si no hay base de datos
  }
};