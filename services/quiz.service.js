import Quiz from '../model/quiz.model.js';
import Note from '../model/note.model.js';
import groq from './groq.service.js';
import * as progressService from './progress.service.js';

async function gatherMaterial(studentId, subject, noteId) {
  if (noteId) {
    const note = await Note.findOne({ _id: noteId, student: studentId });
    if (!note) throw new Error('Source note not found');
    return { material: note.content || note.title, subject: note.subject, noteId: note._id };
  }

  const notes = await Note.find({ student: studentId, ...(subject ? { subject } : {}) })
    .sort({ createdAt: -1 })
    .limit(10)
    .select('title content subject');

  if (!notes.length) {
    throw new Error('No notes found to build a quiz from. Upload notes first.');
  }

  const material = notes
    .map((n) => `## ${n.title}\n${(n.content || '').slice(0, 2000)}`)
    .join('\n\n');

  return { material, subject: subject || notes[0].subject, noteId: null };
}

export async function generateQuiz(studentId, { subject, noteId, count = 5 } = {}) {
  const { material, subject: quizSubject, noteId: sourceNote } = await gatherMaterial(
    studentId,
    subject,
    noteId
  );

  const questions = await groq.generateQuiz(quizSubject, material, Math.min(count, 10));
  if (!questions.length) throw new Error('AI could not generate questions. Try again.');

  const quiz = await Quiz.create({
    student: studentId,
    subject: quizSubject,
    sourceNote,
    title: `${quizSubject} Quiz`,
    questions,
    totalQuestions: questions.length,
  });

  // Return questions without revealing correct answers
  return { ...quiz.toObject(), questions: questions.map(({ correctIndex, explanation, ...q }) => q) };
}

export async function submitQuiz(studentId, quizId, answers) {
  const quiz = await Quiz.findOne({ _id: quizId, student: studentId });
  if (!quiz) throw new Error('Quiz not found');
  if (quiz.score !== null) throw new Error('Quiz already submitted');

  const results = quiz.questions.map((q, i) => {
    const chosen = answers?.[i];
    const correct = q.correctIndex >= 0 ? chosen === q.correctIndex : null; // open-ended: ungraded
    return { questionIndex: i, chosenIndex: chosen ?? null, correct };
  });

  const graded = results.filter((r) => r.correct !== null);
  const correctCount = graded.filter((r) => r.correct).length;
  const score = graded.length ? Math.round((correctCount / graded.length) * 100) : null;

  quiz.answers = results;
  quiz.correctCount = correctCount;
  quiz.score = score;
  quiz.completedAt = new Date();
  await quiz.save();

  await progressService.touchActivity(studentId, quiz.subject);
  await progressService.recordQuizResult(studentId, quiz.subject, score);

  return {
    score,
    correctCount,
    totalQuestions: quiz.totalQuestions,
    answers: quiz.questions.map((q, i) => ({
      question: q.text,
      options: q.options,
      correctIndex: q.correctIndex,
      explanation: q.explanation,
      chosenIndex: results[i].chosenIndex,
      correct: results[i].correct,
    })),
  };
}

export async function listQuizzes(studentId) {
  return Quiz.find({ student: studentId })
    .select('subject title score totalQuestions correctCount createdAt completedAt')
    .sort({ createdAt: -1 })
    .limit(50);
}

export async function getQuiz(studentId, quizId) {
  const quiz = await Quiz.findOne({ _id: quizId, student: studentId });
  if (!quiz) throw new Error('Quiz not found');
  return quiz;
}
