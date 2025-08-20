import * as categoryController from '../../controllers/categoryController';
import * as categoryService from '../../services/categoryService';

jest.mock('../../services/categoryService');

describe('categoryController', () => {
  const mockRes: any = {};

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllCategories', () => {
    it('should return categories with product count', async () => {
      (categoryService.CategoryService.getAllCategories as jest.Mock).mockResolvedValue([
        { id: '1', category: 'A', created_at: 'now', updated_at: 'now' }
      ]);
      (categoryService.CategoryService.getProductsByCategory as jest.Mock).mockResolvedValue([{ id: 'p1' }, { id: 'p2' }]);
      const result = await categoryController.getAllCategories({} as any, mockRes);
      expect(result.data[0]).toMatchObject({ productCount: 2 });
      expect(result.status).toBe(200);
    });
  });

  describe('createCategory', () => {
    it('should throw error if category is missing', async () => {
      const req = { body: {} };
      await expect(categoryController.createCategory(req as any, mockRes)).rejects.toEqual({
        message: 'Category name is required and must be a string',
        status: 400,
      });
    });

    it('should throw error if category is not a string', async () => {
      const req = { body: { category: 123 } };
      await expect(categoryController.createCategory(req as any, mockRes)).rejects.toEqual({
        message: 'Category name is required and must be a string',
        status: 400,
      });
    });

    it('should throw error if category name is too short', async () => {
      const req = { body: { category: 'A' } };
      await expect(categoryController.createCategory(req as any, mockRes)).rejects.toEqual({
        message: 'Category name must be at least 2 characters long',
        status: 400,
      });
    });

    it('should throw error if category name is too long', async () => {
      const req = { body: { category: 'A'.repeat(51) } };
      await expect(categoryController.createCategory(req as any, mockRes)).rejects.toEqual({
        message: 'Category name must not exceed 50 characters',
        status: 400,
      });
    });

    it('should create category successfully', async () => {
      (categoryService.CategoryService.createCategory as jest.Mock).mockResolvedValue({ id: '2', category: 'B' });
      const req = { body: { category: 'Valid Name' } };
      const result = await categoryController.createCategory(req as any, mockRes);
      expect(result).toMatchObject({
        data: { id: '2', category: 'B' },
        status: 201,
        message: 'Category created successfully'
      });
    });
  });

  describe('updateCategory', () => {
    it('should throw error if category is missing', async () => {
      const req = { params: { id: '1' }, body: {} };
      await expect(categoryController.updateCategory(req as any, mockRes)).rejects.toEqual({
        message: 'Category name is required',
        status: 400,
      });
    });

    it('should throw error if category not found', async () => {
      (categoryService.isCategoryExist as jest.Mock).mockResolvedValue(false);
      const req = { params: { id: '1' }, body: { category: 'NewCat' } };
      await expect(categoryController.updateCategory(req as any, mockRes)).rejects.toEqual({
        message: 'Category not found',
        status: 404,
      });
    });

    it('should update category successfully', async () => {
      (categoryService.isCategoryExist as jest.Mock).mockResolvedValue(true);
      (categoryService.CategoryService.updateCategory as jest.Mock).mockResolvedValue({ id: '1', category: 'Updated' });
      const req = { params: { id: '1' }, body: { category: 'Updated' } };
      const result = await categoryController.updateCategory(req as any, mockRes);
      expect(result).toMatchObject({
        data: { id: '1', category: 'Updated' },
        status: 200,
        message: 'Category updated successfully'
      });
    });
  });

  describe('deleteCategory', () => {
    it('should throw error if category not found', async () => {
      (categoryService.isCategoryExist as jest.Mock).mockResolvedValue(false);
      const req = { params: { id: '1' } };
      await expect(categoryController.deleteCategory(req as any, mockRes)).rejects.toEqual({
        message: 'Category not found',
        status: 404,
      });
    });

    it('should delete category successfully', async () => {
      (categoryService.isCategoryExist as jest.Mock).mockResolvedValue(true);
      (categoryService.CategoryService.deleteCategory as jest.Mock).mockResolvedValue(undefined);
      const req = { params: { id: '1' } };
      const result = await categoryController.deleteCategory(req as any, mockRes);
      expect(result).toMatchObject({
        data: null,
        status: 200,
        message: 'Category deleted successfully'
      });
    });
  });

  describe('getProductsByCategory', () => {
    it('should throw error if category not found', async () => {
      (categoryService.isCategoryExist as jest.Mock).mockResolvedValue(false);
      const req = { params: { id: '1' } };
      await expect(categoryController.getProductsByCategory(req as any, mockRes)).rejects.toEqual({
        message: 'Category not found',
        status: 404,
      });
    });

    it('should return products for category', async () => {
      (categoryService.isCategoryExist as jest.Mock).mockResolvedValue(true);
      (categoryService.CategoryService.getProductsByCategory as jest.Mock).mockResolvedValue([{ id: 'p1' }]);
      const req = { params: { id: '1' } };
      const result = await categoryController.getProductsByCategory(req as any, mockRes);
      expect(result).toMatchObject({
        data: [{ id: 'p1' }],
        status: 200
      });
    });
  });
});