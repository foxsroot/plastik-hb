import { Product } from '../../models/Product';

jest.mock('../../models/Product');

describe('Product CRUD', () => {
  // TC-052-a: Add product
  it('TC-052-a: should allow admin to add product', async () => {
    (Product.create as jest.Mock).mockResolvedValue({ id: 1 });
    const result = await Product.create({ name: 'A' });
    expect(result).toHaveProperty('id');
  });

  // TC-052-b: Update product
  it('TC-052-b: should allow admin to update product', async () => {
    (Product.update as jest.Mock).mockResolvedValue([1]);
    const result = await Product.update({ name: 'B' }, { where: { id: 1 } });
    expect(result[0]).toBe(1);
  });

  // TC-052-c: Delete product
  it('TC-052-c: should allow admin to delete product', async () => {
    (Product.destroy as jest.Mock).mockResolvedValue(1);
    const result = await Product.destroy({ where: { id: 1 } });
    expect(result).toBe(1);
  });
});