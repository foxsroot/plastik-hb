import { login, logout, verifySession } from '../../services/authenticationService';
import { User } from '../../models/User';
import { Session } from '../../models/Session';
import bcrypt from 'bcrypt';

// Mock dependencies
jest.mock('../../models/User');
jest.mock('../../models/Session');
jest.mock('bcrypt');
jest.mock('uuid', () => ({
    v4: jest.fn(() => 'mock-uuid-token')
}));

const mockedUser = User as jest.Mocked<typeof User>;
const mockedSession = Session as jest.Mocked<typeof Session>;
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('Authentication Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('login', () => {
        it('should login successfully with valid credentials', async () => {
            const mockUser = {
                id: 1,
                email: 'test@example.com',
                password: 'hashedPassword'
            };

            const mockSession = {
                token: 'mock-uuid-token',
                expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000 * 7)
            };

            mockedUser.findOne.mockResolvedValue(mockUser as any);
            mockedBcrypt.compare.mockResolvedValue(true as never);
            mockedSession.create.mockResolvedValue(mockSession as any);

            const result = await login('test@example.com', 'password123');

            expect(mockedUser.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
            expect(mockedBcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
            expect(mockedSession.create).toHaveBeenCalledWith({
                token: 'mock-uuid-token',
                expires_at: expect.any(Date)
            });
            expect(result).toBe('mock-uuid-token');
        });

        it('should throw error when user not found', async () => {
            mockedUser.findOne.mockResolvedValue(null);

            await expect(login('nonexistent@example.com', 'password123'))
                .rejects.toThrow('Invalid email or password.');

            expect(mockedUser.findOne).toHaveBeenCalledWith({ where: { email: 'nonexistent@example.com' } });
            expect(mockedBcrypt.compare).not.toHaveBeenCalled();
            expect(mockedSession.create).not.toHaveBeenCalled();
        });

        it('should throw error when password is invalid', async () => {
            const mockUser = {
                id: 1,
                email: 'test@example.com',
                password: 'hashedPassword'
            };

            mockedUser.findOne.mockResolvedValue(mockUser as any);
            mockedBcrypt.compare.mockResolvedValue(false as never);

            await expect(login('test@example.com', 'wrongpassword'))
                .rejects.toThrow('Invalid email or password.');

            expect(mockedUser.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
            expect(mockedBcrypt.compare).toHaveBeenCalledWith('wrongpassword', 'hashedPassword');
            expect(mockedSession.create).not.toHaveBeenCalled();
        });
    });

    describe('logout', () => {
        it('should logout successfully with valid token', async () => {
            const mockSession = {
                token: 'valid-token',
                destroy: jest.fn().mockResolvedValue(undefined)
            };

            mockedSession.findOne.mockResolvedValue(mockSession as any);

            await logout('valid-token');

            expect(mockedSession.findOne).toHaveBeenCalledWith({ where: { token: 'valid-token' } });
            expect(mockSession.destroy).toHaveBeenCalled();
        });

        it('should throw error when session not found', async () => {
            mockedSession.findOne.mockResolvedValue(null);

            await expect(logout('invalid-token'))
                .rejects.toThrow('Invalid session token.');

            expect(mockedSession.findOne).toHaveBeenCalledWith({ where: { token: 'invalid-token' } });
        });
    });

    describe('verifySession', () => {
        it('should return true for valid non-expired session', async () => {
            const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
            const mockSession = {
                token: 'valid-token',
                expires_at: futureDate
            };

            mockedSession.findOne.mockResolvedValue(mockSession as any);

            const result = await verifySession('valid-token');

            expect(mockedSession.findOne).toHaveBeenCalledWith({ where: { token: 'valid-token' } });
            expect(result).toBe(true);
        });

        it('should throw error when session not found', async () => {
            mockedSession.findOne.mockResolvedValue(null);

            await expect(verifySession('invalid-token'))
                .rejects.toThrow('Invalid session token.');

            expect(mockedSession.findOne).toHaveBeenCalledWith({ where: { token: 'invalid-token' } });
        });

        it('should throw error when session is expired', async () => {
            const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const mockSession = {
                token: 'expired-token',
                expires_at: pastDate
            };

            mockedSession.findOne.mockResolvedValue(mockSession as any);

            await expect(verifySession('expired-token'))
                .rejects.toThrow('Session token has expired.');

            expect(mockedSession.findOne).toHaveBeenCalledWith({ where: { token: 'expired-token' } });
        });
    });
});