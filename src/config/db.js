import mongoose from 'mongoose';
import dotenv from 'dotenv'

dotenv.config()

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || "mongodb+srv://mavo:pa$$w0rd@mavo.vipv5mu.mongodb.net/mavo-app");
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    throw error;
  }
};

export default connectDB;
