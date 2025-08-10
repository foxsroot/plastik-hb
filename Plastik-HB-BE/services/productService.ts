import { Product } from '../models/Product';
import { Category } from '../models/Category';
import { Asset } from '../models/Asset';
import { CategoryService } from './categoryService';
import { FileManager } from '../utils/fileManager';
import { Op } from 'sequelize';

// Default alt image path - hanya nama file saja
const DEFAULT_ALT_IMAGE = 'Alt-Image-Produk.png';

export interface CreateProductData {
    name: string;
    price: number;
    description?: string;
    specification?: string;
    category_name?: string;
    category_id?: string;
    discount?: number;
    featured?: boolean;
    status?: 'Aktif' | 'Draft';
}

export class ProductService {
    /**
     * Get all products with associations
     */
    static async getAllProducts(): Promise<Product[]> {
        return await Product.findAll({
            include: [
                { 
                    model: Asset, 
                    as: 'assets',
                    order: [['order', 'ASC']]
                },
                { model: Category, as: 'category' }
            ]
        });
    }

    /**
     * Get all featured products with associations
     */
    static async getFeaturedProducts(): Promise<Product[]> {
        return await Product.findAll({
            where: { featured: true, status: 'active' },
            include: [
                { 
                    model: Asset, 
                    as: 'assets',
                    order: [['order', 'ASC']]
                },
                { model: Category, as: 'category' }
            ]
        });
    }

    /**
     * Get single product by ID with associations
     */
    static async getProductById(id: string): Promise<Product | null> {
        console.log('🔍 ProductService: Fetching product with ID:', id);
        
        const product = await Product.findByPk(id, {
            include: [
                { 
                    model: Asset, 
                    as: 'assets',
                    order: [['order', 'ASC']]
                },
                { 
                    model: Category, 
                    as: 'category',
                    required: false // LEFT JOIN instead of INNER JOIN
                }
            ]
        });
        
        console.log('📦 ProductService: Found product:', {
            id: product?.id,
            name: product?.name,
            category: product?.category?.category,
            assetsCount: product?.assets?.length || 0
        });
        
        return product;
    }

    /**
     * Get all active products for public catalog with filtering
     */
    static async getActiveProducts(filters?: {
        categoryId?: string;
        priceMin?: number;
        priceMax?: number;
        featured?: boolean;
    }): Promise<Product[]> {
        const whereConditions: any = {
            status: 'Aktif' // Only show active products
        };

        // Apply filters
        if (filters?.categoryId) {
            whereConditions.category_id = filters.categoryId;
        }

        if (filters?.priceMin !== undefined || filters?.priceMax !== undefined) {
            whereConditions.price = {};
            if (filters.priceMin !== undefined) {
                whereConditions.price[Op.gte] = filters.priceMin;
            }
            if (filters.priceMax !== undefined) {
                whereConditions.price[Op.lte] = filters.priceMax;
            }
        }

        if (filters?.featured !== undefined) {
            whereConditions.featured = filters.featured;
        }

        return await Product.findAll({
            where: whereConditions,
            include: [
                { 
                    model: Asset, 
                    as: 'assets',
                    order: [['order', 'ASC']]
                },
                { model: Category, as: 'category' }
            ],
            order: [['created_at', 'DESC']]
        });
    }

    /**
     * Get all categories that have active products
     */
    static async getActiveCategories(): Promise<Category[]> {
        // 🔧 FIXED: Use a simpler approach without complex joins
        const activeProducts = await Product.findAll({
            where: { status: 'Aktif' },
            attributes: ['category_id'],
            group: ['category_id'],
            raw: true
        });

        if (activeProducts.length === 0) {
            return [];
        }

        const categoryIds = activeProducts.map((product: any) => product.category_id);

        return await Category.findAll({
            where: {
                id: categoryIds
            },
            order: [['category', 'ASC']]
        });
    }

    /**
     * Handle category creation or selection using CategoryService
     */
    private static async handleCategory(category_name?: string, category_id?: string): Promise<string> {
        if (category_id) {
            const existingCategory = await CategoryService.getCategoryById(category_id);
            if (!existingCategory) {
                throw new Error('Category with provided ID not found');
            }
            return category_id;
        }

        if (category_name) {
            // Try to find existing category
            const categories = await CategoryService.getAllCategories();
            const existingCategory = categories.find(cat => 
                cat.category.toLowerCase() === category_name.toLowerCase()
            );

            if (existingCategory) {
                return existingCategory.id;
            }

            // Create new category if not found
            const newCategory = await CategoryService.createCategory(category_name);
            return newCategory.id;
        }

        throw new Error('Either category_name or category_id must be provided');
    }

