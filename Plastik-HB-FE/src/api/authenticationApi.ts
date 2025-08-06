import axiosInstance from '../utils/axiosInstance';

/**
 * @desc Sends login request to the backend
 * @param email - User's email
 * @param password - User's password
 * @returns Session token
 */
export const login = async (email: string, password: string): Promise<string> => {
    const response = await axiosInstance.post('/authentication/login', { email, password });
    return response.data.token; // Extract token from response
};

/**
 * @desc Verifies session token with the backend
 * @param token - Session token to verify
 * @returns Boolean indicating validity
 */
export const verifySession = async (token: string): Promise<void> => {
    await axiosInstance.post('/authentication/verify', { token });
};

/**
 * @desc Sends logout request to the backend
 * @param token - Session token to invalidate
 */
export const logout = async (token: string): Promise<void> => {
    await axiosInstance.post('/authentication/logout', { token });
};