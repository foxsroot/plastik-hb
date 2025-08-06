import { Router } from 'express';
import { createProduct, getProducts } from '../controllers/productController';
import { controllerWrapper } from '../utils/controllerWrapper';

const productRouter = Router();

productRouter.get('/', controllerWrapper(getProducts));
productRouter.post('/', controllerWrapper(createProduct));

export default productRouter;
