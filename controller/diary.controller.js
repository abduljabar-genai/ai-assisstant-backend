import * as diaryService from '../services/diary.service.js';

const userId = (req) => req.user.userID;

export async function upsert(req, res) {
  try {
    const entry = await diaryService.upsertEntry(userId(req), req.body);
    res.status(200).json({ data: entry });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

export async function list(req, res) {
  try {
    const entries = await diaryService.listEntries(userId(req), { month: req.query.month });
    res.status(200).json({ data: entries });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function get(req, res) {
  try {
    const entry = await diaryService.getEntry(userId(req), req.params.id);
    res.status(200).json({ data: entry });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
}

export async function remove(req, res) {
  try {
    await diaryService.deleteEntry(userId(req), req.params.id);
    res.status(200).json({ message: 'Entry deleted.' });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
}
