import { Router } from 'express';
import { controllerWrapper } from '../utils/controllerWrapper';
import { getAnalytics, addAnalytics } from '../controllers/analyticController';

const router = Router();
router.get('/', controllerWrapper(getAnalytics));
router.post("/", controllerWrapper(addAnalytics));

export default router;