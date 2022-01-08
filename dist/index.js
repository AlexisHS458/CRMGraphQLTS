"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const apollo_server_express_1 = require("apollo-server-express");
const apollo_server_core_1 = require("apollo-server-core");
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const typeDefs = require("./db/schema");
const resolvers = require("./db/resolvers");
const connectDB = require("./config/db");
//Connectar a la base de datos
connectDB();
async function listen(port) {
    const app = (0, express_1.default)();
    const httpServer = http_1.default.createServer(app);
    const server = new apollo_server_express_1.ApolloServer({
        typeDefs,
        resolvers,
        context: ({ req }) => {
            //  console.log(req.headers["authorization"]);
            const token = req.headers["authorization"] || "";
            if (token) {
                try {
                    const usuario = jsonwebtoken_1.default.verify(token, process.env.SECRETA);
                    // console.log(usuario);
                    return {
                        usuario,
                    };
                }
                catch (error) {
                    console.log(error);
                }
            }
        },
        plugins: [(0, apollo_server_core_1.ApolloServerPluginDrainHttpServer)({ httpServer })],
    });
    await server.start();
    server.applyMiddleware({ app });
    return new Promise((resolve, reject) => {
        httpServer.listen(port).once("listening", resolve).once("error", reject);
    });
}
async function main() {
    try {
        await listen(4001);
        console.log("🚀 Server is ready at http://localhost:4001/graphql");
    }
    catch (err) {
        console.error("💀 Error starting the node server", err);
    }
}
void main();
