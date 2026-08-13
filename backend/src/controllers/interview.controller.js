/**
 * interview.controller.js
 *
 * Handles all interview API endpoints including:
 * - PDF resume upload (multipart/form-data) for Resume Based / Resume + Technical
 * - Session creation, message submission, and report generation
 *
 * SECURITY: Every endpoint uses req.user.id from verified JWT.
 * User A can NEVER access User B's sessions.
 */

import asyncHandler from '../middleware/asyncHandler.middleware.js';
import { sendSuccess } from '../utils/apiResponse.js';
import * as interviewService from '../services/interview.service.js';
import { extractTextFromPDF, validatePDFFile } from '../services/resumeParser.service.js';

/* ─────────────────────────────────────────────────
   POST /api/interviews
   Create a new interview session + get first question.

   Supports two content types:
   1. application/json — for Technical / HR (no PDF)
   2. multipart/form-data — for Resume Based / Resume + Technical (with PDF)
───────────────────────────────────────────────── */
export const createSession = asyncHandler(async (req, res) => {
  const body = req.body;
  const interviewType = body.interviewType;

  // Parse topics — multer sends them as JSON string in form data
  let selectedTopics = [];
  if (typeof body.selectedTopics === 'string') {
    try {
      selectedTopics = JSON.parse(body.selectedTopics);
    } catch {
      selectedTopics = body.selectedTopics ? [body.selectedTopics] : [];
    }
  } else if (Array.isArray(body.selectedTopics)) {
    selectedTopics = body.selectedTopics;
  }

  // Extract PDF resume if uploaded (for Resume Based / Resume + Technical)
  let pdfResumeContext = '';
  if (req.file) {
    validatePDFFile(req.file);
    pdfResumeContext = await extractTextFromPDF(req.file.buffer);
  }

  const data = await interviewService.createSession(req.user.id, {
    interviewType,
    mode: body.mode || 'text',
    selectedTopics,
    difficulty: body.difficulty || 'Intermediate',
    questionLimit: Number(body.questionLimit) || 10,
    useResume: body.useResume !== 'false' && body.useResume !== false,
    pdfResumeContext, // extracted PDF text passed directly (not stored in user model)
  });

  return sendSuccess(res, {
    statusCode: 201,
    message: 'Interview session created',
    data,
  });
});

/* ─────────────────────────────────────────────────
   GET /api/interviews
   List all interview sessions for the authenticated user.
───────────────────────────────────────────────── */
export const listSessions = asyncHandler(async (req, res) => {
  const data = await interviewService.listSessions(req.user.id);
  return sendSuccess(res, {
    message: 'Interview sessions fetched successfully',
    data,
  });
});

/* ─────────────────────────────────────────────────
   GET /api/interviews/:sessionId
   Get a single session with all messages (page restore).
───────────────────────────────────────────────── */
export const getSession = asyncHandler(async (req, res) => {
  const data = await interviewService.getSession(req.user.id, req.params.sessionId);
  return sendSuccess(res, {
    message: 'Interview session fetched successfully',
    data,
  });
});

/* ─────────────────────────────────────────────────
   POST /api/interviews/:sessionId/messages
   Submit candidate answer, get next AI question.
───────────────────────────────────────────────── */
export const submitMessage = asyncHandler(async (req, res) => {
  const data = await interviewService.submitMessage(
    req.user.id,
    req.params.sessionId,
    req.body,
  );
  return sendSuccess(res, {
    message: 'Answer submitted successfully',
    data,
  });
});

/* ─────────────────────────────────────────────────
   POST /api/interviews/:sessionId/end
   End the interview and generate the final report.
───────────────────────────────────────────────── */
export const endSession = asyncHandler(async (req, res) => {
  const data = await interviewService.endSession(req.user.id, req.params.sessionId);
  return sendSuccess(res, {
    message: 'Interview completed successfully',
    data,
  });
});

/* ─────────────────────────────────────────────────
   GET /api/interviews/:sessionId/report
   Get the final performance report.
───────────────────────────────────────────────── */
export const getReport = asyncHandler(async (req, res) => {
  const data = await interviewService.getReport(req.user.id, req.params.sessionId);
  return sendSuccess(res, {
    message: 'Report fetched successfully',
    data,
  });
});
