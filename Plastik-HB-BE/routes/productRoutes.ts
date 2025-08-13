import { Router } from 'express';
import {
    getAllProducts,
    getFeaturedProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    deleteProductAsset,
    replaceMainImage,
    replaceAsset,
    reorderAssets,
    updateFeaturedProducts,
    getCatalogProducts,
    getActiveCategories,
    getAllCategoriesForCatalog
} from '../controllers/productController';
import { controllerWrapper } from '../utils/controllerWrapper';
import { uploadProductImages } from '../utils/uploadImageMiddleware';
import authenticate from '../middlewares/authenticate';

const productRouter = Router();

// Public catalog routes (no auth required)
productRouter.get('/catalog', controllerWrapper(getCatalogProducts));
productRouter.get('/categories', controllerWrapper(getActiveCategories));
productRouter.get('/all-categories', controllerWrapper(getAllCategoriesForCatalog));
productRouter.get('/featured', controllerWrapper(getFeaturedProducts));
productRouter.post('/', authenticate, uploadProductImages, controllerWrapper(createProduct));

// Admin routes
productRouter.get('/', controllerWrapper(getAllProducts));
productRouter.put('/featured', authenticate, controllerWrapper(updateFeaturedProducts));

// Public product detail route (no auth required) - Must be AFTER specific routes
productRouter.get('/:id', controllerWrapper(getProductById));
productRouter.post('/', authenticate, uploadProductImages, controllerWrapper(createProduct));
productRouter.put('/:id', authenticate, uploadProductImages, controllerWrapper(updateProduct));
productRouter.delete('/:id', authenticate, controllerWrapper(deleteProduct));

// Asset management routes
productRouter.delete('/:id/assets/:assetId', authenticate, controllerWrapper(deleteProductAsset));
productRouter.put('/:id/assets/:assetId', authenticate, uploadProductImages, controllerWrapper(replaceAsset));
productRouter.patch('/:id/assets/reorder', authenticate, controllerWrapper(reorderAssets));
productRouter.put('/:id/main-image', authenticate, uploadProductImages, controllerWrapper(replaceMainImage));

export default productRouter;