import mongoose from 'mongoose';
import 'dotenv/config';

const dbConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Mongodb connected successfully');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

export default dbConnection;
