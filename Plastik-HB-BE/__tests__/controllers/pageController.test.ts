import * as pageController from '../../controllers/pageController';
import { PageService } from '../../services/pageService';

jest.mock('../../services/pageService');

function createMockRes() {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe('pageController', () => {
  let mockReq: any;
  let mockRes: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = {};
    mockRes = createMockRes();
  });

  it('getPage returns page data', async () => {
    (PageService.getPageBySlug as jest.Mock).mockResolvedValue({ id: '1', title: 'Home' });
    mockReq.params = { slug: 'homepage' };
    const result = await pageController.getPage(mockReq, mockRes);
    expect(result).toEqual({ data: { id: '1', title: 'Home' }, status: 200 });
  });

  it('updateHomepage updates homepage', async () => {
    (PageService.updateHomepageData as jest.Mock).mockResolvedValue({ id: '1', title: 'Home' });
    mockReq.body = { title: 'Home', sections: [] };
    await pageController.updateHomepage(mockReq, mockRes);
    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Homepage updated', data: { id: '1', title: 'Home' } });
  });

  it('updateAboutPage updates about page', async () => {
  (PageService.updateAboutPageData as jest.Mock).mockResolvedValue({ id: '2', title: 'About' });
  mockReq.body = { id: '2', title: 'About', sections: [] };
  await pageController.updateAboutPage(mockReq, mockRes);
  expect(mockRes.status).toHaveBeenCalledWith(200);
  expect(mockRes.json).toHaveBeenCalledWith({ message: 'About page updated', data: { id: '2', title: 'About' } });
  });
});