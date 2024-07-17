import mongoose from "mongoose";

async function connectMongoDB(dbUrl) {
  try {
    await mongoose.connect(dbUrl);
    console.log("Connect to db Successfully!!!");
  } catch (error) {
    console.log("Connect Failure!!!");
  }
}

export default connectMongoDB;
