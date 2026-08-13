import express from 'express';

import {
  getAptitudeQuestionById,
  getAptitudeQuestions,
  getHardAptitudeQuestions,
} from '../controllers/question.controller.js';
import { optionalAuth, protect } from '../middleware/auth.middleware.js';
import { validateParams, validateQuery } from '../middleware/validate.middleware.js';
import { aptitudeQuerySchema, idParamSchema, paginationQuerySchema } from '../validation/question.validation.js';

const router = express.Router();

router.get('/', validateQuery(aptitudeQuerySchema), getAptitudeQuestions);
router.get('/hard', protect, validateQuery(paginationQuerySchema), getHardAptitudeQuestions);
router.get('/:id', optionalAuth, validateParams(idParamSchema), getAptitudeQuestionById);

export default router;