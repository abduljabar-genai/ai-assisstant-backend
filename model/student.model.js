import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { type: String, default: 'student' },
    verified: { type: Boolean, default: false },
    age: { type: Number },
    grade: { type: String, default: '' }, // e.g. "10", "B.Tech CSE"
    subjects: { type: [String], default: [] },
    learningStyle: {
      type: String,
      enum: ['visual', 'reading', 'practice', 'mixed'],
      default: 'mixed',
    },
    dailyGoalMinutes: { type: Number, default: 120 },
    password: { type: String, required: true },
    filesURL: { type: [String], default: [] },
    streak: { type: Number, default: 0 },
    lastActiveDate: { type: String }, // ISO date string YYYY-MM-DD
    badges: { type: [String], default: [] },
  },
  { timestamps: true }
);

const Student = mongoose.model('Student', studentSchema);

export default Student;
