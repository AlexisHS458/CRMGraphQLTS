import mongoose from "mongoose";
//const mongoose = require("mongoose");
require("dotenv").config({ path: "variables.env" });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_MONGO!, {});
    console.log("Ta bien no");
  } catch (error) {
    console.log("No ta bien");
    console.log(error);
    process.exit(1);
  }
};

module.exports = connectDB;
