import jwt from 'jsonwebtoken';

import { env } from '../config/env.js';
import { ApiError } from './error.middleware.js';

const extractToken = (header = '') => (header.startsWith('Bearer ') ? header.slice(7) : null);

export const optionalAuth = (req, _res, next) => {
  const token = extractToken(req.headers.authorization || '');
  if (!token) return next();

  try {
    req.user = jwt.verify(token, env.jwtSecret, { algorithms: [env.jwtAlgorithm] });
  } catch (_err) {
    req.user = null;
  }

  return next();
};

export const protect = (req, _res, next) => {
  const token = extractToken(req.headers.authorization || '');
  if (!token) throw new ApiError('Authentication required', 401, 'AUTH_REQUIRED');

  try {
    req.user = jwt.verify(token, env.jwtSecret, { algorithms: [env.jwtAlgorithm] });
    return next();
  } catch (_err) {
    throw new ApiError('Invalid or expired token', 401, 'INVALID_TOKEN');
  }
};
