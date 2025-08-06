import { Router } from 'express';
import { createPage, getPages } from '../controllers/pageController';
import { controllerWrapper } from '../utils/controllerWrapper';

const pageRouter = Router();

pageRouter.get('/', controllerWrapper(getPages));
pageRouter.post('/', controllerWrapper(createPage));

export default pageRouter;
