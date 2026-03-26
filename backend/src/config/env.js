import dotenv from 'dotenv';

dotenv.config();

const parseOrigins = (value = '') => value
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

export const env = Object.freeze({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  jwtAlgorithm: process.env.JWT_ALGORITHM || 'HS256',
  otpExpiryMinutes: Number(process.env.OTP_EXPIRY_MINUTES || 10),
  otpMaxAttempts: Number(process.env.OTP_MAX_ATTEMPTS || 5),
  otpLockMinutes: Number(process.env.OTP_LOCK_MINUTES || 15),
  smtpHost: process.env.SMTP_HOST,
  smtpPort: Number(process.env.SMTP_PORT || 587),
  smtpUser: process.env.SMTP_USER,
  smtpPass: process.env.SMTP_PASS,
  emailFrom: process.env.EMAIL_FROM || 'no-reply@careerprephub.com',
  corsOrigins: parseOrigins(process.env.CORS_ORIGINS || ''),
  requestBodyLimit: process.env.REQUEST_BODY_LIMIT || '100kb',
  logLevel: process.env.LOG_LEVEL || 'info',
});

const requiredVars = ['mongoUri', 'jwtSecret'];

export const validateEnv = () => {
  const missing = requiredVars.filter((key) => !env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};
