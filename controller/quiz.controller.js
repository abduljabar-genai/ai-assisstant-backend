import * as quizService from '../services/quiz.service.js';

const userId = (req) => req.user.userID;

export async function generate(req, res) {
  try {
    const quiz = await quizService.generateQuiz(userId(req), req.body);
    res.status(201).json({ data: quiz });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

export async function submit(req, res) {
  try {
    const result = await quizService.submitQuiz(userId(req), req.params.id, req.body.answers);
    res.status(200).json({ data: result });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

export async function list(req, res) {
  try {
    const quizzes = await quizService.listQuizzes(userId(req));
    res.status(200).json({ data: quizzes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function get(req, res) {
  try {
    const quiz = await quizService.getQuiz(userId(req), req.params.id);
    res.status(200).json({ data: quiz });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
}
