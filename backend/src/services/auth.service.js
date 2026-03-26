import Otp from '../models/otp.model.js';
import { env } from '../config/env.js';
import logger from '../logger/index.js';
import { ApiError } from '../middleware/error.middleware.js';
import { sendResetOtpEmail } from './mail.service.js';
import {
  createUser,
  findUserByEmail,
  findUserByEmailWithPassword,
  updatePasswordByEmail,
} from './user.service.js';
import generateToken from '../utils/generateToken.js';
import { generateOtp, hashOtp } from '../utils/otpGenerator.js';

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();

const toPublicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  isPaid: user.isPaid,
  role: user.role,
  createdAt: user.createdAt,
});

export const signup = async ({ name, email, password }) => {
  const normalizedEmail = normalizeEmail(email);
  const existing = await findUserByEmail(normalizedEmail);
  if (existing) throw new ApiError('Email already registered', 409, 'EMAIL_ALREADY_EXISTS');

  const user = await createUser({ name: String(name).trim(), email: normalizedEmail, password });

  return {
    token: generateToken(user),
    user: toPublicUser(user),
  };
};

export const login = async ({ email, password }) => {
  const normalizedEmail = normalizeEmail(email);
  const user = await findUserByEmailWithPassword(normalizedEmail);

  if (!user) {
    logger.warn(`Failed login attempt: ${normalizedEmail}`);
    throw new ApiError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }

  const valid = await user.comparePassword(password);
  if (!valid) {
    logger.warn(`Failed login attempt: ${normalizedEmail}`);
    throw new ApiError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
  }

  logger.info(`Successful login: ${normalizedEmail}`);

  return {
    token: generateToken(user),
    user: toPublicUser(user),
  };
};

export const forgotPassword = async ({ email }) => {
  const normalizedEmail = normalizeEmail(email);
  const user = await findUserByEmail(normalizedEmail);

  if (user) {
    const otp = generateOtp();
    const otpHash = hashOtp(otp);
    const expiresAt = new Date(Date.now() + (env.otpExpiryMinutes * 60 * 1000));

    await Otp.findOneAndUpdate(
      { email: normalizedEmail },
      {
        email: normalizedEmail,
        otpHash,
        expiresAt,
        attempts: 0,
        lockedUntil: null,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    await sendResetOtpEmail({ to: normalizedEmail, otp });
    logger.info(`Password reset OTP generated for ${normalizedEmail}`);
  }

  return {
    message: 'If the email exists, an OTP has been sent.',
  };
};

export const resetPassword = async ({ email, otp, password }) => {
  const normalizedEmail = normalizeEmail(email);
  const otpDoc = await Otp.findOne({ email: normalizedEmail });

  if (!otpDoc) {
    logger.warn(`Reset password failed (otp missing): ${normalizedEmail}`);
    throw new ApiError('OTP expired or invalid', 400, 'OTP_INVALID');
  }

  const now = Date.now();
  if (otpDoc.lockedUntil && otpDoc.lockedUntil.getTime() > now) {
    throw new ApiError('Too many invalid OTP attempts. Try again later.', 429, 'OTP_LOCKED');
  }

  if (otpDoc.expiresAt.getTime() < now) {
    throw new ApiError('OTP expired or invalid', 400, 'OTP_EXPIRED');
  }

  const incomingHash = hashOtp(otp);
  if (incomingHash !== otpDoc.otpHash) {
    otpDoc.attempts += 1;
    if (otpDoc.attempts >= env.otpMaxAttempts) {
      otpDoc.lockedUntil = new Date(now + (env.otpLockMinutes * 60 * 1000));
      await otpDoc.save();
      logger.warn(`OTP locked for ${normalizedEmail}`);
      throw new ApiError('Too many invalid OTP attempts. Try again later.', 429, 'OTP_LOCKED');
    }

    await otpDoc.save();
    logger.warn(`Invalid OTP attempt ${otpDoc.attempts} for ${normalizedEmail}`);
    throw new ApiError('OTP expired or invalid', 400, 'OTP_INVALID');
  }

  const updatedUser = await updatePasswordByEmail(normalizedEmail, password);
  if (!updatedUser) throw new ApiError('User not found', 404, 'USER_NOT_FOUND');

  await Otp.deleteOne({ email: normalizedEmail });
  logger.info(`Password reset successful for ${normalizedEmail}`);

  return {
    message: 'Password reset successful',
  };
};
