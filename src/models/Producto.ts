import mongoose from "mongoose";

const ProdcutosSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true,
  },
  existencia: {
    type: Number,
    required: true,
    trim: true,
  },
  precio: {
    type: Number,
    required: true,
    trim: true,
  },
  creado: {
    type: Date,
    default: Date.now(),
  },
});

ProdcutosSchema.index({ nombre: "text" });

export const ProductoModel = mongoose.model("Producto", ProdcutosSchema);
