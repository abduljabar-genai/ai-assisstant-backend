import { Router } from 'express';
import { verifyAccessToken } from '../middleware/auth.js';
import * as progressController from '../controller/progress.controller.js';

const progressRouter = Router();
progressRouter.use(verifyAccessToken);

progressRouter.get('/dashboard', progressController.dashboard);
progressRouter.get('/report', progressController.report);
progressRouter.get('/weekly-report', progressController.weeklyReport);

export default progressRouter;
