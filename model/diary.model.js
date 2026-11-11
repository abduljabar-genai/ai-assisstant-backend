import mongoose from 'mongoose';

const diarySchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    mood: { type: String, enum: ['great', 'good', 'okay', 'tired', 'stressed'], default: 'okay' },
    studiedMinutes: { type: Number, default: 0 },
    subjectsCovered: { type: [String], default: [] },
    whatLearned: { type: String, default: '' },
    difficultPart: { type: String, default: '' },
    tomorrowPlan: { type: String, default: '' },
  },
  { timestamps: true }
);

diarySchema.index({ student: 1, date: 1 }, { unique: true });

const DiaryEntry = mongoose.model('DiaryEntry', diarySchema);

export default DiaryEntry;
