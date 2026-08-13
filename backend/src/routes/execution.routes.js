import express from 'express';

import { debugCode, getSubmissionResult, runCode, submitCode } from '../controllers/execution.controller.js';
import { optionalAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/run', optionalAuth, runCode);
router.post('/submit', optionalAuth, submitCode);
router.post('/debug', optionalAuth, debugCode);
router.get('/submissions/:submissionId', optionalAuth, getSubmissionResult);

export default router;