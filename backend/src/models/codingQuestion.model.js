import mongoose from 'mongoose';const testCaseSchema = new mongoose.Schema({
  input: { type: String, required: true, trim: true },
  output: { type: String, required: true, trim: true },
}, { _id: false });

const codingQuestionSchema = new mongoose.Schema({
  sourceId: {
    type: Number,
    index: true,
  },
  company: {
    type: String,
    trim: true,
    default: 'General',
    index: true,
  },
  topic: {
    type: String,
    trim: true,
    default: 'General',
    index: true,
  },
  category: {
    type: String,
    trim: true,
    default: 'General',
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  constraints: {
    type: String,
    trim: true,
    default: '',
  },
  sampleInput: {
    type: String,
    trim: true,
    default: '',
  },
  sampleOutput: {
    type: String,
    trim: true,
    default: '',
  },
  explanation: {
    type: String,
    trim: true,
    default: '',
  },
  hints: {
    type: [String],
    default: [],
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true,
    default: 'easy',
    index: true,
  },
  testCases: {
    type: [testCaseSchema],
    default: [],
  },
  isPremium: {
    type: Boolean,
    default: false,
    index: true,
  },
}, {
  timestamps: true,
});

codingQuestionSchema.index({ difficulty: 1, company: 1, topic: 1, createdAt: -1 });
codingQuestionSchema.index({ isPremium: 1, createdAt: -1 });

const CodingQuestion = mongoose.model('CodingQuestion', codingQuestionSchema);

export default CodingQuestion;
