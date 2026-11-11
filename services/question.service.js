import Question from '../model/question.model.js';
import groq from './groq.service.js';
import Note from '../model/note.model.js';

export async function createQuestion(studentId, data) {
  const { subject, topic = '', noteId = null, text } = data;
  if (!subject || !text?.trim()) throw new Error('subject and text are required');

  const question = await Question.create({
    student: studentId,
    subject,
    topic,
    note: noteId,
    text: text.trim(),
  });

  if (noteId) {
    await Note.updateOne({ _id: noteId, student: studentId }, { $inc: { questionsCount: 1 } });
  }

  return question;
}

export async function listQuestions(studentId, { status, subject } = {}) {
  const filter = { student: studentId };
  if (status) filter.status = status;
  if (subject) filter.subject = subject;
  return Question.find(filter).sort({ createdAt: -1 }).limit(200);
}

export async function answerQuestion(studentId, questionId, { answer, markResolved } = {}) {
  const question = await Question.findOne({ _id: questionId, student: studentId });
  if (!question) throw new Error('Question not found');

  if (answer !== undefined) {
    question.answer = answer;
    question.status = 'answered';
  }
  if (markResolved) question.status = 'resolved';
  await question.save();
  return question;
}

export async function askAI(studentId, questionId) {
  const question = await Question.findOne({ _id: questionId, student: studentId });
  if (!question) throw new Error('Question not found');

  let context = '';
  if (question.note) {
    const note = await Note.findById(question.note).select('title content');
    if (note) context = `Related notes "${note.title}":\n${(note.content || '').slice(0, 4000)}`;
  }

  const reply = await groq.answerQuestion(
    `My doubt: ${question.text}\nSubject: ${question.subject}${question.topic ? `, Topic: ${question.topic}` : ''}${context ? `\n${context}` : ''}`
  );

  question.answer = reply;
  question.status = 'answered';
  await question.save();
  return question;
}

export async function deleteQuestion(studentId, questionId) {
  const result = await Question.deleteOne({ _id: questionId, student: studentId });
  if (!result.deletedCount) throw new Error('Question not found');
}
