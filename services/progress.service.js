import Student from '../model/student.model.js';
import Note from '../model/note.model.js';
import Quiz from '../model/quiz.model.js';
import Question from '../model/question.model.js';
import DiaryEntry from '../model/diary.model.js';
import groq from './groq.service.js';

const BADGES = {
  first_note: { name: 'First Steps', desc: 'Uploaded your first notes' },
  notes_10: { name: 'Note Keeper', desc: 'Uploaded 10 notes' },
  quiz_1: { name: 'Quiz Taker', desc: 'Completed your first quiz' },
  quiz_5: { name: 'Quiz Regular', desc: 'Completed 5 quizzes' },
  streak_3: { name: 'On Fire', desc: '3-day study streak' },
  streak_7: { name: 'Week Warrior', desc: '7-day study streak' },
  explorer: { name: 'Explorer', desc: 'Studied 4+ different subjects' },
};

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayStr() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

// Called whenever the student does any study activity. Updates streak + badges.
export async function touchActivity(studentId, subject = null) {
  const student = await Student.findById(studentId);
  if (!student) return;

  const today = todayStr();
  if (student.lastActiveDate === today) return; // already counted today

  const yesterday = yesterdayStr();
  student.streak = student.lastActiveDate === yesterday ? student.streak + 1 : 1;
  student.lastActiveDate = today;

  const earned = new Set(student.badges);
  const check = (key) => {
    if (!earned.has(key)) {
      earned.add(key);
      student.badges.push(key);
    }
  };

  const [noteCount, quizCount, subjectCount] = await Promise.all([
    Note.countDocuments({ student: studentId }),
    Quiz.countDocuments({ student: studentId, score: { $ne: null } }),
    Note.distinct('subject', { student: studentId }),
  ]);

  if (noteCount >= 1) check('first_note');
  if (noteCount >= 10) check('notes_10');
  if (quizCount >= 1) check('quiz_1');
  if (quizCount >= 5) check('quiz_5');
  if (subjectCount.length >= 4) check('explorer');
  if (student.streak >= 3) check('streak_3');
  if (student.streak >= 7) check('streak_7');

  await student.save();
}

export async function recordQuizResult(studentId, subject, score) {
  // Reserved for per-subject mastery tracking; streak handled by touchActivity.
  return { studentId, subject, score };
}

export async function getDashboard(studentId) {
  const student = await Student.findById(studentId).select(
    'name email grade subjects learningStyle streak badges dailyGoalMinutes'
  );
  if (!student) throw new Error('Student not found');

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [todayNotes, recentQuizzes, openQuestions, weekEntries] = await Promise.all([
    Note.find({ student: studentId, createdAt: { $gte: today } }).select('title subject'),
    Quiz.find({ student: studentId, score: { $ne: null } })
      .sort({ completedAt: -1 })
      .limit(5)
      .select('subject score completedAt'),
    Question.countDocuments({ student: studentId, status: 'open' }),
    DiaryEntry.find({
      student: studentId,
      date: { $gte: new Date(Date.now() - 7 * 864e5).toISOString().slice(0, 10) },
    }).select('date studiedMinutes mood'),
  ]);

  return {
    student,
    today: {
      classesCovered: todayNotes.length,
      notes: todayNotes,
    },
    streak: student.streak,
    badges: student.badges.map((key) => ({ key, ...BADGES[key] })),
    recentQuizScores: recentQuizzes,
    openQuestions,
    weekStudyMinutes: weekEntries.reduce((sum, e) => sum + (e.studiedMinutes || 0), 0),
  };
}

export async function getProgressReport(studentId) {
  const since = new Date(Date.now() - 30 * 864e5);

  const [notes, quizzes, questions, diary] = await Promise.all([
    Note.find({ student: studentId, createdAt: { $gte: since } }).select('subject keyTopics createdAt'),
    Quiz.find({ student: studentId, score: { $ne: null }, completedAt: { $gte: since } })
      .select('subject score completedAt')
      .sort({ completedAt: 1 }),
    Question.countDocuments({ student: studentId, status: 'open' }),
    DiaryEntry.find({ student: studentId, date: { $gte: since.toISOString().slice(0, 10) } }).select(
      'date studiedMinutes subjectsCovered'
    ),
  ]);

  // Topics coverage by subject
  const topicsBySubject = {};
  for (const n of notes) {
    if (!topicsBySubject[n.subject]) topicsBySubject[n.subject] = new Set();
    for (const t of n.keyTopics || []) topicsBySubject[n.subject].add(t);
    topicsBySubject[n.subject].add(n.title);
  }

  // Quiz trend per subject: first half avg vs second half avg
  const quizTrend = {};
  for (const q of quizzes) {
    if (!quizTrend[q.subject]) quizTrend[q.subject] = [];
    quizTrend[q.subject].push({ date: q.completedAt, score: q.score });
  }
  const trendSummary = Object.entries(quizTrend).map(([subject, scores]) => {
    const mid = Math.floor(scores.length / 2);
    const early = scores.slice(0, mid).map((s) => s.score);
    const late = scores.slice(mid).map((s) => s.score);
    const avg = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null);
    const e = avg(early);
    const l = avg(late);
    return {
      subject,
      quizzes: scores.length,
      averageScore: avg(scores.map((s) => s.score)),
      improving: e !== null && l !== null ? l > e : null,
    };
  });

  return {
    period: 'last_30_days',
    notesUploaded: notes.length,
    quizzesCompleted: quizzes.length,
    openQuestions: questions,
    totalStudyMinutes: diary.reduce((s, d) => s + (d.studiedMinutes || 0), 0),
    topicsBySubject: Object.fromEntries(
      Object.entries(topicsBySubject).map(([k, v]) => [k, [...v]])
    ),
    quizTrend: trendSummary,
  };
}

export async function weeklyReport(studentId) {
  const data = await getProgressReport(studentId);
  const student = await Student.findById(studentId).select('name subjects');

  const weakSubjects = data.quizTrend
    .filter((t) => t.improving === false)
    .map((t) => t.subject);

  try {
    const text = await groq.chat([
      {
        role: 'system',
        content:
          'You are a warm study coach. Write a short weekly progress report (max 150 words) for a student. Be encouraging, mention strengths and one thing to improve.',
      },
      {
        role: 'user',
        content: `Student: ${student?.name}. Subjects: ${(student?.subjects || []).join(', ')}. Last 30 days: ${data.notesUploaded} notes, ${data.quizzesCompleted} quizzes, ${data.totalStudyMinutes} study minutes, ${data.openQuestions} open doubts. Quiz trend: ${JSON.stringify(data.quizTrend)}. Weak subjects: ${weakSubjects.join(', ') || 'none'}.`,
      },
    ]);
    return { report: text, stats: data, weakSubjects };
  } catch {
    return { report: null, stats: data, weakSubjects };
  }
}
