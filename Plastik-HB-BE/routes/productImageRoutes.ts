import { Router } from 'express';
import { createProductImage, getProductImages } from '../controllers/productImageController';
import { controllerWrapper } from '../utils/controllerWrapper';

const productImageRouter = Router();

productImageRouter.get('/', controllerWrapper(getProductImages));
productImageRouter.post('/', controllerWrapper(createProductImage));

export default productImageRouter;
