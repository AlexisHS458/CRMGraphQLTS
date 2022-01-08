"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Usuario_1 = require("../models/Usuario");
const Producto_1 = require("../models/Producto");
const Cliente_1 = require("../models/Cliente");
const Pedido_1 = require("../models/Pedido");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crearToken = (usuario, secreta, expireIn) => {
    const { id, email, nombre, apellido } = usuario;
    return jsonwebtoken_1.default.sign({ id, email, nombre, apellido }, secreta, {
        expiresIn: expireIn,
    });
};
//resolvers
const resolvers = {
    Query: {
        obtenerUsuario: async (_, { token }) => {
            const usuarioId = await jsonwebtoken_1.default.verify(token, process.env.SECRETA);
            return usuarioId;
        },
        obtenerProductos: async () => {
            try {
                const productos = await Producto_1.ProductoModel.find({});
                return productos;
            }
            catch (error) {
                console.log(error);
            }
        },
        obtenerProducto: async (_, { id }) => {
            const producto = await Producto_1.ProductoModel.findById(id);
            if (!producto) {
                throw new Error("Producto no encontrado");
            }
            return producto;
        },
        obtenerClientes: async () => {
            try {
                const clientes = await Cliente_1.ClienteModel.find({});
                return clientes;
            }
            catch (error) {
                console.log(error);
            }
        },
        obtenerClientesVendedor: async (_, {}, ctx) => {
            try {
                const clientes = await Cliente_1.ClienteModel.find({
                    vendedor: ctx.usuario.id.toString(),
                });
                return clientes;
            }
            catch (error) {
                console.log(error);
            }
        },
        obtenerCliente: async (_, { id }, ctx) => {
            //Revisar si el cliente existe o no
            const cliente = await Cliente_1.ClienteModel.findById(id);
            if (!cliente) {
                throw new Error("Cliente no encontrado");
            }
            //Quien lo creo puede verlo
            if (cliente.vendedor.toString() !== ctx.usuario.id) {
                throw new Error("No tienes credenciales");
            }
            return cliente;
        },
        obtenerPedidos: async () => {
            try {
                const pedidos = await Pedido_1.PedidoModel.find({});
                return pedidos;
            }
            catch (error) {
                console.log(error);
            }
        },
        obtenerPedidosVendedor: async (_, {}, ctx) => {
            try {
                const pedidos = await Pedido_1.PedidoModel.find({ vendedor: ctx.usuario.id });
                return pedidos;
            }
            catch (error) {
                console.log(error);
            }
        },
        obtenerPedido: async (_, { id }, ctx) => {
            const pedido = await Pedido_1.PedidoModel.findById(id);
            if (!pedido) {
                throw new Error("Pedido no encontrado");
            }
            if (pedido.vendedor.toString() !== ctx.usuario.id) {
                throw new Error("No tienes las credenciales");
            }
            return pedido;
        },
        obtenerPedidosEstado: async (_, { estado }, ctx) => {
            const pedidos = await Pedido_1.PedidoModel.find({
                vendedor: ctx.usuario.id,
                estado: estado,
            });
            return pedidos;
        },
        mejoresClientes: async () => {
            const clientes = await Pedido_1.PedidoModel.aggregate([
                { $match: { estado: "COMPLETADO" } },
                { $group: { _id: "$cliente", total: { $sum: "$total" } } },
                {
                    $lookup: {
                        from: "clientes",
                        // localfield: "_id",
                        localField: "_id",
                        foreignField: "_id",
                        as: "cliente",
                    },
                },
                { $sort: { total: -1 } },
            ]);
            return clientes;
        },
        mejoresVendedores: async () => {
            const vendedores = await Pedido_1.PedidoModel.aggregate([
                {
                    $match: {
                        estado: "COMPLETADO",
                    },
                },
                { $group: { _id: "$vendedor", total: { $sum: "$total" } } },
                {
                    $lookup: {
                        from: "usuarios",
                        localField: "_id",
                        foreignField: "_id",
                        as: "vendedor",
                    },
                },
                {
                    $limit: 5,
                },
                {
                    $sort: { total: -1 },
                },
            ]);
            return vendedores;
        },
        buscarProducto: async (_, { texto }) => {
            const productos = await Producto_1.ProductoModel.find({
                $text: { $search: texto },
            });
            return productos;
        },
    },
    Mutation: {
        nuevoUsuario: async (_, { input }) => {
            const { email, password } = input;
            //Revisar si el usuario ya esta registrado
            const existeUsuario = await Usuario_1.UserModel.findOne({ email });
            if (existeUsuario) {
                throw new Error("El usuario ya existe");
            }
            //Hashear password
            console.log(input.password);
            console.log("hola: " + password);
            const salt = await bcryptjs_1.default.genSaltSync(10);
            input.password = await bcryptjs_1.default.hashSync(password, salt);
            try {
                //guardar en la base de datos
                const usuario = new Usuario_1.UserModel(input);
                usuario.save(); //guardarlo
                return usuario;
            }
            catch (error) {
                console.log(error);
            }
        },
        autenticarUsuario: async (_, { input }) => {
            const { email, password } = input;
            //si el usuario exiate
            const existeUsuario = await Usuario_1.UserModel.findOne({
                email,
            });
            if (!existeUsuario) {
                throw new Error("El usuario no existe");
            }
            //Revisar password
            const passwordCorrecto = await bcryptjs_1.default.compare(password, existeUsuario.password);
            if (!passwordCorrecto) {
                throw new Error("Tas wey la contraseña es incorrecta");
            }
            //Crear el token
            return {
                token: crearToken(existeUsuario, process.env.SECRETA, "24h"),
            };
        },
        nuevoProducto: async (_, { input }) => {
            try {
                const producto = new Producto_1.ProductoModel(input);
                //almacenar en la base
                const resultado = await producto.save();
                return resultado;
            }
            catch (error) {
                console.log(error);
            }
        },
        actualizarProducto: async (_, { input, id }) => {
            let producto = await Producto_1.ProductoModel.findById(id);
            if (!producto) {
                throw new Error("Producto no encontrado");
            }
            producto = await Producto_1.ProductoModel.findOneAndUpdate({ _id: id }, input, {
                new: true,
            });
            //Actualizar producto
            return producto;
        },
        eliminarProducto: async (_, { id }) => {
            let producto = await Producto_1.ProductoModel.findById(id);
            if (!producto) {
                throw new Error("Producto no encontrado");
            }
            producto = await Producto_1.ProductoModel.findOneAndDelete({ _id: id });
            //Actualizar producto
            return "producto eliminado";
        },
        nuevoCliente: async (_, { input }, ctx) => {
            const { email } = input;
            //Verificar si el cliente esta registrado
            const cliente = await Cliente_1.ClienteModel.findOne({ email });
            if (cliente) {
                throw new Error("Ese cliente ya esta regsitrado");
            }
            const nuevoCliente = new Cliente_1.ClienteModel(input);
            //asiganar el vendedor
            nuevoCliente.vendedor = ctx.usuario.id;
            //Guardar en la BD
            try {
                const result = await nuevoCliente.save();
                return result;
            }
            catch (error) {
                console.log(error);
            }
        },
        actualizarCliente: async (_, { id, input }, ctx) => {
            //Verificar si existe o no
            let cliente = await Cliente_1.ClienteModel.findById(id);
            if (!cliente) {
                throw new Error("Ese cliente no existe");
            }
            //Verificar si el vendedor es quien edita
            if (cliente.vendedor.toString() !== ctx.usuario.id) {
                throw new Error("No tienes credenciales");
            }
            //Actualizar cliente
            cliente = await Cliente_1.ClienteModel.findOneAndUpdate({ _id: id }, input, {
                new: true,
            });
            return cliente;
        },
        eliminarCliente: async (_, { id }, ctx) => {
            //Verificar si existe o no
            let cliente = await Cliente_1.ClienteModel.findById(id);
            if (!cliente) {
                throw new Error("Ese cliente no existe");
            }
            //Verificar si el vendedor es quien edita
            if (cliente.vendedor.toString() !== ctx.usuario.id) {
                throw new Error("No tienes credenciales");
            }
            //Eliminar cliente
            await Cliente_1.ClienteModel.findOneAndDelete({ _id: id });
            return "Cliente eliminado";
        },
        nuevoPedido: async (_, { input }, ctx) => {
            const { cliente } = input;
            //Existe cliente
            let clienteExiste = await Cliente_1.ClienteModel.findById(cliente);
            if (!clienteExiste) {
                throw new Error("Ese cliente no existe");
            }
            //Cliente es del vendedor
            if (clienteExiste.vendedor.toString() !== ctx.usuario.id) {
                throw new Error("No tienes credenciales");
            }
            //Revisar stock disponible
            for await (const articulo of input.pedido) {
                const { id } = articulo;
                const producto = await Producto_1.ProductoModel.findById(id);
                if (articulo.cantidad > producto.existencia) {
                    throw new Error(`El articulo: ${producto.nombre} excede la cantidad disponible`);
                }
            }
            //Crear pedido
            const nuevoPedido = new Pedido_1.PedidoModel(input);
            //Asignarle vendedor
            nuevoPedido.vendedor = ctx.usuario.id;
            //Guardar en la base
            const resultado = await nuevoPedido.save();
            return resultado;
        },
        actualizarPedido: async (_, { id, input }, ctx) => {
            const { cliente } = input;
            //Si el pedido existe
            const existePedido = await Pedido_1.PedidoModel.findById(id);
            if (!existePedido) {
                throw new Error("El pedido no existe");
            }
            //Si el cliente existe
            const existeCliente = await Cliente_1.ClienteModel.findById(cliente);
            if (!existeCliente) {
                throw new Error("El cliente no existe");
            }
            //CLiente pertenece al vendedor
            console.log("llego1");
            console.log(existeCliente.vendedor.toString());
            console.log(ctx);
            console.log(ctx.usuario.id);
            if (existeCliente.vendedor.toString() !== ctx.usuario.id) {
                throw new Error("No tienes las credenciales");
            }
            console.log("llego");
            //Revisar stock
            if (input.pedido) {
                for await (const articulo of input.pedido) {
                    const { id } = articulo;
                    const producto = await Producto_1.ProductoModel.findById(id);
                    if (articulo.cantidad > producto.existencia) {
                        throw new Error(`El articulo: ${producto.nombre} excede la cantidad disponible`);
                    }
                }
            }
            //Guardar pedido
            const resultado = await Pedido_1.PedidoModel.findOneAndUpdate({ _id: id }, input, {
                new: true,
            });
            return resultado;
        },
        eliminarPedido: async (_, { id }, ctx) => {
            //Verificar si el cliente existe
            const pedido = await Pedido_1.PedidoModel.findById(id);
            if (!pedido) {
                throw new Error("El pedido no existe");
            }
            //vericar si el vendedor es quien lo borra
            if (pedido.vendedor.toString() !== ctx.usuario.id) {
                throw new Error("NO tienes las credenciales");
            }
            //Eliminar de la base de datos
            await Pedido_1.PedidoModel.findOneAndDelete({ _id: id });
            return "Pedido Eliminado";
        },
    },
};
module.exports = resolvers;
