import { ProductService } from '../../services/productService';
import { Product } from '../../models/Product';
import { Category } from '../../models/Category';
import { Asset } from '../../models/Asset';
import { CategoryService } from '../../services/categoryService';
import { FileManager } from '../../utils/fileManager';

// Mock dependencies
jest.mock('../../models/Product');
jest.mock('../../models/Category');
jest.mock('../../models/Asset');
jest.mock('../../services/categoryService');
jest.mock('../../utils/fileManager');

const mockedProduct = Product as jest.Mocked<typeof Product>;
const mockedCategory = Category as jest.Mocked<typeof Category>;
const mockedAsset = Asset as jest.Mocked<typeof Asset>;
const mockedCategoryService = CategoryService as jest.Mocked<typeof CategoryService>;
const mockedFileManager = FileManager as jest.Mocked<typeof FileManager>;

// Mock sequelize transaction
const mockTransaction = {
    commit: jest.fn(),
    rollback: jest.fn()
};

describe('ProductService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        (Product.sequelize as any) = {
            transaction: jest.fn().mockResolvedValue(mockTransaction),
            fn: jest.fn(),
            col: jest.fn()
        };
    });

    describe('getAllProducts', () => {
        it('should return all products with associations', async () => {
            const mockProducts = [
                { id: '1', name: 'Product 1', assets: [], category: { id: '1', category: 'Electronics' } },
                { id: '2', name: 'Product 2', assets: [], category: { id: '2', category: 'Clothing' } }
            ];

            mockedProduct.findAll.mockResolvedValue(mockProducts as any);

            const result = await ProductService.getAllProducts();

            expect(mockedProduct.findAll).toHaveBeenCalledWith({
                include: [
                    {
                        model: Asset,
                        as: 'assets',
                        order: [['order', 'ASC']]
                    },
                    { model: Category, as: 'category' }
                ]
            });
            expect(result).toEqual(mockProducts);
        });
    });

    describe('getFeaturedProducts', () => {
        it('should return featured active products', async () => {
            const mockProducts = [
                { id: '1', name: 'Featured Product', featured: true, status: 'active' }
            ];

            mockedProduct.findAll.mockResolvedValue(mockProducts as any);

            const result = await ProductService.getFeaturedProducts();

            expect(mockedProduct.findAll).toHaveBeenCalledWith({
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
            expect(result).toEqual(mockProducts);
        });
    });

    describe('getProductById', () => {
        it('should return product by ID with associations', async () => {
            const mockProduct = {
                id: '1',
                name: 'Test Product',
                assets: [],
                category: { id: '1', category: 'Electronics' }
            };

            mockedProduct.findByPk.mockResolvedValue(mockProduct as any);

            const result = await ProductService.getProductById('1');

            expect(mockedProduct.findByPk).toHaveBeenCalledWith('1', {
                include: [
                    {
                        model: Asset,
                        as: 'assets',
                        order: [['order', 'ASC']]
                    },
                    {
                        model: Category,
                        as: 'category',
                        required: false
                    }
                ]
            });
            expect(result).toEqual(mockProduct);
        });

        it('should return null when product not found', async () => {
            mockedProduct.findByPk.mockResolvedValue(null);

            const result = await ProductService.getProductById('999');

            expect(result).toBeNull();
        });
    });

    describe('getActiveProducts', () => {
        it('should return active products without filters', async () => {
            const mockProducts = [
                { id: '1', name: 'Active Product', status: 'active' }
            ];

            mockedProduct.findAll.mockResolvedValue(mockProducts as any);

            const result = await ProductService.getActiveProducts();

            expect(mockedProduct.findAll).toHaveBeenCalledWith({
                where: { status: 'active' },
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
            expect(result).toEqual(mockProducts);
        });

        it('should return active products with filters', async () => {
            const mockProducts = [
                { id: '1', name: 'Filtered Product', status: 'active' }
            ];

            mockedProduct.findAll.mockResolvedValue(mockProducts as any);

            const filters = {
                categoryId: '1',
                priceMin: 100,
                priceMax: 500,
                featured: true
            };

            const result = await ProductService.getActiveProducts(filters);

            expect(mockedProduct.findAll).toHaveBeenCalledWith({
                where: {
                    status: 'active',
                    category_id: '1',
                    price: { [expect.any(Symbol)]: 100, [expect.any(Symbol)]: 500 },
                    featured: true
                },
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
            expect(result).toEqual(mockProducts);
        });
    });

    describe('createCompleteProduct', () => {
        it('should create product successfully with category_id', async () => {
            const productData = {
                name: 'New Product',
                price: 100,
                description: 'Test description',
                category_id: '1'
            };

            const mockCategory = { id: '1', category: 'Electronics' };
            const mockProduct = { id: '1', ...productData };
            const mockCompleteProduct = { ...mockProduct, assets: [], category: mockCategory };

            mockedCategoryService.getCategoryById.mockResolvedValue(mockCategory as any);
            mockedProduct.create.mockResolvedValue(mockProduct as any);
            mockedAsset.bulkCreate.mockResolvedValue([]);
            mockedProduct.findByPk.mockResolvedValue(mockCompleteProduct as any);

            const result = await ProductService.createCompleteProduct(productData);

            expect(mockedCategoryService.getCategoryById).toHaveBeenCalledWith('1');
            expect(mockedProduct.create).toHaveBeenCalledWith({
                name: 'New Product',
                price: 100,
                description: 'Test description',
                specification: undefined,
                category_id: '1',
                discount: 0,
                featured: false,
                status: 'Draft'
            });
            expect(mockTransaction.commit).toHaveBeenCalled();
            expect(result).toEqual(mockCompleteProduct);
        });

        it('should create product with new category name', async () => {
            const productData = {
                name: 'New Product',
                price: 100,
                category_name: 'New Category'
            };

            const mockNewCategory = { id: '2', category: 'New Category' };
            const mockProduct = { id: '1', ...productData, category_id: '2' };

            mockedCategoryService.getAllCategories.mockResolvedValue([]);
            mockedCategoryService.createCategory.mockResolvedValue(mockNewCategory as any);
            mockedProduct.create.mockResolvedValue(mockProduct as any);
            mockedAsset.bulkCreate.mockResolvedValue([]);
            mockedProduct.findByPk.mockResolvedValue(mockProduct as any);

            const result = await ProductService.createCompleteProduct(productData);

            expect(mockedCategoryService.createCategory).toHaveBeenCalledWith('New Category');
            expect(mockTransaction.commit).toHaveBeenCalled();
        });

        it('should rollback transaction on error', async () => {
            const productData = {
                name: 'New Product',
                price: 100,
                category_id: '999'
            };

            mockedCategoryService.getCategoryById.mockResolvedValue(null);

            await expect(ProductService.createCompleteProduct(productData))
                .rejects.toThrow('Category with provided ID not found');

            expect(mockTransaction.rollback).toHaveBeenCalled();
        });

        it('should handle uploaded files', async () => {
            const productData = {
                name: 'New Product',
                price: 100,
                category_id: '1'
            };

            const uploadedFiles = [
                { filename: 'image1.jpg' },
                { filename: 'image2.jpg' }
            ] as Express.Multer.File[];

            const mockCategory = { id: '1', category: 'Electronics' };
            const mockProduct = { id: '1', ...productData };

            mockedCategoryService.getCategoryById.mockResolvedValue(mockCategory as any);
            mockedProduct.create.mockResolvedValue(mockProduct as any);
            mockedAsset.bulkCreate.mockResolvedValue([]);
            mockedProduct.findByPk.mockResolvedValue(mockProduct as any);

            await ProductService.createCompleteProduct(productData, uploadedFiles);

            expect(mockedAsset.bulkCreate).toHaveBeenCalledWith([
                {
                    product_id: '1',
                    url: 'image1.jpg',
                    alt: 'Alt-Image-Produk.png',
                    type: 'IMAGE',
                    order: 1
                },
                {
                    product_id: '1',
                    url: 'image2.jpg',
                    alt: 'Alt-Image-Produk.png',
                    type: 'IMAGE',
                    order: 2
                }
            ]);
        });
    });

    describe('deleteProduct', () => {
        it('should delete product successfully', async () => {
            const mockProduct = {
                id: '1',
                name: 'Product to delete',
                assets: [{ url: 'image1.jpg' }, { url: 'image2.jpg' }],
                destroy: jest.fn().mockResolvedValue(undefined)
            };

            mockedProduct.findByPk.mockResolvedValue(mockProduct as any);
            mockedAsset.destroy.mockResolvedValue(2 as any);

            const result = await ProductService.deleteProduct('1');

            expect(mockedFileManager.deleteFiles).toHaveBeenCalledWith(['image1.jpg', 'image2.jpg']);
            expect(mockedAsset.destroy).toHaveBeenCalledWith({ where: { product_id: '1' } });
            expect(mockProduct.destroy).toHaveBeenCalled();
            expect(result.id).toBe('1');
        });

        it('should throw error when product not found', async () => {
            mockedProduct.findByPk.mockResolvedValue(null);

            await expect(ProductService.deleteProduct('999'))
                .rejects.toThrow("Product with ID '999' not found");
        });
    });
});