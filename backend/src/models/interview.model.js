import mongoose from 'mongoose';

/* ─────────────────────────────────────────────────
   InterviewSession — one session per interview attempt
   userId is indexed for fast user-scoped queries.
   CRITICAL: every query must include { userId: req.user.id }
───────────────────────────────────────────────── */
const interviewSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    interviewType: {
      type: String,
      enum: ['Technical', 'HR', 'Technical + HR', 'Resume Based', 'Resume + Technical'],
      required: true,
    },
    mode: {
      type: String,
      enum: ['text', 'voice'],
      default: 'text',
    },
    selectedTopics: {
      type: [String],
      default: [],
    },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Intermediate',
    },
    questionLimit: {
      type: Number,
      min: 1,
      max: 100,
      default: 50,
    },
    useResume: {
      type: Boolean,
      default: true,
    },
    currentQuestionNumber: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['in_progress', 'completed', 'abandoned'],
      default: 'in_progress',
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    endedAt: {
      type: Date,
      default: null,
    },
    overallScore: {
      type: Number,
      default: null,
    },
    // Stored after POST /:sessionId/end — contains full report object
    report: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: true },
);

// Compound index for fast user-session lookup (the most common query)
interviewSessionSchema.index({ userId: 1, status: 1 });
interviewSessionSchema.index({ userId: 1, createdAt: -1 });

/* ─────────────────────────────────────────────────
   InterviewMessage — each question / answer turn
   userId duplicated here for fast isolation queries
   without always needing a session join.
───────────────────────────────────────────────── */
const interviewMessageSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InterviewSession',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    role: {
      type: String,
      enum: ['interviewer', 'candidate'],
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    questionNumber: {
      type: Number,
      default: null,
    },
    topic: {
      type: String,
      trim: true,
      default: '',
    },
    difficulty: {
      type: String,
      trim: true,
      default: '',
    },
    mode: {
      type: String,
      enum: ['text', 'voice'],
      default: 'text',
    },
    // Evaluation is stored for the final report but NOT returned to
    // the frontend during an active interview. Only exposed in /report.
    evaluation: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

interviewMessageSchema.index({ sessionId: 1, createdAt: 1 });

export const InterviewSession = mongoose.model('InterviewSession', interviewSessionSchema);
export const InterviewMessage = mongoose.model('InterviewMessage', interviewMessageSchema);
