import * as contactController from '../../controllers/contactController';
import { ContactService } from '../../services/contactService';

jest.mock('../../services/contactService');

describe('contactController', () => {
  const mockReq: any = {};
  const mockRes: any = {};

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getContactInfo returns contact info', async () => {
    (ContactService.getContactSection as jest.Mock).mockResolvedValue({ data: { id: '1', type: 'ADDRESS' } });
    const result = await contactController.getContactInfo(mockReq, mockRes);
    expect(result).toEqual({ data: { id: '1', type: 'ADDRESS' }, status: 200 });
  });

  it('putContactInfo updates contact info', async () => {
    (ContactService.updateContactSection as jest.Mock).mockResolvedValue({ data: { id: '1', type: 'ADDRESS' } });
    mockReq.body = { data: { phoneNumber: '123' } };
    const result = await contactController.putContactInfo(mockReq, mockRes);
    expect(result).toEqual({ data: { id: '1', type: 'ADDRESS' }, status: 200 });
  });
});