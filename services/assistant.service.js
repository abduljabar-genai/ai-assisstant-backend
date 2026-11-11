import ChatMessage from '../model/chatMessage.model.js';
import groq from './groq.service.js';
import Student from '../model/student.model.js';

export async function chat(studentId, userMessage) {
  if (!userMessage?.trim()) throw new Error('message is required');

  const student = await Student.findById(studentId).select('name subjects learningStyle');
  const history = await ChatMessage.find({ student: studentId })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();
  history.reverse();

  const contextPrefix = student?.subjects?.length
    ? `[Student context: name=${student.name}, subjects=${student.subjects.join(', ')}] `
    : '';

  const answer = await groq.answerQuestion(contextPrefix + userMessage.trim(), history);

  await ChatMessage.insertMany([
    { student: studentId, role: 'user', content: userMessage.trim() },
    { student: studentId, role: 'assistant', content: answer },
  ]);

  return { reply: answer };
}

export async function getHistory(studentId, limit = 100) {
  return ChatMessage.find({ student: studentId }).sort({ createdAt: 1 }).limit(limit).lean();
}

export async function clearHistory(studentId) {
  await ChatMessage.deleteMany({ student: studentId });
}
