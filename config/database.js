import mongoose from 'mongoose';
import env from './env.js';

async function connectDB() {
  try {
    const db_url=env.MONGO_URI
    await mongoose.connect(db_url);
    console.log('db connected successfully.');
  } catch (error) {
    throw new Error('Error connecting db: ' + error.message);
  }
}

export default connectDB;
