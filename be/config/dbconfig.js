import mongoose from "mongoose";

async function connectMongoDB(dbUrl) {
  try {
    await mongoose.connect(dbUrl);
    // Kết nối thành công
    console.log("Connect to db Successfully!!!");
  } catch (error) {
    // Kết nối thất bại
    console.log("Connect Failure!!!");
  }
}

export default connectMongoDB;
