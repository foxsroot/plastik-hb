import { Router } from 'express';
import { createSession, getSessions } from '../controllers/sessionController';
import { controllerWrapper } from '../utils/controllerWrapper';

const sessionRouter = Router();

sessionRouter.get('/', controllerWrapper(getSessions));
sessionRouter.post('/', controllerWrapper(createSession));

export default sessionRouter;
