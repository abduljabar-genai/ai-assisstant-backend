import { Router } from 'express';
import { verifyAccessToken } from '../middleware/auth.js';
import * as gradeController from '../controller/grade.controller.js';

const gradeRouter = Router();
gradeRouter.use(verifyAccessToken);

gradeRouter.post('/', gradeController.create);
gradeRouter.get('/', gradeController.list);
gradeRouter.get('/summary', gradeController.summary);
gradeRouter.delete('/:id', gradeController.remove);

export default gradeRouter;
