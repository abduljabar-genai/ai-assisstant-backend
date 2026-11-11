import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    subject: { type: String, required: true, trim: true },
    topic: { type: String, default: '' },
    note: { type: mongoose.Schema.Types.ObjectId, ref: 'Note', default: null },
    text: { type: String, required: true },
    status: { type: String, enum: ['open', 'answered', 'resolved'], default: 'open' },
    answer: { type: String, default: '' }, // filled by AI assistant or student
  },
  { timestamps: true }
);

const Question = mongoose.model('Question', questionSchema);

export default Question;
