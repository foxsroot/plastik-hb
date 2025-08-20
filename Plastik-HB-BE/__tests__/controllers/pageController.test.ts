import * as pageController from '../../controllers/pageController';
import { PageService } from '../../services/pageService';

jest.mock('../../services/pageService');

describe('pageController', () => {
  const mockReq: any = {};
  const mockRes: any = {};

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getPage returns page data', async () => {
    (PageService.getPageBySlug as jest.Mock).mockResolvedValue({ id: '1', title: 'Home' });
    mockReq.params = { slug: 'homepage' };
    const result = await pageController.getPage(mockReq, mockRes);
    expect(result).toEqual({ data: { id: '1', title: 'Home' }, status: 200 });
  });

  it('updateHomepage updates homepage', async () => {
    (PageService.updateHomepageData as jest.Mock).mockResolvedValue({ id: '1', title: 'Home' });
    mockReq.body = { title: 'Home' };
    const result = await pageController.updateHomepage(mockReq, mockRes);
    expect(result).toEqual({ data: { id: '1', title: 'Home' }, status: 200, message: 'Homepage updated' });
  });

  it('updateAboutPage updates about page', async () => {
    (PageService.updateAboutPageData as jest.Mock).mockResolvedValue({ id: '2', title: 'About' });
    mockReq.body = { title: 'About' };
    const result = await pageController.updateAboutPage(mockReq, mockRes);
    expect(result).toEqual({ data: { id: '2', title: 'About' }, status: 200, message: 'About page updated' });
  });
});