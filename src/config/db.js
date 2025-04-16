import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect("mongodb+srv://mavo:pa$$w0rd@mavo.vipv5mu.mongodb.net/mavo-app");
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    throw error;
  }
};

export default connectDB;
