import { Router } from 'express';
import { verifyAccessToken } from '../middleware/auth.js';
import * as quizController from '../controller/quiz.controller.js';

const quizRouter = Router();
quizRouter.use(verifyAccessToken);

quizRouter.post('/generate', quizController.generate);
quizRouter.get('/', quizController.list);
quizRouter.get('/:id', quizController.get);
quizRouter.post('/:id/submit', quizController.submit);

export default quizRouter;
