import { Router } from 'express';
import { verifyAccessToken } from '../middleware/auth.js';
import * as assistantController from '../controller/assistant.controller.js';

const assistantRouter = Router();
assistantRouter.use(verifyAccessToken);

assistantRouter.post('/chat', assistantController.chat);
assistantRouter.get('/history', assistantController.history);
assistantRouter.delete('/history', assistantController.clear);

export default assistantRouter;
