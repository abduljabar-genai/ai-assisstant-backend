import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    name: { type: String, required: true },
    mimeType: { type: String, default: '' },
    size: { type: Number, default: 0 },
  },
  { _id: false }
);

const noteSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true, index: true },
    title: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    // 'text' = typed/pasted notes, 'file' = uploaded document/code, 'video' = zoom recording or link
    type: { type: String, enum: ['text', 'file', 'video'], default: 'text' },
    content: { type: String, default: '' }, // typed text or extracted text
    files: { type: [fileSchema], default: [] },
    videoUrl: { type: String, default: '' }, // external link e.g. Zoom cloud recording
    classDate: { type: Date, default: Date.now },
    tags: { type: [String], default: [] },
    summary: { type: String, default: '' },
    keyTopics: { type: [String], default: [] },
    mindMap: { type: mongoose.Schema.Types.Mixed, default: null }, // { center, branches:[{label, children:[]}] }
    questionsCount: { type: Number, default: 0 }, // unclear points raised from this note
  },
  { timestamps: true }
);

const Note = mongoose.model('Note', noteSchema);

export default Note;
