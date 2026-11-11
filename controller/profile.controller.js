import Student from '../model/student.model.js';

const publicFields =
  'name email role grade subjects learningStyle dailyGoalMinutes streak badges createdAt';

export async function getProfile(req, res) {
  try {
    const student = await Student.findById(req.user.userID).select(publicFields);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.status(200).json({ data: student });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

export async function updateProfile(req, res) {
  try {
    const allowed = ['name', 'grade', 'subjects', 'learningStyle', 'dailyGoalMinutes'];
    const update = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) update[key] = req.body[key];
    }
    if (update.subjects && !Array.isArray(update.subjects)) {
      update.subjects = String(update.subjects)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }

    const student = await Student.findByIdAndUpdate(req.user.userID, update, {
      new: true,
      select: publicFields,
    });
    res.status(200).json({ data: student });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}
