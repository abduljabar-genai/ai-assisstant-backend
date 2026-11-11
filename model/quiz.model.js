import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    options: { type: [String], default: [] }, // empty for open-ended
    correctIndex: { type: Number, default: -1 }, // -1 = open ended / self-graded
    explanation: { type: String, default: '' },
  },
  { _id: false }
);

const quizSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    subject: { type: String, required: true, trim: true },
    sourceNote: { type: mongoose.Schema.Types.ObjectId, ref: 'Note', default: null },
    title: { type: String, default: 'Weekly Quiz' },
    questions: { type: [questionSchema], default: [] },
    score: { type: Number, default: null }, // percentage 0-100, null until submitted
    totalQuestions: { type: Number, default: 0 },
    correctCount: { type: Number, default: 0 },
    answers: { type: mongoose.Schema.Types.Mixed, default: null }, // [{questionIndex, chosenIndex, correct}]
    createdAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const Quiz = mongoose.model('Quiz', quizSchema);

export default Quiz;
