import Joi from 'joi';

const VALID_INTERVIEW_TYPES = ['Technical', 'HR', 'Technical + HR', 'Resume Based', 'Resume + Technical'];
const VALID_DIFFICULTIES = ['Beginner', 'Intermediate', 'Advanced'];

export const createSessionSchema = Joi.object({
  interviewType: Joi.string()
    .valid(...VALID_INTERVIEW_TYPES)
    .required(),
  mode: Joi.string()
    .valid('text', 'voice')
    .default('text'),
  selectedTopics: Joi.array()
    .items(Joi.string().trim().max(60))
    .min(0)
    .max(20)
    .default([]),
  difficulty: Joi.string()
    .valid(...VALID_DIFFICULTIES)
    .default('Intermediate'),
  // Unlimited interview: frontend sends 50 (very large limit).
  // User ends the interview manually — backend honours the limit as a safety cap.
  questionLimit: Joi.number()
    .integer()
    .min(1)
    .max(50)
    .default(50),
  useResume: Joi.boolean().default(true),
});

export const submitMessageSchema = Joi.object({
  answer: Joi.string().trim().min(1).max(5000).required().messages({
    'string.empty': 'Answer cannot be empty',
    'string.min': 'Please provide an answer before submitting',
    'string.max': 'Answer is too long (max 5000 characters)',
    'any.required': 'Answer is required',
  }),
});
