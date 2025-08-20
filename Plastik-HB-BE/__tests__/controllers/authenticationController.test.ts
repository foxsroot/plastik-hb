import * as authenticationController from '../../controllers/authenticationController';
import * as authenticationService from '../../services/authenticationService';

jest.mock('../../services/authenticationService');

describe('authenticationController', () => {
  const mockRes: any = {};

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('loginUser', () => {
    it('should throw error if email is missing', async () => {
      const req = { body: { password: 'pass' } };
      await expect(authenticationController.loginUser(req as any, mockRes)).rejects.toEqual({
        message: 'Email and password are required.',
        status: 400,
      });
    });

    it('should throw error if password is missing', async () => {
      const req = { body: { email: 'test@mail.com' } };
      await expect(authenticationController.loginUser(req as any, mockRes)).rejects.toEqual({
        message: 'Email and password are required.',
        status: 400,
      });
    });

    it('should return token if email and password are provided', async () => {
      (authenticationService.login as jest.Mock).mockResolvedValue('token123');
      const req = { body: { email: 'test@mail.com', password: 'pass' } };
      const result = await authenticationController.loginUser(req as any, mockRes);
      expect(result).toEqual({ token: 'token123', status: 200 });
    });
  });

  describe('logoutUser', () => {
    it('should throw error if token is missing', async () => {
      const req = { body: {} };
      await expect(authenticationController.logoutUser(req as any, mockRes)).rejects.toEqual({
        message: 'Token is required.',
        status: 400,
      });
    });

    it('should return success if token is provided', async () => {
      (authenticationService.logout as jest.Mock).mockResolvedValue(undefined);
      const req = { body: { token: 'token123' } };
      const result = await authenticationController.logoutUser(req as any, mockRes);
      expect(result).toEqual({ message: 'Logout successful', status: 200 });
    });
  });

  describe('verify', () => {
    it('should throw error if token is missing', async () => {
      const req = { body: {} };
      await expect(authenticationController.verify(req as any, mockRes)).rejects.toEqual({
        message: 'Token is required.',
        status: 400,
      });
    });

    it('should return valid if token is provided', async () => {
      (authenticationService.verifySession as jest.Mock).mockResolvedValue(undefined);
      const req = { body: { token: 'token123' } };
      const result = await authenticationController.verify(req as any, mockRes);
      expect(result).toEqual({ message: 'Session is valid', status: 200 });
    });
  });
});