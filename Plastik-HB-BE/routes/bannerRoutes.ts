import { Router } from 'express';
import { createBanner, getBanners } from '../controllers/bannerController';
import { controllerWrapper } from '../utils/controllerWrapper';

const bannerRouter = Router();

bannerRouter.get('/', controllerWrapper(getBanners));
bannerRouter.post('/', controllerWrapper(createBanner));

export default bannerRouter;
