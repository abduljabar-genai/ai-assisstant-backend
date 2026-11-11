import mongoose from 'mongoose';
import env from './env.js';

async function connectDB() {
  try {
    await mongoose.connect("mongodb+srv://abduljabar:LtkPRFFz01DAuJYW@cluster0.9wiwffg.mongodb.net/");
    console.log('db connected successfully.');
  } catch (error) {
    throw new Error('Error connecting db: ' + error.message);
  }
}

export default connectDB;
