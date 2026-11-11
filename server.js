import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import cookieParser from 'cookie-parser';
import env from './config/env.js';
import connectDB from './config/database.js';
import authRouter from './routes/auth.routes.js';
import noteRouter from './routes/note.routes.js';
import assistantRouter from './routes/assistant.routes.js';
import quizRouter from './routes/quiz.routes.js';
import questionRouter from './routes/question.routes.js';
import planRouter from './routes/plan.routes.js';
import diaryRouter from './routes/diary.routes.js';
import gradeRouter from './routes/grade.routes.js';
import profileRouter from './routes/profile.routes.js';
import progressRouter from './routes/progress.routes.js';

const app = express();
const PORT = env.PORT;

app.use(express.json({ limit: '5mb' }));
app.use(cookieParser());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));

// Uploads directory
const uploadsDir = path.resolve('uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '_' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200MB — allows zoom video recordings
});

// Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/notes', upload.array('files', 10), noteRouter);
app.use('/api/v1/assistant', assistantRouter);
app.use('/api/v1/quizzes', quizRouter);
app.use('/api/v1/questions', questionRouter);
app.use('/api/v1/plans', planRouter);
app.use('/api/v1/diary', diaryRouter);
app.use('/api/v1/grades', gradeRouter);
app.use('/api/v1/profile', profileRouter);
app.use('/api/v1/progress', progressRouter);

app.get('/api/v1/health', (req, res) => res.json({ status: 'ok' }));

// Central error handler
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  }
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

async function startServer() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();
