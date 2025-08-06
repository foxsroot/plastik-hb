import { Router } from 'express';
import { controllerWrapper } from '../utils/controllerWrapper';
import { loginUser, logoutUser, verify } from '../controllers/authenticationController';

const authenticationRouter = Router();

authenticationRouter.post('/login', controllerWrapper(loginUser));
authenticationRouter.post('/logout', controllerWrapper(logoutUser));
authenticationRouter.post('/verify', controllerWrapper(verify));

export default authenticationRouter;