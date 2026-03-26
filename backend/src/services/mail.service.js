import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import logger from '../logger/index.js';

const buildTransporter = () => {
  const hasSmtpConfig = env.smtpHost && env.smtpPort && env.smtpUser && env.smtpPass;

  if (!hasSmtpConfig) {
    return null;
  }

  return nodemailer.createTransport({
    host: env.smtpHost,
    port: Number(env.smtpPort),
    secure: Number(env.smtpPort) === 465,
    auth: {
      user: env.smtpUser,
      pass: env.smtpPass,
    },
  });
};

export const sendResetOtpEmail = async ({ to, otp }) => {
  const transporter = buildTransporter();

  const subject = 'CareerPrepHub Password Reset OTP';
  const text = `Your OTP for resetting password is ${otp}. It expires in 10 minutes.`;

  if (!transporter) {
    logger.info(`[MAIL_STUB] OTP email skipped (no SMTP). Recipient: ${to}`);
    return;
  }

  await transporter.sendMail({
    from: env.emailFrom,
    to,
    subject,
    text,
  });
};