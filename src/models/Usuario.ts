import mongoose from "mongoose";

const UsuariosSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true,
    trim: true,
  },
  apellido: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, unique: true },
  password: { type: String, required: true, trim: true },
  creado: { type: Date, default: Date.now() },
});

export const UserModel = mongoose.model("Usuario", UsuariosSchema);
