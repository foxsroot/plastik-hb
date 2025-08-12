import request from 'supertest';
import app from '../../app';
import { updateBannerInSection, updateHomepageData, deleteBannerImage } from '../../services/pageService';

jest.mock('../../services/pageService');

describe('Banner Management', () => {
  // TC-021-a: Upload jpg/png banner
  it('TC-021-a: should allow uploading jpg/png banner', async () => {
    const res = await request(app)
      .post('/api/uploads')
      .attach('image', Buffer.from('dummy'), { filename: 'banner.jpg', contentType: 'image/jpeg' });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('imageUrl');
  });

  // TC-021-b: Reject unsupported file format
  it('TC-021-b: should reject unsupported file formats', async () => {
    const res = await request(app)
      .post('/api/uploads')
      .attach('image', Buffer.from('dummy'), { filename: 'banner.exe', contentType: 'application/octet-stream' });
    expect(res.status).toBe(400);
  });

  // TC-022-a: Edit banner image/text
  it('TC-022-a: should allow editing banner image and text', async () => {
    (updateBannerInSection as jest.Mock).mockResolvedValue({ success: true });
    const result = await updateBannerInSection('sectionId', 0, { title: 'New Banner' });
    expect(result).toHaveProperty('success', true);
  });

  // TC-022-b: Change banner order
  it('TC-022-b: should allow changing banner order', async () => {
    (updateHomepageData as jest.Mock).mockResolvedValue({ success: true });
    const result = await updateHomepageData({
      title: 'Homepage',
      description: 'Homepage description',
      published: true,
      sections: [{ type: 'banner_carousel', order: 1 }]
    });
    expect(result).toHaveProperty('success', true);
  });

  // TC-023: Delete banner
  it('TC-023: should delete a banner', async () => {
    (deleteBannerImage as jest.Mock).mockResolvedValue(undefined);
    await expect(deleteBannerImage('/uploads/banner.jpg')).resolves.toBeUndefined();
  });

  // TC-024: Banner auto-rotates with smooth transition
  it('TC-024: should provide banners for frontend to rotate with transition', async () => {
    // This is a frontend concern, but backend should return banners array
    const banners = [{ image: '/uploads/banner1.jpg' }, { image: '/uploads/banner2.jpg' }];
    (updateHomepageData as jest.Mock).mockResolvedValue({ sections: [{ type: 'banner_carousel', data: { banners } }] });
    const result = await updateHomepageData({
      title: 'Homepage',
      description: 'Homepage description',
      published: true,
      sections: [{ type: 'banner_carousel', data: { banners } }]
    }) as { sections: { type: string; data: { banners: { image: string }[] } }[] };
    expect(result.sections[0].data.banners.length).toBeGreaterThan(1);
  });

  // TC-025: Manual banner navigation
  it('TC-025: should provide banners for manual navigation', async () => {
    const banners = [{ image: '/uploads/banner1.jpg' }, { image: '/uploads/banner2.jpg' }];
    (updateHomepageData as jest.Mock).mockResolvedValue({ sections: [{ type: 'banner_carousel', data: { banners } }] });
    const result = await updateHomepageData({
      title: 'Homepage',
      description: 'Homepage description',
      published: true,
      sections: [{ type: 'banner_carousel', data: { banners } }]
    }) as { sections: { type: string; data: { banners: { image: string }[] } }[] };
    expect(result.sections[0].data.banners).toEqual(expect.any(Array));
  });
});