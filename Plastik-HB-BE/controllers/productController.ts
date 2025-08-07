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

/**
 * @desc Update featured products
 * @route PUT /products/featured
 * @body { productIds: string[] }
 */
export const updateFeaturedProducts = async (req: Request, res: Response) => {
    const { productIds } = req.body;
    if (!Array.isArray(productIds)) {
        return res.status(400).json({ message: 'productIds must be an array' });
    }
    // Set all products to not featured
    await Product.update({ featured: false }, { where: {} });
    // Set selected products to featured
    await Product.update({ featured: true }, { where: { id: productIds } });
    // Return updated featured products
    const featured = await Product.findAll({
        where: { featured: true },
        include: [
            { model: Asset, as: 'assets' },
            { model: Category, as: 'category' }
        ]
    });
    return res.status(200).json({ message: 'Featured products updated', data: featured });
};

export default { getAllProducts, getFeaturedProducts, updateFeaturedProducts };
