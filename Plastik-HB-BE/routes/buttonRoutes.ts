import { Router } from 'express';
import { createButton, getButtons } from '../controllers/buttonController';
import { controllerWrapper } from '../utils/controllerWrapper';

const buttonRouter = Router();

buttonRouter.get('/', controllerWrapper(getButtons));
buttonRouter.post('/', controllerWrapper(createButton));

export default buttonRouter;
