import { Request, Response } from 'express';
import { ProductService, CreateProductData } from '../services/productService';
import { Product } from '../models/Product';
import { Asset } from '../models/Asset';
import { Category } from '../models/Category';

/**
 * @desc Fetch all products with assets and category
 * @route GET /products
 */
export const getAllProducts = async (req: Request, res: Response) => {
    const products = await ProductService.getAllProducts();
    return { data: products, status: 200 };
};

/**
 * @desc Fetch all featured products with assets and category
 * @route GET /products/featured
 */
export const getFeaturedProducts = async (req: Request, res: Response) => {
    const products = await ProductService.getFeaturedProducts();
    return { data: products, status: 200 };
};

/**
 * @desc Create new product with file upload
 * @route POST /products
 */
export const createProduct = async (req: Request, res: Response) => {
    const {
        name,
        price,
        description,
        specification,
        category_name,
        category_id,
        discount,
        featured,
        status
    } = req.body;

    const uploadedFiles = req.files as Express.Multer.File[];

    if (!name || !price) {
        throw { message: 'Name and price are required.', status: 400 };
    }

    if (!category_name && !category_id) {
        throw { message: 'Either category_name or category_id is required.', status: 400 };
    }

    const productData: CreateProductData = {
        name,
        price,
        description,
        specification,
        category_name,
        category_id,
        discount,
        featured,
        status
    };

    const product = await ProductService.createCompleteProduct(productData, uploadedFiles);
    
    return { 
        data: product, 
        status: 201,
        message: 'Product created successfully'
    };
};

/**
 * @desc Update existing product
 * @route PUT /products/:id
 */
export const updateProduct = async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
        name,
        price,
        description,
        specification,
        category_name,
        category_id,
        discount,
        featured,
        status
    } = req.body;

    if (!name || !price) {
        throw { message: 'Name and price are required.', status: 400 };
    }

    if (!category_name && !category_id) {
        throw { message: 'Either category_name or category_id is required.', status: 400 };
    }

    const productData: CreateProductData = {
        name,
        price,
        description,
        specification,
        category_name,
        category_id,
        discount,
        featured,
        status
    };

    const uploadedFiles = req.files as Express.Multer.File[] || [];
    const updatedProduct = await ProductService.updateProduct(id, productData, uploadedFiles);
    
    return { 
        data: updatedProduct, 
        status: 200,
        message: 'Product updated successfully'
    };
};

/**
 * @desc Delete existing product
 * @route DELETE /products/:id
 */
export const deleteProduct = async (req: Request, res: Response) => {
    const { id } = req.params;
    const deletedProduct = await ProductService.deleteProduct(id);
    
    return { 
        data: deletedProduct, 
        status: 200,
        message: 'Product deleted successfully'
    };
};

/**
 * @desc Delete product asset
 * @route DELETE /products/:id/assets/:assetId
 */
export const deleteProductAsset = async (req: Request, res: Response) => {
    const { id: productId, assetId } = req.params;
    const deletedAsset = await ProductService.deleteProductAsset(productId, assetId);
    
    return { 
        data: deletedAsset, 
        status: 200,
        message: 'Asset deleted successfully'
    };
};

/**
 * @desc Replace main image of product
 * @route PUT /products/:id/main-image
 */
export const replaceMainImage = async (req: Request, res: Response) => {
    const { id } = req.params;
    const uploadedFiles = req.files as Express.Multer.File[] || [];
    
    if (uploadedFiles.length === 0) {
        throw { message: 'No image file provided', status: 400 };
    }
    
    const updatedProduct = await ProductService.replaceMainImage(id, uploadedFiles[0]);
    
    return { 
        data: updatedProduct, 
        status: 200,
        message: 'Main image replaced successfully'
    };
};

/**
 * @desc Replace specific asset by asset ID
 * @route PUT /products/:id/assets/:assetId
 */
export const replaceAsset = async (req: Request, res: Response) => {
    const { id: productId, assetId } = req.params;
    const uploadedFiles = req.files as Express.Multer.File[] || [];
    
    if (uploadedFiles.length === 0) {
        throw { message: 'No image file provided', status: 400 };
    }
    
    const updatedProduct = await ProductService.replaceAssetById(productId, assetId, uploadedFiles[0]);
    
    return { 
        data: updatedProduct, 
        status: 200,
        message: 'Asset replaced successfully'
    };
};

/**
 * @desc Reorder assets of a product
 * @route PATCH /products/:id/assets/reorder
 */
export const reorderAssets = async (req: Request, res: Response) => {
    const { id: productId } = req.params;
    const { assetOrderMap } = req.body;
    
    if (!assetOrderMap || !Array.isArray(assetOrderMap)) {
        throw { message: 'assetOrderMap is required and must be an array', status: 400 };
    }
    
    const updatedProduct = await ProductService.reorderAssets(productId, assetOrderMap);
    
    return { 
        data: updatedProduct, 
        status: 200,
        message: 'Assets reordered successfully'
    };
};

/* @desc Update featured products
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

export default { 
    getAllProducts, 
    getFeaturedProducts, 
    createProduct, 
    updateProduct, 
    deleteProduct, 
    deleteProductAsset, 
    replaceMainImage,
    replaceAsset,
    reorderAssets,
    updateFeaturedProducts
};

