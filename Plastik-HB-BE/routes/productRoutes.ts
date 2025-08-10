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

const productRouter = Router();

// Public catalog routes (no auth required)
productRouter.get('/catalog', controllerWrapper(getCatalogProducts));
productRouter.get('/categories', controllerWrapper(getActiveCategories));
productRouter.get('/all-categories', controllerWrapper(getAllCategoriesForCatalog));
productRouter.get('/featured', controllerWrapper(getFeaturedProducts));

// Admin routes
productRouter.get('/', controllerWrapper(getAllProducts));

// Public product detail route (no auth required) - Must be AFTER specific routes
productRouter.get('/:id', controllerWrapper(getProductById));
productRouter.post('/', uploadProductImages, controllerWrapper(createProduct));
productRouter.put('/:id', uploadProductImages, controllerWrapper(updateProduct));
productRouter.delete('/:id', controllerWrapper(deleteProduct));

// Asset management routes
productRouter.delete('/:id/assets/:assetId', controllerWrapper(deleteProductAsset));
productRouter.put('/:id/assets/:assetId', uploadProductImages, controllerWrapper(replaceAsset));
productRouter.patch('/:id/assets/reorder', controllerWrapper(reorderAssets));
productRouter.put('/:id/main-image', uploadProductImages, controllerWrapper(replaceMainImage));
productRouter.put('/featured', controllerWrapper(updateFeaturedProducts));

export default productRouter;