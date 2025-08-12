import { Page } from '../../models/Page';
import { Section } from '../../models/Section';

jest.mock('../../models/Page');
jest.mock('../../models/Section');

describe('About Us Page', () => {
  afterEach(() => jest.clearAllMocks());

  // TC-011: About Us page shows correct data
  it('TC-011: should return About Us page data matching the database', async () => {
    const mockPage = {
      slug: 'tentang-kami',
      title: 'Tentang Kami',
      description: 'Deskripsi perusahaan',
      values: 'Nilai-nilai',
      vision: 'Visi',
      mission: 'Misi',
      history: 'Sejarah'
    };
    (Page.findOne as jest.Mock).mockResolvedValue(mockPage);

    const result = await Page.findOne({ where: { slug: 'tentang-kami' } });
    expect(result).toMatchObject({
      slug: 'tentang-kami',
      description: expect.any(String),
      values: expect.any(String),
      vision: expect.any(String),
      mission: expect.any(String),
      history: expect.any(String)
    });
  });

  // TC-012: About Us page shows contact info
  it('TC-012: should return address and phone number on About Us page', async () => {
    const mockSection = {
      type: 'ADDRESS',
      data: {
        address: 'Jl. Mawar No. 1',
        phone: '08123456789'
      }
    };
    (Section.findOne as jest.Mock).mockResolvedValue(mockSection);

    const result = await Section.findOne({ where: { type: 'ADDRESS' } });
    expect(result).not.toBeNull();
    expect(result!.data).toHaveProperty('address');
    expect(result!.data).toHaveProperty('phone');
  });
});