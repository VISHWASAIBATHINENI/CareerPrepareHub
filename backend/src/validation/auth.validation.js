import Joi from 'joi';

const passwordSchema = Joi.string()
  .min(8)
  .max(128)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).+$/)
  .messages({
    'string.pattern.base': 'password must include uppercase, lowercase, number and special character',
  });

export const signupSchema = Joi.object({
  name: Joi.string().trim().min(2).max(80).required(),
  email: Joi.string().trim().lowercase().email().required(),
  password: passwordSchema.required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  password: Joi.string().min(1).required(),
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
});

export const resetPasswordSchema = Joi.object({
  email: Joi.string().trim().lowercase().email().required(),
  otp: Joi.string().pattern(/^\d{6}$/).required(),
  password: passwordSchema.required(),
});
