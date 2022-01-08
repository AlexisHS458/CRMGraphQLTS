"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PedidoModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const ProductoSchema = new mongoose_1.default.Schema({
    pedido: {
        type: Array,
        required: true,
    },
    total: {
        type: Number,
        required: true,
    },
    cliente: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        required: true,
        ref: "Cliente",
    },
    vendedor: {
        type: mongoose_1.default.Schema.Types.ObjectId,
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
exports.PedidoModel = mongoose_1.default.model("Pedido", ProductoSchema);
