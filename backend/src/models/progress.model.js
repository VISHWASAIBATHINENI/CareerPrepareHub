import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    questionType: { type: String, enum: ['aptitude', 'coding'], required: true },
    questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
    isCorrect: { type: Boolean, default: false },
    attempts: { type: Number, default: 0 },
    lastAttemptAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

progressSchema.index({ user: 1, questionType: 1, questionId: 1 }, { unique: true });

const Progress = mongoose.model('Progress', progressSchema);

export default Progress;
