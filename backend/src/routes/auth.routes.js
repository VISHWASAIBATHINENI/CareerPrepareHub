import express from 'express';

import { forgotPassword, login, resetPassword, signup } from '../controllers/auth.controller.js';
import { validateBody } from '../middleware/validate.middleware.js';
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema,
  signupSchema,
} from '../validation/auth.validation.js';

const router = express.Router();

router.post('/signup', validateBody(signupSchema), signup);
router.post('/login', validateBody(loginSchema), login);
router.post('/forgot-password', validateBody(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validateBody(resetPasswordSchema), resetPassword);

export default router;
