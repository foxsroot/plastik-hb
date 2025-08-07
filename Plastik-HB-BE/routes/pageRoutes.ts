import { Router } from 'express';
import { getPage, updateHomepage } from '../controllers/pageController';
import { controllerWrapper } from '../utils/controllerWrapper';

const pageRouter = Router();

pageRouter.get('/:slug', controllerWrapper(getPage));
pageRouter.put('/homepage', controllerWrapper(updateHomepage));

export default pageRouter;