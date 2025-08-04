import { Router } from 'express';
import { createAchievement, getAchievements } from '../controllers/achievementController';
import { controllerWrapper } from '../utils/controllerWrapper';

const achievementRouter = Router();

achievementRouter.get('/', controllerWrapper(getAchievements));
achievementRouter.post('/', controllerWrapper(createAchievement));

export default achievementRouter;
