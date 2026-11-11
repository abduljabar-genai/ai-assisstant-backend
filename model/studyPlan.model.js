import mongoose from 'mongoose';

const slotSchema = new mongoose.Schema(
  {
    day: { type: String, enum: ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'], required: true },
    startTime: { type: String, required: true }, // "HH:MM" 24h
    endTime: { type: String, required: true },
    subject: { type: String, required: true },
    topic: { type: String, default: '' },
    kind: { type: String, enum: ['study', 'revision', 'quiz', 'practice'], default: 'study' },
  },
  { _id: false }
);

const studyPlanSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    title: { type: String, default: 'Weekly Plan' },
    weekStart: { type: Date, required: true }, // Monday of the planned week
    slots: { type: [slotSchema], default: [] },
    generatedByAI: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const StudyPlan = mongoose.model('StudyPlan', studyPlanSchema);

export default StudyPlan;
