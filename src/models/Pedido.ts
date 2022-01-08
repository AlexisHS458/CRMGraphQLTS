import mongoose from "mongoose";

const ProductoSchema = new mongoose.Schema({
  pedido: {
    type: Array,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
  cliente: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Cliente",
  },
  vendedor: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Usuario",
  },
  estado: {
    type: String,
    default: "PENDIENTE",
  },
  creado: {
    type: Date,
    default: Date.now(),
  },
});

export const PedidoModel = mongoose.model("Pedido", ProductoSchema);
