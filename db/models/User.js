import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  nombre: { type: String, required: true },
  apellido: String,
  email: { type: String, required: true, unique: true },
  contraseña: { type: String, required: true } // Aca se guarda el HASH, no el texto plano
});

export const User = mongoose.model('User', userSchema);