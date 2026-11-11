import StudyPlan from '../model/studyPlan.model.js';
import Student from '../model/student.model.js';
import groq from './groq.service.js';
import Note from '../model/note.model.js';
import Quiz from '../model/quiz.model.js';

const DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

export async function createPlan(studentId, data) {
  const { title = 'Weekly Plan', weekStart, slots = [] } = data;
  if (!weekStart) throw new Error('weekStart is required');

  const validSlots = slots.filter(
    (s) => DAYS.includes(s.day) && s.startTime && s.endTime && s.subject
  );

  return StudyPlan.create({
    student: studentId,
    title,
    weekStart: new Date(weekStart),
    slots: validSlots,
  });
}

export async function listPlans(studentId) {
  return StudyPlan.find({ student: studentId }).sort({ weekStart: -1 }).limit(20);
}

export async function getPlan(studentId, planId) {
  const plan = await StudyPlan.findOne({ _id: planId, student: studentId });
  if (!plan) throw new Error('Plan not found');
  return plan;
}

export async function updatePlan(studentId, planId, data) {
  const plan = await getPlan(studentId, planId);
  if (data.title) plan.title = data.title;
  if (data.slots) {
    plan.slots = data.slots.filter(
      (s) => DAYS.includes(s.day) && s.startTime && s.endTime && s.subject
    );
  }
  await plan.save();
  return plan;
}

export async function deletePlan(studentId, planId) {
  const result = await StudyPlan.deleteOne({ _id: planId, student: studentId });
  if (!result.deletedCount) throw new Error('Plan not found');
}

export async function generatePlanAI(studentId) {
  const student = await Student.findById(studentId).select('subjects dailyGoalMinutes');
  const subjects = student?.subjects?.length ? student.subjects : ['General'];

  const generated = await groq.generateStudyPlan(subjects, student?.dailyGoalMinutes || 120);

  // weekStart = next Monday
  const now = new Date();
  const day = now.getDay(); // 0=Sun
  const diff = day === 0 ? 1 : 8 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  monday.setHours(0, 0, 0, 0);

  return StudyPlan.create({
    student: studentId,
    title: generated.title || 'AI Weekly Plan',
    weekStart: monday,
    slots: generated.slots || [],
    generatedByAI: true,
  });
}

// Monthly revision plan based on what the student has actually covered + weak quiz areas
export async function generateRevisionPlan(studentId) {
  const student = await Student.findById(studentId).select('subjects');
  const subjects = student?.subjects?.length ? student.subjects : ['General'];

  const notes = await Note.find({ student: studentId }).select('subject keyTopics').limit(100);
  const quizzes = await Quiz.find({ student: studentId, score: { $ne: null } })
    .select('subject score')
    .sort({ completedAt: -1 })
    .limit(50);

  const coveredTopics = {};
  for (const n of notes) {
    if (!coveredTopics[n.subject]) coveredTopics[n.subject] = new Set();
    for (const t of n.keyTopics || []) coveredTopics[n.subject].add(t);
  }
  const weakSubjects = {};
  for (const q of quizzes) {
    if (!weakSubjects[q.subject]) weakSubjects[q.subject] = [];
    weakSubjects[q.subject].push(q.score);
  }
  const weak = Object.entries(weakSubjects)
    .map(([s, scores]) => {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      return avg < 60 ? s : null;
    })
    .filter(Boolean);

  const plan = await groq.generateRevisionPlan(
    subjects,
    weak.length ? weak : Object.keys(coveredTopics)
  );

  return {
    ...plan,
    coveredTopics: Object.fromEntries(
      Object.entries(coveredTopics).map(([k, v]) => [k, [...v]])
    ),
    weakSubjects: weak,
  };
}