    /**
     * Create product with basic data
     */
    private static async createProduct(productData: Omit<CreateProductData, 'category_name' | 'assets'> & { category_id: string }): Promise<Product> {
        return await Product.create({
            name: productData.name,
            price: productData.price,
            description: productData.description,
            specification: productData.specification,
            category_id: productData.category_id,
            discount: productData.discount || 0,
            featured: productData.featured || false,
            status: productData.status || 'Draft'
        });
    }

    /**
     * Create assets for product
     */
    private static async createAssets(productId: string, uploadedFiles: Express.Multer.File[] = []): Promise<Asset[]> {
        if (!uploadedFiles || uploadedFiles.length === 0) {
            return [];
        }

        const assetsData = uploadedFiles.map((file, index) => ({
            product_id: productId,
            url: file.filename,
            alt: DEFAULT_ALT_IMAGE,
            type: 'IMAGE' as const,
            order: index + 1
        }));

        return await Asset.bulkCreate(assetsData);
    }

    /**
     * Create complete product with transaction
     */
    static async createCompleteProduct(data: CreateProductData, uploadedFiles: Express.Multer.File[] = []): Promise<Product> {
        const transaction = await Product.sequelize!.transaction();

        try {
            const categoryId = await this.handleCategory(data.category_name, data.category_id);

            const product = await this.createProduct({
                name: data.name,
                price: data.price,
                description: data.description,
                specification: data.specification,
                category_id: categoryId,
                discount: data.discount,
                featured: data.featured,
                status: data.status
            });

            await this.createAssets(product.id, uploadedFiles);
            await transaction.commit();

            const completeProduct = await Product.findByPk(product.id, {
                include: [
                    { model: Asset, as: 'assets' },
                    { model: Category, as: 'category' }
                ]
            });

            return completeProduct!;
        } catch (error) {
            await transaction.rollback();
            
            // Clean up uploaded files if transaction fails
            if (uploadedFiles && uploadedFiles.length > 0) {
                FileManager.cleanupFailedUpload(uploadedFiles);
            }
            
            throw error;
        }
    }

    /**
     * Update existing product
     */
    static async updateProduct(id: string, productData: CreateProductData, uploadedFiles: Express.Multer.File[] = []): Promise<Product> {
        const existingProduct = await Product.findByPk(id, {
            include: [
                { model: Asset, as: 'assets' },
                { model: Category, as: 'category' }
            ]
        });

        if (!existingProduct) {
            throw new Error(`Product with ID '${id}' not found`);
        }

        const categoryId = await this.handleCategory(productData.category_name, productData.category_id);

        await existingProduct.update({
            name: productData.name,
            price: productData.price,
            description: productData.description,
            specification: productData.specification,
            category_id: categoryId,
            discount: productData.discount || 0,
            featured: productData.featured || false,
            status: productData.status || 'Draft'
        });

        if (uploadedFiles && uploadedFiles.length > 0) {
            // Get current highest order for this product
            const existingAssets = await Asset.findAll({ 
                where: { product_id: id },
                order: [['order', 'DESC']],
                limit: 1
            });

            let nextOrder = existingAssets.length > 0 ? existingAssets[0].order + 1 : 1;
            
            const assetsData = uploadedFiles.map((file) => {
                const assetData = {
                    product_id: id,
                    url: file.filename,
                    alt: DEFAULT_ALT_IMAGE,
                    type: 'IMAGE' as const,
                    order: nextOrder
                };
                
                nextOrder++;
                return assetData;
            });

            await Asset.bulkCreate(assetsData);
        }

        const result = await Product.findByPk(id, {
            include: [
                { model: Asset, as: 'assets' },
                { model: Category, as: 'category' }
            ]
        });

        return result!;
    }

    /**
     * Delete existing product
     */
    static async deleteProduct(id: string): Promise<Product> {
        const existingProduct = await Product.findByPk(id, {
            include: [
                { model: Asset, as: 'assets' },
                { model: Category, as: 'category' }
            ]
        });

        if (!existingProduct) {
            throw new Error(`Product with ID '${id}' not found`);
        }

        const productData = JSON.parse(JSON.stringify(existingProduct));
        
        // Delete physical files before deleting database records
        if (existingProduct.assets && existingProduct.assets.length > 0) {
            const filesToDelete = existingProduct.assets.map((asset: any) => asset.url);
            FileManager.deleteFiles(filesToDelete);
        }

        await Asset.destroy({ where: { product_id: id } });
        await existingProduct.destroy();

        return productData;
    }

