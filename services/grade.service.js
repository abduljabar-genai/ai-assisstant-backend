import Grade from '../model/grade.model.js';
import * as progressService from './progress.service.js';

export async function createGrade(studentId, data) {
  const { subject, title, score, maxScore, weight = 1, date } = data;
  if (!subject || !title || score == null || !maxScore) {
    throw new Error('subject, title, score and maxScore are required');
  }
  if (maxScore <= 0) throw new Error('maxScore must be positive');

  const grade = await Grade.create({
    student: studentId,
    subject,
    title,
    score: Number(score),
    maxScore: Number(maxScore),
    weight: Number(weight) || 1,
    date: date ? new Date(date) : new Date(),
  });

  await progressService.touchActivity(studentId, subject);
  return grade;
}

export async function listGrades(studentId, { subject } = {}) {
  const filter = { student: studentId };
  if (subject) filter.subject = subject;
  return Grade.find(filter).sort({ date: -1 }).limit(200);
}

export async function deleteGrade(studentId, gradeId) {
  const result = await Grade.deleteOne({ _id: gradeId, student: studentId });
  if (!result.deletedCount) throw new Error('Grade entry not found');
}

// Weighted percentage per subject + overall weighted average
export async function gradeSummary(studentId) {
  const grades = await Grade.find({ student: studentId }).lean();
  if (!grades.length) return { subjects: [], overall: null };

  const bySubject = {};
  let totalWeight = 0;
  let totalPoints = 0;

  for (const g of grades) {
    const pct = (g.score / g.maxScore) * 100;
    if (!bySubject[g.subject]) bySubject[g.subject] = { weightedSum: 0, weightSum: 0, count: 0 };
    bySubject[g.subject].weightedSum += pct * g.weight;
    bySubject[g.subject].weightSum += g.weight;
    bySubject[g.subject].count += 1;

    totalWeight += g.weight;
    totalPoints += pct * g.weight;
  }

  const subjects = Object.entries(bySubject).map(([subject, s]) => ({
    subject,
    percentage: Math.round((s.weightedSum / s.weightSum) * 10) / 10,
    assessments: s.count,
  }));

  return {
    subjects,
    overall: Math.round((totalPoints / totalWeight) * 10) / 10,
  };
}
