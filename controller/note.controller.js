import * as noteService from '../services/note.service.js';

const userId = (req) => req.user.userID;

export async function uploadNote(req, res) {
  try {
    const note = await noteService.createNote(userId(req), req.body, req.files || []);
    res.status(201).json({ message: 'Note saved.', data: note });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

export async function getNotes(req, res) {
  try {
    const notes = await noteService.listNotes(userId(req), {
      subject: req.query.subject,
      search: req.query.search,
    });
    res.status(200).json({ data: notes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function getNote(req, res) {
  try {
    const note = await noteService.getNote(userId(req), req.params.id);
    res.status(200).json({ data: note });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
}

export async function removeNote(req, res) {
  try {
    await noteService.deleteNote(userId(req), req.params.id);
    res.status(200).json({ message: 'Note deleted.' });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
}

export async function summarize(req, res) {
  try {
    const note = await noteService.summarizeNote(userId(req), req.params.id);
    res.status(200).json({ data: note });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

export async function explain(req, res) {
  try {
    const result = await noteService.explainNoteTopic(userId(req), req.params.id, req.body.topic);
    res.status(200).json({ data: result });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

export async function mindMap(req, res) {
  try {
    const map = await noteService.mindMapNote(userId(req), req.params.id);
    res.status(200).json({ data: map });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}

export async function dailySummary(req, res) {
  try {
    const summary = await noteService.dailySummary(userId(req));
    res.status(200).json({ data: summary });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
