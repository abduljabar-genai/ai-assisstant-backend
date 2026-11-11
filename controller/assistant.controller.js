import * as assistantService from '../services/assistant.service.js';

const userId = (req) => req.user.userID;

export async function chat(req, res) {
  try {
    const result = await assistantService.chat(userId(req), req.body.message);
    res.status(200).json({ data: result });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

export async function history(req, res) {
  try {
    const messages = await assistantService.getHistory(userId(req));
    res.status(200).json({ data: messages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function clear(req, res) {
  try {
    await assistantService.clearHistory(userId(req));
    res.status(200).json({ message: 'Chat history cleared.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
