import mongoose from 'mongoose';

const gradeSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    subject: { type: String, required: true, trim: true },
    title: { type: String, required: true }, // "Midterm", "Assignment 3"
    score: { type: Number, required: true },
    maxScore: { type: Number, required: true },
    weight: { type: Number, default: 1 }, // e.g. exam=3, assignment=1
    date: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Grade = mongoose.model('Grade', gradeSchema);

export default Grade;
