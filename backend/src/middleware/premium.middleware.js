import { ApiError } from './error.middleware.js';

export const requirePaidUser = (req, _res, next) => {
  if (!req.user) throw new ApiError('Authentication required', 401, 'AUTH_REQUIRED');

  if (!(req.user.isPaid || req.user.role === 'admin')) {
    throw new ApiError('Paid plan required to access this resource', 403, 'PAID_PLAN_REQUIRED');
  }

  return next();
};
