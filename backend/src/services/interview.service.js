/**
 * interview.service.js
 *
 * Core business logic for the mock interview system.
 *
 * SECURITY CRITICAL:
 * - Every query includes { userId: req.user.id } to prevent cross-user access.
 * - Resume context comes from the authenticated user only — never from client body.
 * - pdfResumeContext (from PDF upload) is used for the session but NOT stored in DB
 *   beyond what's needed for the session (we store it in session.resumeContext field).
 *
 * Architecture:
 * User → InterviewSession (userId indexed) → InterviewMessage (sessionId + userId)
 */

import mongoose from 'mongoose';
import { ApiError } from '../middleware/error.middleware.js';
import { InterviewSession, InterviewMessage } from '../models/interview.model.js';
import { getUserResume } from './user.service.js';
import { generateNextQuestion, generateInterviewReport } from './aiInterviewer.service.js';
import logger from '../logger/index.js';

/* ─────────────────────────────────────────────────
   Helpers
───────────────────────────────────────────────── */
const toOid = (id, label = 'ID') => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(`Invalid ${label}: ${id}`, 400, 'INVALID_ID');
  }
  return new mongoose.Types.ObjectId(id);
};

/**
 * Find a session that belongs to the given user.
 * CRITICAL: always passes both _id and userId to prevent cross-user access.
 */
const findSessionForUser = async (sessionId, userId) => {
  const session = await InterviewSession.findOne({
    _id: toOid(sessionId, 'sessionId'),
    userId: toOid(userId, 'userId'),
  });
  if (!session) {
    throw new ApiError('Interview session not found', 404, 'SESSION_NOT_FOUND');
  }
  return session;
};

/**
 * Resolve the resume context for a session.
 * Priority:
 * 1. pdfResumeContext from a fresh PDF upload (most specific)
 * 2. User's stored resumeData from profile
 * 3. Empty string (no resume)
 */
const resolveResumeContext = async (userId, useResume, pdfResumeContext = '') => {
  if (pdfResumeContext && pdfResumeContext.trim().length > 50) {
    return pdfResumeContext.trim();
  }
  if (useResume) {
    return getUserResume(userId);
  }
  return '';
};

/* ─────────────────────────────────────────────────
   createSession — POST /api/interviews
   Creates the session, fetches optional resume,
   calls AI for the first question, stores it, and
   returns everything needed for the chat UI.
───────────────────────────────────────────────── */
export const createSession = async (userId, {
  interviewType,
  mode = 'text',
  selectedTopics,
  difficulty,
  questionLimit,
  useResume,
  pdfResumeContext = '',
}) => {
  const userOid = toOid(userId, 'userId');

  // Validate that resume-based types actually have resume context
  const needsResume = interviewType === 'Resume Based' || interviewType === 'Resume + Technical';

  // Resolve resume context
  const resumeContext = await resolveResumeContext(userId, useResume || needsResume, pdfResumeContext);

  if (needsResume && resumeContext.length < 50) {
    throw new ApiError(
      'Resume content is required for this interview type. Please upload your resume PDF or paste your resume information.',
      400,
      'RESUME_REQUIRED',
    );
  }

  // Create the session document
  const session = await InterviewSession.create({
    userId: userOid,
    interviewType,
    mode: mode || 'text',
    selectedTopics: selectedTopics || [],
    difficulty: difficulty || 'Intermediate',
    questionLimit: questionLimit || 10,
    useResume: Boolean(useResume || needsResume),
    currentQuestionNumber: 0,
    status: 'in_progress',
    startedAt: new Date(),
    report: null,
  });

  if (resumeContext) {
    await InterviewSession.findByIdAndUpdate(session._id, {
      'report': { _resumeContext: resumeContext },
    });
  }

  let aiResult;
  try {
    aiResult = await generateNextQuestion({
      interviewType,
      selectedTopics: selectedTopics || [],
      difficulty: difficulty || 'Intermediate',
      questionLimit: questionLimit || 10,
      currentQuestionNumber: 0,
      resumeContext,
      previousQuestions: [],
      conversationHistory: [],
      candidateAnswer: '',
    });
  } catch (err) {
    await InterviewSession.findByIdAndUpdate(session._id, { status: 'abandoned' });
    throw err;
  }

  const message = await InterviewMessage.create({
    sessionId: session._id,
    userId: userOid,
    role: 'interviewer',
    content: aiResult.nextQuestion,
    questionNumber: 1,
    topic: aiResult.topic,
    difficulty: aiResult.difficulty,
    mode: mode || 'text',
    evaluation: null,
  });

  await InterviewSession.findByIdAndUpdate(session._id, {
    currentQuestionNumber: 1,
  });

  logger.info(`Interview session created: ${session._id} for user ${userId} (type: ${interviewType}, mode: ${mode})`);

  return {
    sessionId: String(session._id),
    interviewType: session.interviewType,
    mode: session.mode || 'text',
    selectedTopics: session.selectedTopics,
    difficulty: session.difficulty,
    questionLimit: session.questionLimit,
    useResume: session.useResume,
    currentQuestionNumber: 1,
    status: session.status,
    firstQuestion: {
      messageId: String(message._id),
      content: aiResult.nextQuestion,
      questionNumber: 1,
      topic: aiResult.topic,
      difficulty: aiResult.difficulty,
    },
  };
};

