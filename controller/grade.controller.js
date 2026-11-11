import * as gradeService from '../services/grade.service.js';

const userId = (req) => req.user.userID;

export async function create(req, res) {
  try {
    const grade = await gradeService.createGrade(userId(req), req.body);
    res.status(201).json({ message: 'Grade saved.', data: grade });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

export async function list(req, res) {
  try {
    const grades = await gradeService.listGrades(userId(req), { subject: req.query.subject });
    res.status(200).json({ data: grades });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function summary(req, res) {
  try {
    const data = await gradeService.gradeSummary(userId(req));
    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function remove(req, res) {
  try {
    await gradeService.deleteGrade(userId(req), req.params.id);
    res.status(200).json({ message: 'Grade deleted.' });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
}
