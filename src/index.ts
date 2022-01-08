import { ApolloServer, gql } from "apollo-server-express";
import { ApolloServerPluginDrainHttpServer } from "apollo-server-core";
import express from "express";
import http from "http";
import jsonwebtoken from "jsonwebtoken";
const typeDefs = require("./db/schema");
const resolvers = require("./db/resolvers");
const connectDB = require("./config/db");

//Connectar a la base de datos
connectDB();

async function listen(port: number) {
  const app = express();
  const httpServer = http.createServer(app);

  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
      //  console.log(req.headers["authorization"]);
      const token = req.headers["authorization"] || "";
      if (token) {
        try {
          const usuario = jsonwebtoken.verify(token, process.env.SECRETA!);
          // console.log(usuario);
          return {
            usuario,
          };
        } catch (error) {
          console.log(error);
        }
      }
    },
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
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
  } catch (err) {
    console.error("💀 Error starting the node server", err);
  }
}

void main();
