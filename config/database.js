import mongoose from 'mongoose';
import env from './env.js';

async function connectDB() {
  try {
    await mongoose.connect(env.MONGO_URI);
    console.log('db connected successfully.');
  } catch (error) {
    throw new Error('Error connecting db: ' + error.message);
  }
}

export default connectDB;
