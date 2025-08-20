import { ProductService } from '../../services/productService';
import { Product } from '../../models/Product';
import { Category } from '../../models/Category';
import { Asset } from '../../models/Asset';
import { FileManager } from '../../utils/fileManager';

jest.mock('../../models/Product');
jest.mock('../../models/Category');
jest.mock('../../models/Asset');
jest.mock('../../utils/fileManager');

describe('ProductService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('handleCategory', () => {
    it('throws if category_id not found', async () => {
      const spy = jest.spyOn(Category, 'findByPk').mockResolvedValue(null);
      await expect(ProductService['handleCategory'](undefined, 'badid')).rejects.toThrow('Category with provided ID not found');
      spy.mockRestore();
    });

    it('throws if neither category_name nor category_id provided', async () => {
      await expect(ProductService['handleCategory']()).rejects.toThrow('Either category_name or category_id must be provided');
    });
  });

  describe('createCompleteProduct', () => {
    it('rolls back and cleans up files on error', async () => {
      (Product as any).sequelize = { transaction: jest.fn().mockResolvedValue({
        commit: jest.fn(),
        rollback: jest.fn()
      }) };
      jest.spyOn(ProductService as any, 'handleCategory').mockRejectedValue(new Error('fail'));
      const cleanupSpy = jest.spyOn(FileManager, 'cleanupFailedUpload').mockImplementation();
      await expect(ProductService.createCompleteProduct(
        { name: 'A', price: 1 },
        [{
          fieldname: 'image',
          originalname: 'img.png',
          encoding: '7bit',
          mimetype: 'image/png',
          size: 1234,
          destination: '/tmp',
          filename: 'img.png',
          path: '/tmp/img.png',
          buffer: Buffer.from(''),
          stream: {} as any, // Add a dummy stream property to satisfy the File type
        }]
      )).rejects.toThrow('fail');
      expect(cleanupSpy).toHaveBeenCalled();
    });
  });

  describe('updateProduct', () => {
    it('throws if product not found', async () => {
      (Product.findByPk as jest.Mock).mockResolvedValue(null);
      await expect(ProductService.updateProduct('badid', { name: 'A', price: 1 }, [])).rejects.toThrow("Product with ID 'badid' not found");
    });
  });

  describe('deleteProduct', () => {
    it('throws if product not found', async () => {
      (Product.findByPk as jest.Mock).mockResolvedValue(null);
      await expect(ProductService.deleteProduct('badid')).rejects.toThrow("Product with ID 'badid' not found");
    });

    it('deletes files if assets exist', async () => {
      const mockProduct = { id: '1', assets: [{ url: 'file1' }, { url: 'file2' }], destroy: jest.fn() };
      (Product.findByPk as jest.Mock).mockResolvedValue(mockProduct);
      (Asset.destroy as jest.Mock).mockResolvedValue(undefined);
      const deleteFilesSpy = jest.spyOn(FileManager, 'deleteFiles').mockImplementation();
      await ProductService.deleteProduct('1');
      expect(deleteFilesSpy).toHaveBeenCalledWith(['file1', 'file2']);
    });
  });

  describe('deleteProductAsset', () => {
    it('throws if asset not found', async () => {
      (Product as any).transaction = jest.fn().mockResolvedValue({
        commit: jest.fn(),
        rollback: jest.fn()
      });
      (Asset.findOne as jest.Mock).mockResolvedValue(null);
      await expect(ProductService.deleteProductAsset('pid', 'aid')).rejects.toThrow("Asset with ID 'aid' not found for product 'pid'");
    });
  });

  describe('replaceMainImage', () => {
    it('calls replaceAssetByOrder', async () => {
      const spy = jest.spyOn(ProductService, 'replaceAssetByOrder').mockResolvedValue({} as any);
      await ProductService.replaceMainImage('pid', { filename: 'img.png' } as any);
      expect(spy).toHaveBeenCalledWith('pid', 1, { filename: 'img.png' });
      spy.mockRestore();
    });
  });

  describe('replaceAssetByOrder', () => {
    it('rolls back and cleans up file on error', async () => {
      (Product as any).sequelize = { transaction: jest.fn().mockResolvedValue({
        commit: jest.fn(),
        rollback: jest.fn()
      }) };
      (Asset.findOne as jest.Mock).mockRejectedValue(new Error('fail'));
      const cleanupSpy = jest.spyOn(FileManager, 'cleanupFailedUpload').mockImplementation();
      await expect(ProductService.replaceAssetByOrder('pid', 1, { filename: 'img.png' } as any)).rejects.toThrow('fail');
      expect(cleanupSpy).toHaveBeenCalled();
    });
  });

  describe('replaceAssetById', () => {
    it('throws if asset not found', async () => {
      (Product as any).sequelize = { transaction: jest.fn().mockResolvedValue({
        commit: jest.fn(),
        rollback: jest.fn()
      }) };
      (Asset.findOne as jest.Mock).mockResolvedValue(null);
      await expect(ProductService.replaceAssetById('pid', 'aid', { filename: 'img.png' } as any)).rejects.toThrow("Asset with ID 'aid' not found for product 'pid'");
    });

    it('rolls back and cleans up file on error', async () => {
      (Product as any).sequelize = { transaction: jest.fn().mockResolvedValue({
        commit: jest.fn(),
        rollback: jest.fn()
      }) };
      (Asset.findOne as jest.Mock).mockRejectedValue(new Error('fail'));
      const cleanupSpy = jest.spyOn(FileManager, 'cleanupFailedUpload').mockImplementation();
      await expect(ProductService.replaceAssetById('pid', 'aid', { filename: 'img.png' } as any)).rejects.toThrow('fail');
      expect(cleanupSpy).toHaveBeenCalled();
    });
  });
});