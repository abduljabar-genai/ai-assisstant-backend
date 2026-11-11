import Note from '../model/note.model.js';
import groq from './groq.service.js';
import * as progressService from './progress.service.js';

export async function createNote(studentId, data, files = []) {
  const { title, subject, type = 'text', content = '', videoUrl = '', classDate, tags = [] } = data;

  if (!title || !subject) {
    throw new Error('title and subject are required');
  }

  const mappedFiles = files.map((f) => ({
    url: `/uploads/${f.filename}`,
    name: f.originalname,
    mimeType: f.mimetype,
    size: f.size,
  }));

  const note = await Note.create({
    student: studentId,
    title,
    subject,
    type,
    content,
    files: mappedFiles,
    videoUrl: videoUrl || '',
    classDate: classDate ? new Date(classDate) : new Date(),
    tags: Array.isArray(tags) ? tags : tags ? [tags] : [],
  });

  await progressService.touchActivity(studentId, subject);
  return note;
}

export async function listNotes(studentId, { subject, search } = {}) {
  const filter = { student: studentId };
  if (subject) filter.subject = subject;
  if (search) filter.title = { $regex: search, $options: 'i' };

  return Note.find(filter)
    .select('-content')
    .sort({ createdAt: -1 })
    .limit(100);
}

export async function getNote(studentId, noteId) {
  const note = await Note.findOne({ _id: noteId, student: studentId });
  if (!note) throw new Error('Note not found');
  return note;
}

export async function deleteNote(studentId, noteId) {
  const result = await Note.deleteOne({ _id: noteId, student: studentId });
  if (!result.deletedCount) throw new Error('Note not found');
}

async function noteMaterial(note) {
  const parts = [note.content || ''];
  if (note.files?.length) parts.push(`[Attached files: ${note.files.map((f) => f.name).join(', ')}]`);
  if (note.videoUrl) parts.push(`[Video recording: ${note.videoUrl}]`);
  return parts.join('\n').trim() || 'No content available.';
}

export async function summarizeNote(studentId, noteId) {
  const note = await getNote(studentId, noteId);
  if (note.summary) return note;

  const result = await groq.summarizeNote(await noteMaterial(note), note.title);
  note.summary = result.summary || '';
  note.keyTopics = result.keyTopics || [];
  await note.save();
  return note;
}

export async function explainNoteTopic(studentId, noteId, topic) {
  const note = await getNote(studentId, noteId);
  const answer = await groq.explainTopic(topic || note.title, await noteMaterial(note));
  return { topic: topic || note.title, answer };
}

export async function mindMapNote(studentId, noteId) {
  const note = await getNote(studentId, noteId);
  if (note.mindMap) return note.mindMap;

  const map = await groq.generateMindMap(await noteMaterial(note), note.title);
  note.mindMap = map;
  await note.save();
  return map;
}

export async function dailySummary(studentId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const notes = await Note.find({ student: studentId, createdAt: { $gte: today } })
    .select('title subject keyTopics summary')
    .sort({ createdAt: -1 });

  const subjects = [...new Set(notes.map((n) => n.subject))];
  const topics = [...new Set(notes.flatMap((n) => n.keyTopics || []))];

  return {
    classesCovered: notes.length,
    subjects,
    topics,
    notes: notes.map((n) => ({ id: n._id, title: n.title, subject: n.subject })),
  };
}
