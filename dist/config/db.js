"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
//const mongoose = require("mongoose");
require("dotenv").config({ path: "variables.env" });
const connectDB = async () => {
    try {
        await mongoose_1.default.connect(process.env.DB_MONGO, {});
        console.log("Ta bien no");
    }
    catch (error) {
        console.log("No ta bien");
        console.log(error);
        process.exit(1);
    }
};
module.exports = connectDB;
