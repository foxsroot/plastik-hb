import * as productController from '../../controllers/productController';
import * as productService from '../../services/productService';
import { Product } from '../../models/Product';
import { Asset } from '../../models/Asset';
import { Category } from '../../models/Category';

jest.mock('../../services/productService');
jest.mock('../../models/Product');
jest.mock('../../models/Asset');
jest.mock('../../models/Category');

describe('productController', () => {
  const mockRes: any = {};

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getProductById', () => {
    it('should throw error if id is missing', async () => {
      const req = { params: {} };
      await expect(productController.getProductById(req as any, mockRes)).rejects.toEqual({
        message: 'Product ID is required.',
        status: 400,
      });
    });

    it('should throw error if product not found', async () => {
      (productService.ProductService.getProductById as jest.Mock).mockResolvedValue(null);
      const req = { params: { id: 'notfound' } };
      await expect(productController.getProductById(req as any, mockRes)).rejects.toEqual({
        message: 'Product not found.',
        status: 404,
      });
    });

    it('should return product with status 200', async () => {
      (productService.ProductService.getProductById as jest.Mock).mockResolvedValue({ id: '1', name: 'Test' });
      const req = { params: { id: '1' } };
      const result = await productController.getProductById(req as any, mockRes);
      expect(result).toEqual({ data: { id: '1', name: 'Test' }, status: 200 });
    });
  });

  describe('createProduct', () => {
    it('should throw error if name or price missing', async () => {
      const req = { body: { price: 100 }, files: [] };
      await expect(productController.createProduct(req as any, mockRes)).rejects.toEqual({
        message: 'Name and price are required.',
        status: 400,
      });
    });

    it('should throw error if category missing', async () => {
      const req = { body: { name: 'Test', price: 100 }, files: [] };
      await expect(productController.createProduct(req as any, mockRes)).rejects.toEqual({
        message: 'Either category_name or category_id is required.',
        status: 400,
      });
    });

    it('should create product and return status 201', async () => {
      (productService.ProductService.createCompleteProduct as jest.Mock).mockResolvedValue({ id: '1', name: 'Test' });
      const req = { body: { name: 'Test', price: 100, category_id: 'cat1' }, files: [] };
      const result = await productController.createProduct(req as any, mockRes);
      expect(result).toEqual({ data: { id: '1', name: 'Test' }, status: 201, message: 'Product created successfully' });
    });
  });

  describe('updateProduct', () => {
    it('should throw error if name or price missing', async () => {
      const req = { params: { id: '1' }, body: { price: 100 }, files: [] };
      await expect(productController.updateProduct(req as any, mockRes)).rejects.toEqual({
        message: 'Name and price are required.',
        status: 400,
      });
    });

    it('should throw error if category missing', async () => {
      const req = { params: { id: '1' }, body: { name: 'Test', price: 100 }, files: [] };
      await expect(productController.updateProduct(req as any, mockRes)).rejects.toEqual({
        message: 'Either category_name or category_id is required.',
        status: 400,
      });
    });

    it('should update product and return status 200', async () => {
      (productService.ProductService.updateProduct as jest.Mock).mockResolvedValue({ id: '1', name: 'Test' });
      const req = { params: { id: '1' }, body: { name: 'Test', price: 100, category_id: 'cat1' }, files: [] };
      const result = await productController.updateProduct(req as any, mockRes);
      expect(result).toEqual({ data: { id: '1', name: 'Test' }, status: 200, message: 'Product updated successfully' });
    });
  });

  describe('deleteProduct', () => {
    it('should delete product and return status 200', async () => {
      (productService.ProductService.deleteProduct as jest.Mock).mockResolvedValue({ id: '1' });
      const req = { params: { id: '1' } };
      const result = await productController.deleteProduct(req as any, mockRes);
      expect(result).toEqual({ data: { id: '1' }, status: 200, message: 'Product deleted successfully' });
    });
  });

  describe('replaceMainImage', () => {
    it('should throw error if no image file provided', async () => {
      const req = { params: { id: '1' }, files: [] };
      await expect(productController.replaceMainImage(req as any, mockRes)).rejects.toEqual({
        message: 'No image file provided',
        status: 400,
      });
    });

    it('should replace main image and return status 200', async () => {
      (productService.ProductService.replaceMainImage as jest.Mock).mockResolvedValue({ id: '1', name: 'Test' });
      const req = { params: { id: '1' }, files: [{ filename: 'img.png' }] };
      const result = await productController.replaceMainImage(req as any, mockRes);
      expect(result).toEqual({ data: { id: '1', name: 'Test' }, status: 200, message: 'Main image replaced successfully' });
    });
  });

  describe('replaceAsset', () => {
    it('should throw error if no image file provided', async () => {
      const req = { params: { id: '1', assetId: 'a1' }, files: [] };
      await expect(productController.replaceAsset(req as any, mockRes)).rejects.toEqual({
        message: 'No image file provided',
        status: 400,
      });
    });

    it('should replace asset and return status 200', async () => {
      (productService.ProductService.replaceAssetById as jest.Mock).mockResolvedValue({ id: '1', name: 'Test' });
      const req = { params: { id: '1', assetId: 'a1' }, files: [{ filename: 'img.png' }] };
      const result = await productController.replaceAsset(req as any, mockRes);
      expect(result).toEqual({ data: { id: '1', name: 'Test' }, status: 200, message: 'Asset replaced successfully' });
    });
  });

  describe('reorderAssets', () => {
    it('should throw error if assetOrderMap is missing or not array', async () => {
      const req = { params: { id: '1' }, body: {} };
      await expect(productController.reorderAssets(req as any, mockRes)).rejects.toEqual({
        message: 'assetOrderMap is required and must be an array',
        status: 400,
      });
    });

    it('should reorder assets and return status 200', async () => {
      (productService.ProductService.reorderAssets as jest.Mock).mockResolvedValue({ id: '1', name: 'Test' });
      const req = { params: { id: '1' }, body: { assetOrderMap: ['a1', 'a2'] } };
      const result = await productController.reorderAssets(req as any, mockRes);
      expect(result).toEqual({ data: { id: '1', name: 'Test' }, status: 200, message: 'Assets reordered successfully' });
    });
  });

  describe('getCatalogProducts', () => {
    it('should return catalog products', async () => {
      (productService.ProductService.getActiveProducts as jest.Mock).mockResolvedValue([{ id: '1', name: 'Test' }]);
      const req = { query: { categoryId: 'cat1', priceMin: '100', priceMax: '500', featured: 'true' } };
      const result = await productController.getCatalogProducts(req as any, mockRes);
      expect(result).toEqual({ data: [{ id: '1', name: 'Test' }], status: 200, message: 'Catalog products retrieved successfully' });
    });
  });

  describe('getActiveCategories', () => {
    it('should return active categories', async () => {
      (productService.ProductService.getActiveCategories as jest.Mock).mockResolvedValue([{ id: '1', category: 'A' }]);
      const result = await productController.getActiveCategories({} as any, mockRes);
      expect(result).toEqual({ data: [{ id: '1', category: 'A' }], status: 200, message: 'Active categories retrieved successfully' });
    });

    it('should handle error in getActiveCategories', async () => {
      (productService.ProductService.getActiveCategories as jest.Mock).mockRejectedValue(new Error('fail'));
      const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
      await expect(productController.getActiveCategories({} as any, mockRes)).rejects.toEqual({
        message: 'Failed to fetch categories: fail',
        status: 500,
      });
      spy.mockRestore();
    });
  });

  describe('getAllCategoriesForCatalog', () => {
    it('should return all categories', async () => {
      (Category.findAll as jest.Mock).mockResolvedValue([{ id: '1', category: 'A' }]);
      const result = await productController.getAllCategoriesForCatalog({} as any, mockRes);
      expect(result).toEqual({ data: [{ id: '1', category: 'A' }], status: 200, message: 'All categories retrieved successfully' });
    });

    it('should handle error in getAllCategoriesForCatalog', async () => {
      (Category.findAll as jest.Mock).mockRejectedValue(new Error('fail'));
      const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
      await expect(productController.getAllCategoriesForCatalog({} as any, mockRes)).rejects.toEqual({
        message: 'Failed to fetch all categories: fail',
        status: 500,
      });
      spy.mockRestore();
    });
  });
});