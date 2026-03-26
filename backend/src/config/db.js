import mongoose from 'mongoose';
import { env } from './env.js';
import logger from '../logger/index.js';

const connectDB = async () => {
  const mongoURI = env.mongoUri;

  if (!mongoURI) {
    throw new Error('MONGODB_URI is missing in environment variables');
  }

  await mongoose.connect(mongoURI);
  logger.info('MongoDB connected');
};

export default connectDB;
