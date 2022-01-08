"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductoModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const ProdcutosSchema = new mongoose_1.default.Schema({
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
exports.ProductoModel = mongoose_1.default.model("Producto", ProdcutosSchema);
