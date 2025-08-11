import { CategoryService } from '../../services/categoryService';
import { Category } from '../../models/Category';
import { Product } from '../../models/Product';
import { Asset } from '../../models/Asset';

// Mock dependencies
jest.mock('../../models/Category');
jest.mock('../../models/Product');
jest.mock('../../models/Asset');

const mockedCategory = Category as jest.Mocked<typeof Category>;
const mockedProduct = Product as jest.Mocked<typeof Product>;

(Product as any).sequelize = {
  fn: jest.fn((...args) => args.join(',')),
  col: jest.fn((col) => col),
};

describe('CategoryService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('getAllCategories', () => {
        it('should return all categories without product count', async () => {
            const mockCategories = [
                { id: '1', category: 'Electronics' },
                { id: '2', category: 'Clothing' }
            ];

            mockedCategory.findAll.mockResolvedValue(mockCategories as any);

            const result = await CategoryService.getAllCategories();

            expect(mockedCategory.findAll).toHaveBeenCalledWith({
                order: [['category', 'ASC']]
            });
            expect(result).toEqual(mockCategories);
        });

        it('should return categories with product count when includeProductCount is true', async () => {
            const mockCategories = [
                { id: '1', category: 'Electronics', productCount: 5 },
                { id: '2', category: 'Clothing', productCount: 3 }
            ];

            mockedCategory.findAll.mockResolvedValue(mockCategories as any);

            const result = await CategoryService.getAllCategories(true);

            expect(mockedCategory.findAll).toHaveBeenCalledWith({
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
            expect(result).toEqual(mockCategories);
        });
    });

    describe('getCategoryById', () => {
        it('should return category by ID without products', async () => {
            const mockCategory = { id: '1', category: 'Electronics' };
            mockedCategory.findByPk.mockResolvedValue(mockCategory as any);

            const result = await CategoryService.getCategoryById('1');

            expect(mockedCategory.findByPk).toHaveBeenCalledWith('1', { include: [] });
            expect(result).toEqual(mockCategory);
        });

        it('should return category by ID with products when includeProducts is true', async () => {
            const mockCategory = { 
                id: '1', 
                category: 'Electronics',
                products: [{ id: '1', name: 'Phone' }]
            };
            mockedCategory.findByPk.mockResolvedValue(mockCategory as any);

            const result = await CategoryService.getCategoryById('1', true);

            expect(mockedCategory.findByPk).toHaveBeenCalledWith('1', { 
                include: [
                    {
                        model: Product,
                        as: 'products',
                        include: [{ model: Asset, as: 'assets' }]
                    }
                ]
            });
            expect(result).toEqual(mockCategory);
        });

        it('should return null when category not found', async () => {
            mockedCategory.findByPk.mockResolvedValue(null);

            const result = await CategoryService.getCategoryById('999');

            expect(result).toBeNull();
        });
    });

    describe('createCategory', () => {
        it('should create new category successfully', async () => {
            const newCategory = { id: '1', category: 'New Category' };
            mockedCategory.findOne.mockResolvedValue(null);
            mockedCategory.create.mockResolvedValue(newCategory as any);

            const result = await CategoryService.createCategory('New Category');

            expect(mockedCategory.findOne).toHaveBeenCalledWith({
                where: { category: 'New Category' }
            });
            expect(mockedCategory.create).toHaveBeenCalledWith({ category: 'New Category' });
            expect(result).toEqual(newCategory);
        });

        it('should throw error when category already exists', async () => {
            const existingCategory = { id: '1', category: 'Existing Category' };
            mockedCategory.findOne.mockResolvedValue(existingCategory as any);

            await expect(CategoryService.createCategory('Existing Category'))
                .rejects.toThrow("Category 'Existing Category' already exists");

            expect(mockedCategory.create).not.toHaveBeenCalled();
        });
    });

    describe('updateCategory', () => {
        it('should update category successfully', async () => {
            const existingCategory = { 
                id: '1', 
                category: 'Old Name',
                update: jest.fn().mockResolvedValue(undefined)
            };
            mockedCategory.findByPk.mockResolvedValue(existingCategory as any);
            mockedCategory.findOne.mockResolvedValue(null);

            const result = await CategoryService.updateCategory('1', 'New Name');

            expect(mockedCategory.findByPk).toHaveBeenCalledWith('1');
            expect(existingCategory.update).toHaveBeenCalledWith({ category: 'New Name' });
            expect(result).toEqual(existingCategory);
        });

        it('should throw error when category not found', async () => {
            mockedCategory.findByPk.mockResolvedValue(null);

            await expect(CategoryService.updateCategory('999', 'New Name'))
                .rejects.toThrow("Category with ID '999' not found");
        });

        it('should throw error when duplicate category name exists', async () => {
            const existingCategory = { id: '1', category: 'Old Name' };
            const duplicateCategory = { id: '2', category: 'Duplicate Name' };
            
            mockedCategory.findByPk.mockResolvedValue(existingCategory as any);
            mockedCategory.findOne.mockResolvedValue(duplicateCategory as any);

            await expect(CategoryService.updateCategory('1', 'Duplicate Name'))
                .rejects.toThrow("Category 'Duplicate Name' already exists");
        });
    });

    describe('deleteCategory', () => {
        it('should delete category successfully when no products exist', async () => {
            const existingCategory = { 
                id: '1', 
                category: 'Test Category',
                destroy: jest.fn().mockResolvedValue(undefined)
            };
            mockedCategory.findByPk.mockResolvedValue(existingCategory as any);
            mockedProduct.count.mockResolvedValue(0);

            await CategoryService.deleteCategory('1');

            expect(mockedCategory.findByPk).toHaveBeenCalledWith('1');
            expect(mockedProduct.count).toHaveBeenCalledWith({ where: { category_id: '1' } });
            expect(existingCategory.destroy).toHaveBeenCalled();
        });

        it('should throw error when category not found', async () => {
            mockedCategory.findByPk.mockResolvedValue(null);

            await expect(CategoryService.deleteCategory('999'))
                .rejects.toThrow("Category with ID '999' not found");
        });

        it('should throw error when products are using this category', async () => {
            const existingCategory = { id: '1', category: 'Test Category' };
            mockedCategory.findByPk.mockResolvedValue(existingCategory as any);
            mockedProduct.count.mockResolvedValue(3);

            await expect(CategoryService.deleteCategory('1'))
                .rejects.toThrow("Cannot delete category. 3 product(s) are using this category");
        });
    });

    describe('getProductsByCategory', () => {
        it('should return products for valid category', async () => {
            const mockCategory = { id: '1', category: 'Electronics' };
            const mockProducts = [
                { id: '1', name: 'Phone', category_id: '1' },
                { id: '2', name: 'Laptop', category_id: '1' }
            ];

            mockedCategory.findByPk.mockResolvedValue(mockCategory as any);
            mockedProduct.findAll.mockResolvedValue(mockProducts as any);

            const result = await CategoryService.getProductsByCategory('1');

            expect(mockedCategory.findByPk).toHaveBeenCalledWith('1');
            expect(mockedProduct.findAll).toHaveBeenCalledWith({
                where: { category_id: '1' },
                include: [
                    { model: Asset, as: 'assets' },
                    { model: Category, as: 'category' }
                ],
                order: [['created_at', 'DESC']]
            });
            expect(result).toEqual(mockProducts);
        });

        it('should throw error when category not found', async () => {
            mockedCategory.findByPk.mockResolvedValue(null);

            await expect(CategoryService.getProductsByCategory('999'))
                .rejects.toThrow("Category with ID '999' not found");
        });
    });

    describe('searchCategories', () => {
        it('should return categories matching search term', async () => {
            const mockCategories = [
                { id: '1', category: 'Electronics' },
                { id: '2', category: 'Electronic Components' }
            ];

            mockedCategory.findAll.mockResolvedValue(mockCategories as any);

            const result = await CategoryService.searchCategories('electr');

            expect(mockedCategory.findAll).toHaveBeenCalledWith({
                where: {
                    category: {
                        [require('sequelize').Op.iLike]: '%electr%'
                    }
                },
                order: [['category', 'ASC']]
            });
            expect(result).toEqual(mockCategories);
        });
    });

    describe('getCategoryStats', () => {
        it('should return category statistics', async () => {
            const mockCategory = { id: '1', category: 'Electronics' };
            mockedCategory.findByPk.mockResolvedValue(mockCategory as any);
            mockedProduct.count
                .mockResolvedValueOnce(10) // total products
                .mockResolvedValueOnce(3)  // featured products
                .mockResolvedValueOnce(8); // active products

            const result = await CategoryService.getCategoryStats('1');

            expect(mockedCategory.findByPk).toHaveBeenCalledWith('1');
            expect(mockedProduct.count).toHaveBeenCalledTimes(3);
            expect(result).toEqual({
                category: mockCategory,
                productCount: 10,
                featuredProductCount: 3,
                activeProductCount: 8
            });
        });

        it('should throw error when category not found', async () => {
            mockedCategory.findByPk.mockResolvedValue(null);

            await expect(CategoryService.getCategoryStats('999'))
                .rejects.toThrow("Category with ID '999' not found");
        });
    });
});