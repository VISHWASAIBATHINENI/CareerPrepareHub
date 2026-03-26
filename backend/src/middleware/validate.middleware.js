import { ApiError } from './error.middleware.js';

const buildValidationMiddleware = (schema, target = 'body') => (req, _res, next) => {
  const { value, error } = schema.validate(req[target], {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const details = error.details.map((item) => item.message);
    throw new ApiError('Validation failed', 400, 'VALIDATION_ERROR', details);
  }

  req[target] = value;
  return next();
};

export const validateBody = (schema) => buildValidationMiddleware(schema, 'body');
export const validateQuery = (schema) => buildValidationMiddleware(schema, 'query');
export const validateParams = (schema) => buildValidationMiddleware(schema, 'params');