import * as progressService from '../services/progress.service.js';

const userId = (req) => req.user.userID;

export async function dashboard(req, res) {
  try {
    const data = await progressService.getDashboard(userId(req));
    res.status(200).json({ data });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
}

export async function report(req, res) {
  try {
    const data = await progressService.getProgressReport(userId(req));
    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function weeklyReport(req, res) {
  try {
    const data = await progressService.weeklyReport(userId(req));
    res.status(200).json({ data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
