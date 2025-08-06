import { Router } from 'express';
import { createImage, getImages } from '../controllers/imageController';
import { controllerWrapper } from '../utils/controllerWrapper';

const imageRouter = Router();

imageRouter.get('/', controllerWrapper(getImages));
imageRouter.post('/', controllerWrapper(createImage));

export default imageRouter;
