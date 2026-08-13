import app from '../backend/src/app.js';
import connectDB from '../backend/src/config/db.js';

export default async function handler(req, res) {
  try {
    await connectDB();
  } catch (error) {
    console.error('MongoDB serverless connection error:', error.message);
  }
  return app(req, res);
}