/* ─────────────────────────────────────────────────
   getSession — GET /api/interviews/:sessionId
   Returns session config + all messages (for page restore).
   Strips evaluation data from messages so it stays internal.
───────────────────────────────────────────────── */
export const getSession = async (userId, sessionId) => {
  const session = await findSessionForUser(sessionId, userId);

  const messages = await InterviewMessage.find({ sessionId: session._id })
    .sort({ createdAt: 1 })
    .lean();

  return {
    sessionId: String(session._id),
    interviewType: session.interviewType,
    mode: session.mode || 'text',
    selectedTopics: session.selectedTopics,
    difficulty: session.difficulty,
    questionLimit: session.questionLimit,
    useResume: session.useResume,
    currentQuestionNumber: session.currentQuestionNumber,
    status: session.status,
    startedAt: session.startedAt,
    messages: messages.map((m) => ({
      messageId: String(m._id),
      role: m.role,
      content: m.content,
      questionNumber: m.questionNumber,
      topic: m.topic,
      difficulty: m.difficulty,
      mode: m.mode || session.mode || 'text',
      createdAt: m.createdAt,
    })),
  };
};

export const listSessions = async (userId) => {
  const userOid = toOid(userId, 'userId');
  const sessions = await InterviewSession.find({ userId: userOid })
    .sort({ createdAt: -1 })
    .lean();

  return sessions.map((s) => ({
    sessionId: String(s._id),
    interviewType: s.interviewType,
    mode: s.mode || 'text',
    selectedTopics: s.selectedTopics,
    difficulty: s.difficulty,
    questionLimit: s.questionLimit,
    currentQuestionNumber: s.currentQuestionNumber,
    status: s.status,
    overallScore: s.overallScore,
    startedAt: s.startedAt,
    endedAt: s.endedAt,
    createdAt: s.createdAt,
  }));
};

/* ─────────────────────────────────────────────────
   submitMessage — POST /api/interviews/:sessionId/messages
   Receives candidate's answer, calls AI for next question,
   stores both messages, and returns the next question.
───────────────────────────────────────────────── */
export const submitMessage = async (userId, sessionId, { answer }) => {
  const session = await findSessionForUser(sessionId, userId);

  if (session.status !== 'in_progress') {
    throw new ApiError(
      'This interview session is no longer active',
      409,
      'SESSION_NOT_ACTIVE',
    );
  }

  if (session.currentQuestionNumber >= session.questionLimit) {
    throw new ApiError(
      'This interview has reached its question limit. Please end the interview.',
      409,
      'QUESTION_LIMIT_REACHED',
    );
  }

  const userOid = toOid(userId, 'userId');

  // Fetch existing messages to build conversation history
  const existingMessages = await InterviewMessage.find({ sessionId: session._id })
    .sort({ createdAt: 1 })
    .lean();

  // Build OpenAI conversation history from stored messages
  const conversationHistory = existingMessages.map((m) => ({
    role: m.role === 'interviewer' ? 'assistant' : 'user',
    content: m.content,
  }));

  // Extract previously asked question texts (to avoid repeats)
  const previousQuestions = existingMessages
    .filter((m) => m.role === 'interviewer')
    .map((m) => m.content);

  // Resolve resume context:
  // For PDF-uploaded sessions, resume context was stored in session.report._resumeContext
  let resumeContext = '';
  if (session.useResume) {
    // Check if we have PDF resume context stored in session
    const storedResumeContext = session.report?._resumeContext;
    if (storedResumeContext && typeof storedResumeContext === 'string' && storedResumeContext.length > 50) {
      resumeContext = storedResumeContext;
    } else {
      // Fall back to user's stored text resume
      resumeContext = await getUserResume(userId);
    }
  }

  const nextQuestionNumber = session.currentQuestionNumber + 1;

  // Call AI — evaluate current answer and get next question
  const aiResult = await generateNextQuestion({
    interviewType: session.interviewType,
    selectedTopics: session.selectedTopics,
    difficulty: session.difficulty,
    questionLimit: session.questionLimit,
    currentQuestionNumber: session.currentQuestionNumber,
    resumeContext,
    previousQuestions,
    conversationHistory,
    candidateAnswer: answer,
  });

  // Store the candidate's answer (with internal evaluation)
  await InterviewMessage.create({
    sessionId: session._id,
    userId: userOid,
    role: 'candidate',
    content: answer.trim(),
    questionNumber: session.currentQuestionNumber,
    topic: existingMessages.filter((m) => m.role === 'interviewer').at(-1)?.topic || '',
    difficulty: '',
    mode: session.mode || 'text',
    evaluation: aiResult.evaluation,
  });

  const isLastQuestion = nextQuestionNumber >= session.questionLimit;

  let nextMessage = null;
  if (!isLastQuestion) {
    nextMessage = await InterviewMessage.create({
      sessionId: session._id,
      userId: userOid,
      role: 'interviewer',
      content: aiResult.nextQuestion,
      questionNumber: nextQuestionNumber,
      topic: aiResult.topic,
      difficulty: aiResult.difficulty,
      mode: session.mode || 'text',
      evaluation: null,
    });

    // Update session question counter
    await InterviewSession.findByIdAndUpdate(session._id, {
      currentQuestionNumber: nextQuestionNumber,
    });
  }

  logger.info(
    `Interview ${sessionId}: Q${session.currentQuestionNumber} answered by user ${userId}`,
  );

  return {
    nextQuestion: isLastQuestion ? null : {
      messageId: String(nextMessage._id),
      content: aiResult.nextQuestion,
      questionNumber: nextQuestionNumber,
      topic: aiResult.topic,
      difficulty: aiResult.difficulty,
    },
    currentQuestionNumber: nextQuestionNumber,
    isInterviewComplete: isLastQuestion,
    questionLimit: session.questionLimit,
  };
};

