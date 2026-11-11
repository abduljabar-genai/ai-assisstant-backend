import { Router } from 'express';
import { verifyAccessToken } from '../middleware/auth.js';
import * as planController from '../controller/plan.controller.js';

const planRouter = Router();
planRouter.use(verifyAccessToken);

planRouter.post('/generate', planController.generate);
planRouter.post('/revision', planController.revision);
planRouter.post('/', planController.create);
planRouter.get('/', planController.list);
planRouter.get('/:id', planController.get);
planRouter.patch('/:id', planController.update);
planRouter.delete('/:id', planController.remove);

export default planRouter;
