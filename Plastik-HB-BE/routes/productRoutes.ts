import { Router } from 'express';
import { getAllProducts, getFeaturedProducts, createProduct, updateProduct, deleteProduct, deleteProductAsset, replaceMainImage, replaceAsset, reorderAssets} from '../controllers/productController';
import { getAllProducts, getFeaturedProducts, updateFeaturedProducts } from '../controllers/productController';
import { controllerWrapper } from '../utils/controllerWrapper';
import { uploadProductImages } from '../utils/uploadImageMiddleware';


const productRouter = Router();

productRouter.get('/', controllerWrapper(getAllProducts));
productRouter.get('/featured', controllerWrapper(getFeaturedProducts));
productRouter.post('/', uploadProductImages ,controllerWrapper(createProduct));
productRouter.put('/:id', uploadProductImages, controllerWrapper(updateProduct));
productRouter.delete('/:id', controllerWrapper(deleteProduct));

// Asset management routes
productRouter.delete('/:id/assets/:assetId', controllerWrapper(deleteProductAsset));
productRouter.put('/:id/assets/:assetId', uploadProductImages, controllerWrapper(replaceAsset));
productRouter.patch('/:id/assets/reorder', controllerWrapper(reorderAssets));
productRouter.put('/:id/main-image', uploadProductImages, controllerWrapper(replaceMainImage));
productRouter.put('/featured', controllerWrapper(updateFeaturedProducts));

export default productRouter;