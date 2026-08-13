import express from 'express';

import { getProfile, getResume, updateResume } from '../controllers/user.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/profile', protect, getProfile);
router.get('/resume', protect, getResume);
router.put('/resume', protect, updateResume);

export default router;