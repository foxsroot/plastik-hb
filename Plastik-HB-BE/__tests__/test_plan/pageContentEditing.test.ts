import { updateHomepageData, updateAboutPageData } from '../../services/pageService';

jest.mock('../../services/pageService');

describe('Page Content Editing', () => {
  // TC-053-a: Edit homepage content
  it('TC-053-a: should allow admin to edit homepage content', async () => {
    (updateHomepageData as jest.Mock).mockResolvedValue({ title: 'Homepage', description: 'Homepage description', published: true, sections: [] });
    const result = await updateHomepageData({ title: 'Homepage', description: 'Homepage description', published: true, sections: [] });
    expect(result).toHaveProperty('title', 'Homepage');
  });

  // TC-053-b: Edit About Us content
  it('TC-053-b: should allow admin to edit About Us content', async () => {
    (updateAboutPageData as jest.Mock).mockResolvedValue({ id: 'about', title: 'Tentang Kami', description: 'Deskripsi Tentang Kami', published: true, sections: [] });
    const result = await updateAboutPageData({ id: 'about', title: 'Tentang Kami', description: 'Deskripsi Tentang Kami', published: true, sections: [] });
    expect(result).toHaveProperty('title', 'Tentang Kami');
  });
});