import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  id: { type: Number, unique: true }, // Se mantiene el  ID numérico manual por compatibilidad
  nombre: { type: String, required: true },
  desc: String,
  precio: { type: Number, required: true },
  imagen: String,
  disponible: { type: Boolean, default: true },
  tipo: String
});

// Eliminar _id y __v al devolver JSON al frontend 
productSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret.id || ret._id; // Uso el ID numérico si existe
    delete ret._id;
    delete ret.__v;
  }
});

export const Product = mongoose.model('Product', productSchema);