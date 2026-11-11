import { Router } from 'express';
import { verifyAccessToken } from '../middleware/auth.js';
import * as noteController from '../controller/note.controller.js';

const noteRouter = Router();
noteRouter.use(verifyAccessToken);

noteRouter.post('/', noteController.uploadNote);
noteRouter.get('/', noteController.getNotes);
noteRouter.get('/daily-summary', noteController.dailySummary);
noteRouter.get('/:id', noteController.getNote);
noteRouter.delete('/:id', noteController.removeNote);
noteRouter.post('/:id/summarize', noteController.summarize);
noteRouter.post('/:id/explain', noteController.explain);
noteRouter.post('/:id/mindmap', noteController.mindMap);

export default noteRouter;
