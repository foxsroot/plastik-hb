import { Category } from '../models/Category';
import { Product } from '../models/Product';
import { Asset } from '../models/Asset';

export class CategoryService {
    /**
     * Get all categories with optional product count
     */
    static async getAllCategories(includeProductCount = false): Promise<Category[]> {
        if (includeProductCount) {
            return await Category.findAll({
                attributes: {
                    include: [
                        [
                            Product.sequelize!.fn('COUNT', Product.sequelize!.col('products.id')),
                            'productCount'
                        ]
                    ]
                },
                include: [
                    {
                        model: Product,
                        as: 'products',
                        attributes: [],
                        required: false
                    }
                ],
                group: ['Category.id'],
                order: [['category', 'ASC']]
            });
        }

        return await Category.findAll({
            order: [['category', 'ASC']]
        });
    }

    /**
     * Get category by ID with optional relations
     */
    static async getCategoryById(id: string, includeProducts = false): Promise<Category | null> {
        const include = includeProducts ? [
            {
                model: Product,
                as: 'products',
                include: [{ model: Asset, as: 'assets' }]
            }
        ] : [];

        return await Category.findByPk(id, { include });
    }

    /**
     * Create new category
     */
    static async createCategory(categoryName: string): Promise<Category> {
        const existingCategory = await Category.findOne({
            where: { category: categoryName }
        });

        if (existingCategory) {
            throw new Error(`Category '${categoryName}' already exists`);
        }

        return await Category.create({ category: categoryName });
    }

    /**
     * Update category by ID
     */
    static async updateCategory(id: string, categoryName: string): Promise<Category> {
        const existingCategory = await Category.findByPk(id);
        if (!existingCategory) {
            throw new Error(`Category with ID '${id}' not found`);
        }

        const duplicateCategory = await Category.findOne({
            where: {
                category: categoryName.trim(),
                id: { [require('sequelize').Op.ne]: id }
            }
        });

        if (duplicateCategory) {
            throw new Error(`Category '${categoryName}' already exists`);
        }

        await existingCategory.update({ category: categoryName.trim() });
        return existingCategory;
    }

    /**
     * Delete category by ID
     */
    static async deleteCategory(id: string): Promise<void> {
        const existingCategory = await Category.findByPk(id);
        if (!existingCategory) {
            throw new Error(`Category with ID '${id}' not found`);
        }

        const productsUsingCategory = await Product.count({
            where: { category_id: id }
        });

        if (productsUsingCategory > 0) {
            throw new Error(`Cannot delete category. ${productsUsingCategory} product(s) are using this category`);
        }

        await existingCategory.destroy();
    }

    /**
     * Get all products in a specific category
     */
    static async getProductsByCategory(categoryId: string): Promise<Product[]> {
        const category = await Category.findByPk(categoryId);
        if (!category) {
            throw new Error(`Category with ID '${categoryId}' not found`);
        }

        return await Product.findAll({
            where: { category_id: categoryId },
            include: [
                { model: Asset, as: 'assets' },
                { model: Category, as: 'category' }
            ],
            order: [['created_at', 'DESC']]
        });
    }

    /**
     * Search categories by name
     */
    static async searchCategories(searchTerm: string): Promise<Category[]> {
        return await Category.findAll({
            where: {
                category: {
                    [require('sequelize').Op.iLike]: `%${searchTerm}%`
                }
            },
            order: [['category', 'ASC']]
        });
    }

    /**
     * Get category statistics
     */
    static async getCategoryStats(id: string) {
        const category = await Category.findByPk(id);
        if (!category) {
            throw new Error(`Category with ID '${id}' not found`);
        }

        const productCount = await Product.count({
            where: { category_id: id }
        });

        const featuredProductCount = await Product.count({
            where: {
                category_id: id,
                featured: true
            }
        });

        const activeProductCount = await Product.count({
            where: {
                category_id: id,
                status: 'Aktif'
            }
        });

        return {
            category,
            productCount,
            featuredProductCount,
            activeProductCount
        };
    }
}

/**
* Check category existence
*/
export const isCategoryExist = async (id: string): Promise<boolean> => {
    let category;
    try {
        category = await Category.findByPk(id);
    } catch (error) {
        return false;
    }
    return !!category;
}
