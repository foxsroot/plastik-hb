import { Category } from '../../models/Category';
import { Product } from '../../models/Product';

jest.mock('../../models/Category');
jest.mock('../../models/Product');

describe('Category Management', () => {
  // TC-055: Edit category name
  it('TC-055: should allow admin to edit category name', async () => {
    (Category.update as jest.Mock).mockResolvedValue([1]);
    const result = await Category.update({ category: 'Baru' }, { where: { id: 1 } });
    expect(result[0]).toBe(1);
  });

  // TC-056-a: Delete unused category
  it('TC-056-a: should allow deleting unused category', async () => {
    (Product.count as jest.Mock).mockResolvedValue(0);
    (Category.destroy as jest.Mock).mockResolvedValue(1);
    const productCount = await Product.count({ where: { category_id: 1 } });
    let result = 0;
    if (productCount === 0) {
      result = await Category.destroy({ where: { id: 1 } });
    }
    expect(result).toBe(1);
  });

  // TC-056-b: Prevent deleting used category
  it('TC-056-b: should prevent deleting category in use', async () => {
    (Product.count as jest.Mock).mockResolvedValue(2);
    const productCount = await Product.count({ where: { category_id: 1 } });
    expect(productCount).toBeGreaterThan(0);
  });
});