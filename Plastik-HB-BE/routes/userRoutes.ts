import { Router } from 'express';
import { createUser, getUsers } from '../controllers/userController';
import { controllerWrapper } from '../utils/controllerWrapper';

const userRouter = Router();

userRouter.get('/', controllerWrapper(getUsers));
userRouter.post('/', controllerWrapper(createUser));

export default userRouter;
