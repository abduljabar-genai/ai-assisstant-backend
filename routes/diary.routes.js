import { Router } from 'express';
import { verifyAccessToken } from '../middleware/auth.js';
import * as diaryController from '../controller/diary.controller.js';

const diaryRouter = Router();
diaryRouter.use(verifyAccessToken);

diaryRouter.post('/', diaryController.upsert);
diaryRouter.get('/', diaryController.list);
diaryRouter.get('/:id', diaryController.get);
diaryRouter.delete('/:id', diaryController.remove);

export default diaryRouter;
