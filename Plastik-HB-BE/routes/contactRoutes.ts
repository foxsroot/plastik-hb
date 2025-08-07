import { Router } from 'express';
import { controllerWrapper } from '../utils/controllerWrapper';
import { getContactInfo, putContactInfo } from '../controllers/contactController';
import authenticate from '../middlewares/authenticate';

const router = Router();

router.get('/', controllerWrapper(getContactInfo));
router.put('/', authenticate, controllerWrapper(putContactInfo));

export default router;