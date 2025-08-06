import { Router } from 'express';
import { createShop, getShops } from '../controllers/shopController';
import { controllerWrapper } from '../utils/controllerWrapper';

const shopRouter = Router();

shopRouter.get('/', controllerWrapper(getShops));
shopRouter.post('/', controllerWrapper(createShop));

export default shopRouter;
