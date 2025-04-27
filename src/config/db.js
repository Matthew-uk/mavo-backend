import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// These two lines are needed because you're using "type": "module"
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env correctly no matter where you run from
dotenv.config({ path: path.resolve(__dirname, './../../.env') });

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      'mongodb+srv://mavo:pa$$w0rd@mavo.vipv5mu.mongodb.net/mavo-app',
    );
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    throw error;
  }
};

export default connectDB;
