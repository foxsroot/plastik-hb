import { Request, Response } from 'express';
import { CategoryService } from '../services/categoryService';

/**
 * @desc Get all categories
 * @route GET /categories
 */
export const getAllCategories = async (req: Request, res: Response) => {
    const categories = await CategoryService.getAllCategories();
    return { data: categories, status: 200 };
};

/**
 * @desc Create new category
 * @route POST /categories
 */
export const createCategory = async (req: Request, res: Response) => {
    const { category } = req.body;

    if (!category || typeof category !== 'string') {
        throw { message: 'Category name is required and must be a string', status: 400 };
    }

    const categoryName = category.trim();
    
    if (categoryName.length < 2) {
        throw { message: 'Category name must be at least 2 characters long', status: 400 };
    }

    if (categoryName.length > 50) {
        throw { message: 'Category name must not exceed 50 characters', status: 400 };
    }

    const newCategory = await CategoryService.createCategory(categoryName);
    
    return { 
        data: newCategory, 
        status: 201,
        message: 'Category created successfully'
    };
};

/**
 * @desc Update category
 * @route PUT /categories/:id
 */
export const updateCategory = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { category } = req.body;

    if (!category) {
        throw { message: 'Category name is required', status: 400 };
    }

    const updatedCategory = await CategoryService.updateCategory(id, category);
    
    return { 
        data: updatedCategory, 
        status: 200,
        message: 'Category updated successfully'
    };
};

/**
 * @desc Delete category
 * @route DELETE /categories/:id
 */
export const deleteCategory = async (req: Request, res: Response) => {
    const { id } = req.params;
    await CategoryService.deleteCategory(id);
    
    return { 
        data: null, 
        status: 200,
        message: 'Category deleted successfully'
    };
};

/**
 * @desc Get products by category
 * @route GET /categories/:id/products
 */
export const getProductsByCategory = async (req: Request, res: Response) => {
    const { id } = req.params;
    const products = await CategoryService.getProductsByCategory(id);
    
    return { 
        data: products, 
        status: 200
    };
};
