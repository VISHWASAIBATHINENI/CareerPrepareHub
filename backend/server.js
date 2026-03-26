import app from './src/app.js';
import connectDB from './src/config/db.js';
import { env, validateEnv } from './src/config/env.js';
import logger from './src/logger/index.js';

const startServer = async () => {
  try {
    validateEnv();
    await connectDB();

    app.listen(env.port, () => {
      logger.info(`Backend running on http://localhost:${env.port}`);
    });
  } catch (error) {
    logger.error(`Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
