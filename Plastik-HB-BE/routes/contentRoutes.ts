import { Router } from 'express';
import { createContent, getContents } from '../controllers/contentController';
import { controllerWrapper } from '../utils/controllerWrapper';

const contentRouter = Router();

contentRouter.get('/', controllerWrapper(getContents));
contentRouter.post('/', controllerWrapper(createContent));

export default contentRouter;
