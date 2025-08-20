import * as analyticController from '../../controllers/analyticController';
import * as analyticService from '../../services/analyticService';

jest.mock('../../services/analyticService');

describe('analyticController', () => {
  const mockReq: any = { body: {}, headers: {}, socket: { remoteAddress: '127.0.0.1' } };
  const mockRes: any = {};

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq.body = {};
    mockReq.headers = {};
    mockReq.socket = { remoteAddress: '127.0.0.1' };
  });

  describe('addAnalytics', () => {
    it('should throw error if type is missing', async () => {
      mockReq.body = { targetId: '1', url: '/test' };
      await expect(analyticController.addAnalytics(mockReq, mockRes)).rejects.toEqual({
        message: 'Type, targetId, and url are required.',
        status: 400,
      });
    });

    it('should throw error if targetId is missing', async () => {
      mockReq.body = { type: 'click', url: '/test' };
      await expect(analyticController.addAnalytics(mockReq, mockRes)).rejects.toEqual({
        message: 'Type, targetId, and url are required.',
        status: 400,
      });
    });

    it('should throw error if url is missing', async () => {
      mockReq.body = { type: 'click', targetId: '1' };
      await expect(analyticController.addAnalytics(mockReq, mockRes)).rejects.toEqual({
        message: 'Type, targetId, and url are required.',
        status: 400,
      });
    });

    it('should throw error if targetId does not exist', async () => {
      mockReq.body = { type: 'click', targetId: '1', url: '/test' };
      (analyticService.isExist as jest.Mock).mockReturnValue(false);
      await expect(analyticController.addAnalytics(mockReq, mockRes)).rejects.toEqual({
        message: 'Target ID does not exist.',
        status: 404,
      });
    });

    it('should create analytics and return status 201', async () => {
      mockReq.body = { type: 'click', targetId: '1', url: '/test' };
      (analyticService.isExist as jest.Mock).mockReturnValue(true);
      (analyticService.createAnalytics as jest.Mock).mockResolvedValue({ id: '123', type: 'click' });
      const result = await analyticController.addAnalytics(mockReq, mockRes);
      expect(result).toEqual({ data: { id: '123', type: 'click' }, status: 201 });
    });

    it('should use x-forwarded-for header for ipAddress', async () => {
      mockReq.body = { type: 'click', targetId: '1', url: '/test' };
      mockReq.headers = { 'x-forwarded-for': '8.8.8.8,1.1.1.1' };
      (analyticService.isExist as jest.Mock).mockReturnValue(true);
      (analyticService.createAnalytics as jest.Mock).mockResolvedValue({ id: '123', type: 'click' });
      const result = await analyticController.addAnalytics(mockReq, mockRes);
      expect(analyticService.createAnalytics).toHaveBeenCalledWith(
        expect.objectContaining({ ipAddress: '8.8.8.8' })
      );
      expect(result).toEqual({ data: { id: '123', type: 'click' }, status: 201 });
    });
  });
});