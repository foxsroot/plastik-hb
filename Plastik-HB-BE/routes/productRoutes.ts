import { Router } from 'express';
import { getAllProducts, getFeaturedProducts } from '../controllers/productController';
import { controllerWrapper } from '../utils/controllerWrapper';

const productRouter = Router();

productRouter.get('/', controllerWrapper(getAllProducts));
productRouter.get('/featured', controllerWrapper(getFeaturedProducts));

export default productRouter;
