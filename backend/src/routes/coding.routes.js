import express from 'express';

import { getCodingQuestionById, getCodingQuestions } from '../controllers/question.controller.js';
import { optionalAuth } from '../middleware/auth.middleware.js';
import { validateParams, validateQuery } from '../middleware/validate.middleware.js';
import { codingQuerySchema, idParamSchema } from '../validation/question.validation.js';

const router = express.Router();

router.get('/', optionalAuth, validateQuery(codingQuerySchema), getCodingQuestions);
router.get('/:id', optionalAuth, validateParams(idParamSchema), getCodingQuestionById);

export default router;