import { Router } from 'express';
import { controllerWrapper } from '../utils/controllerWrapper';
import { getAnalytics } from '../controllers/analyticController';

const router = Router();
router.get('/', controllerWrapper(getAnalytics));
export default router;