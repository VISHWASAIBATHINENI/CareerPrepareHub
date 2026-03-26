import { createLogger, format, transports } from 'winston';

import { env } from '../config/env.js';

const logger = createLogger({
  level: env.logLevel,
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json(),
  ),
  defaultMeta: {
    service: 'career-prep-hub-backend',
    env: env.nodeEnv,
  },
  transports: [
    new transports.Console({
      format: env.nodeEnv === 'development'
        ? format.combine(format.colorize(), format.simple())
        : format.json(),
    }),
  ],
});

export const morganStream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

export default logger;
