import { Router } from 'express';
import { verifyAccessToken } from '../middleware/auth.js';
import * as profileController from '../controller/profile.controller.js';

const profileRouter = Router();
profileRouter.use(verifyAccessToken);

profileRouter.get('/', profileController.getProfile);
profileRouter.patch('/', profileController.updateProfile);

export default profileRouter;
