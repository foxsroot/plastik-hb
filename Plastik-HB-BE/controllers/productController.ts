import { Request, Response } from 'express';
import { Product } from '../models/Product';
import { Asset } from '../models/Asset';
import { Category } from '../models/Category';

/**
 * @desc Fetch all products with assets and category
 * @route GET /products
 */
export const getAllProducts = async (req: Request, res: Response) => {
    // Fetch all products with associations
    const products = await Product.findAll({
        include: [
            { model: Asset, as: 'assets' },
            { model: Category, as: 'category' }
        ]
    });
    return { data: products, status: 200 };
};

/**
 * @desc Fetch all featured products with assets and category
 * @route GET /products/featured
 */
export const getFeaturedProducts = async (req: Request, res: Response) => {
    const products = await Product.findAll({
        where: { featured: true },
        include: [
            { model: Asset, as: 'assets' },
            { model: Category, as: 'category' }
        ]
    });
    return { data: products, status: 200 };
};

export default { getAllProducts, getFeaturedProducts };
