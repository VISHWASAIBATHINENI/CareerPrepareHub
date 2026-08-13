/**
 * interview.routes.js
 *
 * All interview API routes are protected by JWT authentication.
 * POST /api/interviews supports both:
 *   - application/json (Technical / HR interviews)
 *   - multipart/form-data (Resume Based / Resume + Technical — with PDF upload)
 *
 * SECURITY:
 * - multer stores files in memory (buffer) — never written to disk.
 * - File size limited to 5 MB.
 * - Only PDF mime type is accepted.
 * - userId always comes from req.user.id (JWT), never from client body.
 */

import express from 'express';
import multer from 'multer';
import { protect } from '../middleware/auth.middleware.js';
import { validateBody } from '../middleware/validate.middleware.js';
import {
  createSession,
  listSessions,
  getSession,
  submitMessage,
  endSession,
  getReport,
} from '../controllers/interview.controller.js';
import { submitMessageSchema } from '../validation/interview.validation.js';

const router = express.Router();

// Multer: memory storage, PDF only, max 4 MB
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 4 * 1024 * 1024 }, // 4 MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf' || file.originalname?.toLowerCase().endsWith('.pdf')) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are accepted'), false);
    }
  },
});

// All interview routes require JWT authentication
router.use(protect);

// POST supports both JSON and multipart/form-data (for PDF resume upload)
// upload.single('resume') handles optional PDF file field named "resume"
router.post('/', upload.single('resume'), createSession);
router.get('/', listSessions);
router.get('/:sessionId', getSession);
router.post('/:sessionId/messages', validateBody(submitMessageSchema), submitMessage);
router.post('/:sessionId/end', endSession);
router.get('/:sessionId/report', getReport);

export default router;
