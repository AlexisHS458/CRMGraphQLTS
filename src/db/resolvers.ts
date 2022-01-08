import { UserModel } from "../models/Usuario";
import { ProductoModel } from "../models/Producto";
import { ClienteModel } from "../models/Cliente";
import { PedidoModel } from "../models/Pedido";
import bcryptjs from "bcryptjs";
import jsonwebtoken from "jsonwebtoken";
const crearToken = (usuario: any, secreta: string, expireIn: string) => {
  const { id, email, nombre, apellido } = usuario;
  return jsonwebtoken.sign({ id, email, nombre, apellido }, secreta, {
    expiresIn: expireIn,
  });
};
//resolvers
const resolvers = {
  Query: {
    obtenerUsuario: async (_: any, { token }: any) => {
      const usuarioId = await jsonwebtoken.verify(token, process.env.SECRETA!);
      return usuarioId;
    },

    obtenerProductos: async () => {
      try {
        const productos = await ProductoModel.find({});
        return productos;
      } catch (error) {
        console.log(error);
      }
    },

    obtenerProducto: async (_: any, { id }: any) => {
      const producto = await ProductoModel.findById(id);
      if (!producto) {
        throw new Error("Producto no encontrado");
      }
      return producto;
    },

    obtenerClientes: async () => {
      try {
        const clientes = await ClienteModel.find({});
        return clientes;
      } catch (error) {
        console.log(error);
      }
    },
    obtenerClientesVendedor: async (_: any, {}: any, ctx: any) => {
      try {
        const clientes = await ClienteModel.find({
          vendedor: ctx.usuario.id.toString(),
        });
        return clientes;
      } catch (error) {
        console.log(error);
      }
    },
    obtenerCliente: async (_: any, { id }: any, ctx: any) => {
      //Revisar si el cliente existe o no
      const cliente = await ClienteModel.findById(id);
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
        const pedidos = await PedidoModel.find({});
        return pedidos;
      } catch (error) {
        console.log(error);
      }
    },
    obtenerPedidosVendedor: async (_: any, {}: any, ctx: any) => {
      try {
        const pedidos = await PedidoModel.find({ vendedor: ctx.usuario.id });
        return pedidos;
      } catch (error) {
        console.log(error);
      }
    },
    obtenerPedido: async (_: any, { id }: any, ctx: any) => {
      const pedido = await PedidoModel.findById(id);
      if (!pedido) {
        throw new Error("Pedido no encontrado");
      }

      if (pedido.vendedor.toString() !== ctx.usuario.id) {
        throw new Error("No tienes las credenciales");
      }
      return pedido;
    },
    obtenerPedidosEstado: async (_: any, { estado }: any, ctx: any) => {
      const pedidos = await PedidoModel.find({
        vendedor: ctx.usuario.id,
        estado: estado,
      });
      return pedidos;
    },
    mejoresClientes: async () => {
      const clientes = await PedidoModel.aggregate([
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
      const vendedores = await PedidoModel.aggregate([
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
    buscarProducto: async (_: any, { texto }: any) => {
      const productos = await ProductoModel.find({
        $text: { $search: texto },
      });
      return productos;
    },
  },
  Mutation: {
    nuevoUsuario: async (_: any, { input }: any) => {
      const { email, password } = input;
      //Revisar si el usuario ya esta registrado
      const existeUsuario = await UserModel.findOne({ email });
      if (existeUsuario) {
        throw new Error("El usuario ya existe");
      }

      //Hashear password
      console.log(input.password);
      console.log("hola: " + password);

      const salt = await bcryptjs.genSaltSync(10);
      input.password = await bcryptjs.hashSync(password, salt);

      try {
        //guardar en la base de datos
        const usuario = new UserModel(input);
        usuario.save(); //guardarlo
        return usuario;
      } catch (error) {
        console.log(error);
      }
    },
    autenticarUsuario: async (_: any, { input }: any) => {
      const { email, password } = input;
      //si el usuario exiate
      const existeUsuario = await UserModel.findOne({
        email,
      });

      if (!existeUsuario) {
        throw new Error("El usuario no existe");
      }

      //Revisar password
      const passwordCorrecto = await bcryptjs.compare(
        password,
        existeUsuario.password
      );
      if (!passwordCorrecto) {
        throw new Error("Tas wey la contraseña es incorrecta");
      }
      //Crear el token
      return {
        token: crearToken(existeUsuario, process.env.SECRETA!, "24h"),
      };
    },
    nuevoProducto: async (_: any, { input }: any) => {
      try {
        const producto = new ProductoModel(input);
        //almacenar en la base
        const resultado = await producto.save();
        return resultado;
      } catch (error) {
        console.log(error);
      }
    },
    actualizarProducto: async (_: any, { input, id }: any) => {
      let producto = await ProductoModel.findById(id);
      if (!producto) {
        throw new Error("Producto no encontrado");
      }
      producto = await ProductoModel.findOneAndUpdate({ _id: id }, input, {
        new: true,
      });

      //Actualizar producto
      return producto;
    },
    eliminarProducto: async (_: any, { id }: any) => {
      let producto = await ProductoModel.findById(id);
      if (!producto) {
        throw new Error("Producto no encontrado");
      }
      producto = await ProductoModel.findOneAndDelete({ _id: id });

      //Actualizar producto
      return "producto eliminado";
    },
    nuevoCliente: async (_: any, { input }: any, ctx: any) => {
      const { email } = input;
      //Verificar si el cliente esta registrado
      const cliente = await ClienteModel.findOne({ email });
      if (cliente) {
        throw new Error("Ese cliente ya esta regsitrado");
      }

      const nuevoCliente = new ClienteModel(input);
      //asiganar el vendedor
      nuevoCliente.vendedor = ctx.usuario.id;
      //Guardar en la BD
      try {
        const result = await nuevoCliente.save();
        return result;
      } catch (error) {
        console.log(error);
      }
    },
    actualizarCliente: async (_: any, { id, input }: any, ctx: any) => {
      //Verificar si existe o no
      let cliente = await ClienteModel.findById(id);
      if (!cliente) {
        throw new Error("Ese cliente no existe");
      }
      //Verificar si el vendedor es quien edita
      if (cliente.vendedor.toString() !== ctx.usuario.id) {
        throw new Error("No tienes credenciales");
      }
      //Actualizar cliente
      cliente = await ClienteModel.findOneAndUpdate({ _id: id }, input, {
        new: true,
      });
      return cliente;
    },
    eliminarCliente: async (_: any, { id }: any, ctx: any) => {
      //Verificar si existe o no
      let cliente = await ClienteModel.findById(id);
      if (!cliente) {
        throw new Error("Ese cliente no existe");
      }
      //Verificar si el vendedor es quien edita
      if (cliente.vendedor.toString() !== ctx.usuario.id) {
        throw new Error("No tienes credenciales");
      }

      //Eliminar cliente
      await ClienteModel.findOneAndDelete({ _id: id });
      return "Cliente eliminado";
    },
    nuevoPedido: async (_: any, { input }: any, ctx: any) => {
      const { cliente } = input;

      //Existe cliente
      let clienteExiste = await ClienteModel.findById(cliente);
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
        const producto = await ProductoModel.findById(id);
        if (articulo.cantidad > producto.existencia) {
          throw new Error(
            `El articulo: ${producto.nombre} excede la cantidad disponible`
          );
        }
      }

      //Crear pedido
      const nuevoPedido = new PedidoModel(input);
      //Asignarle vendedor
      nuevoPedido.vendedor = ctx.usuario.id;

      //Guardar en la base
      const resultado = await nuevoPedido.save();
      return resultado;
    },
    actualizarPedido: async (_: any, { id, input }: any, ctx: any) => {
      const { cliente } = input;
      //Si el pedido existe

      const existePedido = await PedidoModel.findById(id);
      if (!existePedido) {
        throw new Error("El pedido no existe");
      }
      //Si el cliente existe
      const existeCliente = await ClienteModel.findById(cliente);

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
          const producto = await ProductoModel.findById(id);
          if (articulo.cantidad > producto.existencia) {
            throw new Error(
              `El articulo: ${producto.nombre} excede la cantidad disponible`
            );
          }
        }
      }
      //Guardar pedido
      const resultado = await PedidoModel.findOneAndUpdate({ _id: id }, input, {
        new: true,
      });
      return resultado;
    },
    eliminarPedido: async (_: any, { id }: any, ctx: any) => {
      //Verificar si el cliente existe
      const pedido = await PedidoModel.findById(id);
      if (!pedido) {
        throw new Error("El pedido no existe");
      }

      //vericar si el vendedor es quien lo borra
      if (pedido.vendedor.toString() !== ctx.usuario.id) {
        throw new Error("NO tienes las credenciales");
      }

      //Eliminar de la base de datos
      await PedidoModel.findOneAndDelete({ _id: id });
      return "Pedido Eliminado";
    },
  },
};

module.exports = resolvers;
