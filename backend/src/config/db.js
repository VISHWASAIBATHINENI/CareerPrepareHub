import dns from 'node:dns';
import mongoose from 'mongoose';
import { env } from './env.js';
import logger from '../logger/index.js';

// Use reliable public DNS servers for SRV resolution (fixes Node.js
// default resolver failing to look up MongoDB Atlas SRV records).
dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4']);

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  const mongoURI = env.mongoUri;

  if (!mongoURI) {
    throw new Error('MONGODB_URI is missing in environment variables');
  }

  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(mongoURI, opts).then((mongooseInstance) => {
      logger.info('MongoDB connected');
      return mongooseInstance;
    }).catch((err) => {
      cached.promise = null;
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
};

export default connectDB;
