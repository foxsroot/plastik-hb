import { Router } from 'express';
import { getPage, updateHomepage, updateAboutPage } from '../controllers/pageController';
import { controllerWrapper } from '../utils/controllerWrapper';

const pageRouter = Router();

pageRouter.get('/:slug', controllerWrapper(getPage));
pageRouter.put('/homepage', controllerWrapper(updateHomepage));
pageRouter.put('/tentang-kami', controllerWrapper(updateAboutPage));

export default pageRouter;