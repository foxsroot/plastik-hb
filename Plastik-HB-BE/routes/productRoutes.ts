import { Router } from 'express';
import { getAllProducts, getFeaturedProducts, updateFeaturedProducts } from '../controllers/productController';
import { controllerWrapper } from '../utils/controllerWrapper';

const productRouter = Router();

productRouter.get('/', controllerWrapper(getAllProducts));
productRouter.get('/featured', controllerWrapper(getFeaturedProducts));
productRouter.put('/featured', controllerWrapper(updateFeaturedProducts));

export default productRouter;
