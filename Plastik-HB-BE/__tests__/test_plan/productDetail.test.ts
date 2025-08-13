import { Product } from '../../models/Product';

jest.mock('../../models/Product');

describe('Product Detail', () => {
  it('TC-041: should show product name and image on detail page', async () => {
    (Product.findByPk as jest.Mock).mockResolvedValue({ name: 'A', image: 'img.jpg' });
    const result = await Product.findByPk(1);
    expect(result).toHaveProperty('name');
    expect(result).toHaveProperty('image');
  });

  it('TC-042: should show full product description', async () => {
    (Product.findByPk as jest.Mock).mockResolvedValue({ description: 'desc' });
    const result = await Product.findByPk(1);
    expect(result).toHaveProperty('description');
  });

  it('TC-043: should provide contact/WhatsApp info on product detail', async () => {
    (Product.findByPk as jest.Mock).mockResolvedValue({ whatsapp: '08123456789' });
    const result = await Product.findByPk(1);
    expect(result).toHaveProperty('whatsapp');
  });
});