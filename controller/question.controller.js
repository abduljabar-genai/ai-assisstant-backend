import * as questionService from '../services/question.service.js';

const userId = (req) => req.user.userID;

export async function create(req, res) {
  try {
    const question = await questionService.createQuestion(userId(req), req.body);
    res.status(201).json({ message: 'Question saved.', data: question });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

export async function list(req, res) {
  try {
    const questions = await questionService.listQuestions(userId(req), {
      status: req.query.status,
      subject: req.query.subject,
    });
    res.status(200).json({ data: questions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function answer(req, res) {
  try {
    const question = await questionService.answerQuestion(userId(req), req.params.id, req.body);
    res.status(200).json({ data: question });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
}

export async function askAI(req, res) {
  try {
    const question = await questionService.askAI(userId(req), req.params.id);
    res.status(200).json({ data: question });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

export async function remove(req, res) {
  try {
    await questionService.deleteQuestion(userId(req), req.params.id);
    res.status(200).json({ message: 'Question deleted.' });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
}
