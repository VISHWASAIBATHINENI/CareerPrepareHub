import mongoose from 'mongoose';

const aptitudeQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true,
  },
  options: {
    type: [String],
    required: true,
    validate: {
      validator: (val) => Array.isArray(val) && val.length >= 2,
      message: 'At least 2 options are required',
    },
  },
  answer: {
    type: String,
    required: true,
    trim: true,
  },
  explanation: {
    type: String,
    default: '',
    trim: true,
  },
  topic: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true,
    default: 'easy',
    index: true,
  },
  isPremium: {
    type: Boolean,
    default: false,
    index: true,
  },
}, {
  timestamps: true,
});

aptitudeQuestionSchema.index({ isPremium: 1, difficulty: 1, createdAt: -1 });
aptitudeQuestionSchema.index({ topic: 1, difficulty: 1, createdAt: -1 });

const AptitudeQuestion = mongoose.model('AptitudeQuestion', aptitudeQuestionSchema);

export default AptitudeQuestion;
