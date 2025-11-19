import mongoose from 'mongoose';

const saleSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  id_usuario: { type: Number, required: true },
  fecha: { type: Date, default: Date.now },
  total: Number,
  productos: [{
    id_producto: Number,
    cantidad: Number,
    precio_unitario: Number
  }]
});

export const Sale = mongoose.model('Sale', saleSchema);