import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';

import { env } from './config/env.js';
import { morganStream } from './logger/index.js';
import { ApiError, errorHandler, notFoundHandler } from './middleware/error.middleware.js';
import { apiRateLimiter, authRateLimiter } from './middleware/rateLimit.middleware.js';
import aptitudeRoutes from './routes/aptitude.routes.js';
import authRoutes from './routes/auth.routes.js';
import codingRoutes from './routes/coding.routes.js';
import contentRoutes from './routes/content.routes.js';
import userRoutes from './routes/user.routes.js';

const app = express();
app.set('trust proxy', 1);

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    if (env.corsOrigins.length === 0 && env.nodeEnv !== 'production') {
      return callback(null, true);
    }

    if (env.corsOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new ApiError('Origin not allowed by CORS', 403, 'CORS_ORIGIN_DENIED'));
  },
  credentials: true,
};

app.use(helmet());
app.use(hpp());
app.use(cors(corsOptions));
app.use(morgan('combined', { stream: morganStream }));
app.use(express.json({ limit: env.requestBodyLimit }));
app.use(apiRateLimiter);

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'CareerPrepHub API is running',
  });
});

app.use('/api/auth', authRateLimiter, authRoutes);
app.use('/api/aptitude', aptitudeRoutes);
app.use('/api/coding', codingRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/user', userRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
