import { Router } from 'express';
import { createAnalytic, getAnalytics } from '../controllers/analyticController';
import { controllerWrapper } from '../utils/controllerWrapper';

const analyticsRouter = Router();

analyticsRouter.get('/', controllerWrapper(getAnalytics));
analyticsRouter.post('/', controllerWrapper(createAnalytic));

export default analyticsRouter;
