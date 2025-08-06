import { Router } from 'express';
import { getPage } from '../controllers/pageController';
import { controllerWrapper } from '../utils/controllerWrapper';

const pageRouter = Router();

pageRouter.get('/:slug', controllerWrapper(getPage));

export default pageRouter;