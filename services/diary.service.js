import DiaryEntry from '../model/diary.model.js';
import * as progressService from './progress.service.js';

const MOODS = ['great', 'good', 'okay', 'tired', 'stressed'];

export async function upsertEntry(studentId, data) {
  const date = data.date || new Date().toISOString().slice(0, 10);
  const mood = MOODS.includes(data.mood) ? data.mood : 'okay';

  const entry = await DiaryEntry.findOneAndUpdate(
    { student: studentId, date },
    {
      mood,
      studiedMinutes: Number(data.studiedMinutes) || 0,
      subjectsCovered: data.subjectsCovered || [],
      whatLearned: data.whatLearned || '',
      difficultPart: data.difficultPart || '',
      tomorrowPlan: data.tomorrowPlan || '',
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await progressService.touchActivity(studentId);
  return entry;
}

export async function listEntries(studentId, { month } = {}) {
  const filter = { student: studentId };
  if (month) {
    // month format YYYY-MM
    filter.date = { $regex: `^${month}` };
  }
  return DiaryEntry.find(filter).sort({ date: -1 }).limit(120);
}

export async function getEntry(studentId, entryId) {
  const entry = await DiaryEntry.findOne({ _id: entryId, student: studentId });
  if (!entry) throw new Error('Diary entry not found');
  return entry;
}

export async function deleteEntry(studentId, entryId) {
  const result = await DiaryEntry.deleteOne({ _id: entryId, student: studentId });
  if (!result.deletedCount) throw new Error('Diary entry not found');
}
