import { Router } from 'express';
import { verifyAccessToken } from '../middleware/auth.js';
import * as questionController from '../controller/question.controller.js';

const questionRouter = Router();
questionRouter.use(verifyAccessToken);

questionRouter.post('/', questionController.create);
questionRouter.get('/', questionController.list);
questionRouter.post('/:id/answer', questionController.answer);
questionRouter.post('/:id/ask-ai', questionController.askAI);
questionRouter.delete('/:id', questionController.remove);

export default questionRouter;
