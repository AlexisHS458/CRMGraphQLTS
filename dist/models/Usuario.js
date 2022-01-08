"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const UsuariosSchema = new mongoose_1.default.Schema({
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
exports.UserModel = mongoose_1.default.model("Usuario", UsuariosSchema);