    /**
     * Delete product asset and reorder remaining assets
     */
    static async deleteProductAsset(productId: string, assetId: string): Promise<Asset> {
        const transaction = await Product.sequelize!.transaction();

        try {
            const asset = await Asset.findOne({
                where: {
                    id: assetId,
                    product_id: productId
                }
            });

            if (!asset) {
                throw new Error(`Asset with ID '${assetId}' not found for product '${productId}'`);
            }

            const deletedOrder = asset.order;
            const assetUrl = asset.url;

            // Delete the asset
            await asset.destroy({ transaction });

            // Reorder remaining assets (decrease order by 1 for assets with order > deletedOrder)
            await Asset.increment(
                { order: -1 },
                {
                    where: {
                        product_id: productId,
                        order: { [Op.gt]: deletedOrder }
                    },
                    transaction
                }
            );

            await transaction.commit();

            // Delete physical file after successful transaction
            if (assetUrl) {
                FileManager.deleteFile(assetUrl);
            }

            return asset;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Replace main image (order 1) of a product
     */
    static async replaceMainImage(productId: string, newImageFile: Express.Multer.File): Promise<Product> {
        return this.replaceAssetByOrder(productId, 1, newImageFile);
    }

    /**
     * Replace asset by order position
     */
    static async replaceAssetByOrder(productId: string, order: number, newImageFile: Express.Multer.File): Promise<Product> {
        const transaction = await Product.sequelize!.transaction();
        let oldImageUrl: string | null = null;

        try {
            const existingAsset = await Asset.findOne({
                where: {
                    product_id: productId,
                    order: order
                }
            });

            if (existingAsset) {
                oldImageUrl = existingAsset.url;
                await existingAsset.destroy({ transaction });
            }

            await Asset.create({
                product_id: productId,
                url: newImageFile.filename,
                alt: DEFAULT_ALT_IMAGE,
                type: 'IMAGE',
                order: order
            }, { transaction });

            await transaction.commit();

            // Delete old physical file after successful transaction
            if (oldImageUrl) {
                FileManager.deleteFile(oldImageUrl);
            }

            const updatedProduct = await Product.findByPk(productId, {
                include: [
                    { model: Asset, as: 'assets', order: [['order', 'ASC']] },
                    { model: Category, as: 'category' }
                ]
            });

            return updatedProduct!;
        } catch (error) {
            await transaction.rollback();
            
            // Clean up the new uploaded file if transaction fails
            FileManager.cleanupFailedUpload(newImageFile);
            
            throw error;
        }
    }

    /**
     * Replace asset by asset ID
     */
    static async replaceAssetById(productId: string, assetId: string, newImageFile: Express.Multer.File): Promise<Product> {
        const transaction = await Product.sequelize!.transaction();
        let oldImageUrl: string | null = null;
        let assetOrder: number = 1;

        try {
            const existingAsset = await Asset.findOne({
                where: {
                    id: assetId,
                    product_id: productId
                }
            });

            if (!existingAsset) {
                throw new Error(`Asset with ID '${assetId}' not found for product '${productId}'`);
            }

            oldImageUrl = existingAsset.url;
            assetOrder = existingAsset.order;

            // Update existing asset with new file
            await existingAsset.update({
                url: newImageFile.filename,
                alt: DEFAULT_ALT_IMAGE
            }, { transaction });

            await transaction.commit();

            // Delete old physical file after successful transaction
            if (oldImageUrl) {
                FileManager.deleteFile(oldImageUrl);
            }

            const updatedProduct = await Product.findByPk(productId, {
                include: [
                    { model: Asset, as: 'assets', order: [['order', 'ASC']] },
                    { model: Category, as: 'category' }
                ]
            });

            return updatedProduct!;
        } catch (error) {
            await transaction.rollback();
            
            // Clean up the new uploaded file if transaction fails
            FileManager.cleanupFailedUpload(newImageFile);
            
            throw error;
        }
    }

    /**
     * Reorder assets for a product
     */
    static async reorderAssets(productId: string, assetOrderMap: { assetId: string; newOrder: number }[]): Promise<Product> {
        const transaction = await Product.sequelize!.transaction();

        try {
            // Validate that all assets belong to the product
            const existingAssets = await Asset.findAll({
                where: { product_id: productId }
            });

            const existingAssetIds = existingAssets.map(asset => asset.id);
            const providedAssetIds = assetOrderMap.map(item => item.assetId);

            // Check if all provided asset IDs exist
            for (const assetId of providedAssetIds) {
                if (!existingAssetIds.includes(assetId)) {
                    throw new Error(`Asset with ID '${assetId}' not found for product '${productId}'`);
                }
            }

            // Update each asset's order
            for (const { assetId, newOrder } of assetOrderMap) {
                await Asset.update(
                    { order: newOrder },
                    { 
                        where: { 
                            id: assetId,
                            product_id: productId 
                        },
                        transaction 
                    }
                );
            }

            await transaction.commit();

            const updatedProduct = await Product.findByPk(productId, {
                include: [
                    { model: Asset, as: 'assets', order: [['order', 'ASC']] },
                    { model: Category, as: 'category' }
                ]
            });

            return updatedProduct!;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }
}