/* ─────────────────────────────────────────────────
   endSession — POST /api/interviews/:sessionId/end
   Ends the interview, generates AI report, stores it.
───────────────────────────────────────────────── */
export const endSession = async (userId, sessionId) => {
  const session = await findSessionForUser(sessionId, userId);

  if (session.status === 'completed') {
    // Already ended — just return the stored report
    return {
      sessionId: String(session._id),
      status: session.status,
      overallScore: session.overallScore,
      report: session.report,
    };
  }

  const now = new Date();

  // Fetch all messages with evaluations for report generation
  const messages = await InterviewMessage.find({ sessionId: session._id })
    .sort({ createdAt: 1 })
    .lean();

  // Resolve resume context for report
  let resumeContext = '';
  if (session.useResume) {
    const storedResumeContext = session.report?._resumeContext;
    if (storedResumeContext && typeof storedResumeContext === 'string' && storedResumeContext.length > 50) {
      resumeContext = storedResumeContext;
    } else {
      resumeContext = await getUserResume(userId);
    }
  }

  // Generate the report via AI
  const report = await generateInterviewReport({
    interviewType: session.interviewType,
    selectedTopics: session.selectedTopics,
    difficulty: session.difficulty,
    messages,
    resumeContext,
  });

  // Persist completed state (report replaces the temporary _resumeContext storage)
  await InterviewSession.findByIdAndUpdate(session._id, {
    status: 'completed',
    endedAt: now,
    overallScore: report.overallScore,
    report,
  });

  logger.info(`Interview session ${sessionId} completed for user ${userId}. Score: ${report.overallScore}`);

  return {
    sessionId: String(session._id),
    status: 'completed',
    overallScore: report.overallScore,
    report,
  };
};

/* ─────────────────────────────────────────────────
   getReport — GET /api/interviews/:sessionId/report
   Returns the stored report for a completed session.
───────────────────────────────────────────────── */
export const getReport = async (userId, sessionId) => {
  const session = await findSessionForUser(sessionId, userId);

  if (session.status !== 'completed') {
    throw new ApiError(
      'This interview has not been completed yet',
      409,
      'INTERVIEW_NOT_COMPLETED',
    );
  }

  // Return messages without internal evaluation for the conversation view
  const messages = await InterviewMessage.find({ sessionId: session._id })
    .sort({ createdAt: 1 })
    .lean();

  return {
    sessionId: String(session._id),
    interviewType: session.interviewType,
    selectedTopics: session.selectedTopics,
    difficulty: session.difficulty,
    questionLimit: session.questionLimit,
    overallScore: session.overallScore,
    startedAt: session.startedAt,
    endedAt: session.endedAt,
    report: session.report,
    // In the report view, show full evaluation for each answer
    messages: messages.map((m) => ({
      messageId: String(m._id),
      role: m.role,
      content: m.content,
      questionNumber: m.questionNumber,
      topic: m.topic,
      difficulty: m.difficulty,
      // Only include evaluation for candidate messages, and only in the report
      evaluation: m.role === 'candidate' ? m.evaluation : null,
      createdAt: m.createdAt,
    })),
  };
};
