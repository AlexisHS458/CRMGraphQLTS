"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClienteModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const ClientesSchema = new mongoose_1.default.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true,
    },
    apellido: { type: String, required: true, trim: true },
    empresa: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    telefono: {
        type: String,
        trim: true,
    },
    creado: {
        type: Date,
        default: Date.now(),
    },
    vendedor: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: true,
        ref: "Usuario",
    },
});
exports.ClienteModel = mongoose_1.default.model("Cliente", ClientesSchema);
