import mongoose from 'mongoose';

/* ─────────────────────────────────────────────────
   Roadmap — top-level career path definition
───────────────────────────────────────────────── */
const roadmapSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, required: true, trim: true },
    career: { type: String, required: true, trim: true },
    difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Intermediate' },
    estimatedDuration: { type: String, trim: true }, // e.g. "6 months"
    tags: [{ type: String, trim: true }],            // e.g. ['development', 'web']
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

/* ─────────────────────────────────────────────────
   RoadmapStage — ordered stage within a roadmap
───────────────────────────────────────────────── */
const roadmapStageSchema = new mongoose.Schema(
  {
    roadmapId: { type: mongoose.Schema.Types.ObjectId, ref: 'Roadmap', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    order: { type: Number, required: true },
  },
  { timestamps: true }
);

roadmapStageSchema.index({ roadmapId: 1, order: 1 });

/* ─────────────────────────────────────────────────
   RoadmapTopic — individual topic within a stage
───────────────────────────────────────────────── */
const topicResourceSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    url: { type: String, trim: true },
    type: { type: String, enum: ['documentation', 'video', 'article', 'course', 'other'], default: 'other' },
  },
  { _id: false }
);

const roadmapTopicSchema = new mongoose.Schema(
  {
    stageId: { type: mongoose.Schema.Types.ObjectId, ref: 'RoadmapStage', required: true, index: true },
    roadmapId: { type: mongoose.Schema.Types.ObjectId, ref: 'Roadmap', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
    estimatedTime: { type: String, trim: true }, // e.g. "2 hours"
    order: { type: Number, required: true },
    // What the learner should know after completing this topic
    learningObjectives: [{ type: String, trim: true }],
    // External learning resources
    resources: [topicResourceSchema],
    // Tags to match with existing coding questions (topic field on CodingQuestion)
    codingTopicTags: [{ type: String, trim: true }],
    // Context-specific practice type
    practiceType: {
      type: String,
      enum: ['coding', 'sql', 'aptitude', 'excel', 'statistics', 'python', 'interview', 'project', 'none'],
      default: 'none',
    },
    practiceLink: { type: String, trim: true },
  },
  { timestamps: true }
);

roadmapTopicSchema.index({ stageId: 1, order: 1 });

/* ─────────────────────────────────────────────────
   UserRoadmapProgress — per-user, per-roadmap progress
───────────────────────────────────────────────── */
const userRoadmapProgressSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    roadmapId: { type: mongoose.Schema.Types.ObjectId, ref: 'Roadmap', required: true },
    // Set of topic _id strings the user has completed
    completedTopics: [{ type: mongoose.Schema.Types.ObjectId, ref: 'RoadmapTopic' }],
    // The topic the user is currently working on (optional convenience field)
    currentTopicId: { type: mongoose.Schema.Types.ObjectId, ref: 'RoadmapTopic', default: null },
    startedAt: { type: Date, default: Date.now },
    lastAccessedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// One progress document per user per roadmap
userRoadmapProgressSchema.index({ userId: 1, roadmapId: 1 }, { unique: true });

export const Roadmap = mongoose.model('Roadmap', roadmapSchema);
export const RoadmapStage = mongoose.model('RoadmapStage', roadmapStageSchema);
export const RoadmapTopic = mongoose.model('RoadmapTopic', roadmapTopicSchema);
export const UserRoadmapProgress = mongoose.model('UserRoadmapProgress', userRoadmapProgressSchema);
