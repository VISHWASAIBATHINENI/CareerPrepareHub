import Joi from 'joi';

const positiveInt = Joi.number().integer().min(1);

export const paginationQuerySchema = Joi.object({
  page: positiveInt.default(1),
  limit: positiveInt.max(100).default(10),
}).unknown(true);

export const aptitudeQuerySchema = Joi.object({
  page: positiveInt.default(1),
  limit: positiveInt.max(100).default(10),
  topic: Joi.string().trim().max(80),
  difficulty: Joi.string().valid('easy', 'medium', 'hard'),
}).unknown(false);

export const codingQuerySchema = Joi.object({
  page: positiveInt.default(1),
  limit: positiveInt.max(100).default(10),
  difficulty: Joi.string().valid('easy', 'medium', 'hard'),
  company: Joi.string().trim().max(80),
  topic: Joi.string().trim().max(80),
  search: Joi.string().trim().max(120),
}).unknown(false);

export const idParamSchema = Joi.object({
  id: Joi.string().hex().length(24).required(),
});
