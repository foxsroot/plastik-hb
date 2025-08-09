import { Router } from 'express';
import { 
    getAllCategories, 
    createCategory, 
    updateCategory, 
    deleteCategory,
    getProductsByCategory
} from '../controllers/categoryController';
import { controllerWrapper } from '../utils/controllerWrapper';

const categoryRouter = Router();

// Category CRUD
categoryRouter.get('/', controllerWrapper(getAllCategories));
categoryRouter.post('/', controllerWrapper(createCategory));
categoryRouter.put('/:id', controllerWrapper(updateCategory));
categoryRouter.delete('/:id', controllerWrapper(deleteCategory));

// Category relations
categoryRouter.get('/:id/products', controllerWrapper(getProductsByCategory));

export default categoryRouter;
