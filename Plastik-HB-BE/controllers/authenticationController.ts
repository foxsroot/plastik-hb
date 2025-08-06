import { Request, Response } from 'express';
import { login, logout, verifySession } from '../services/authenticationService';

/**
 * @desc Handles user login
 * @route POST /login
 */
export const loginUser = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    // Validate input (basic validation, can be extended)
    if (!email || !password) {
        throw { message: 'Email and password are required.', status: 400 };
    }

    // Delegate to service layer
    const token = await login(email, password);

    return { token, status: 200 };
};

/**
 * @desc Handles user logout
 * @route POST /logout
 */
export const logoutUser = async (req: Request, res: Response) => {
    const { token } = req.body;

    // Validate input
    if (!token) {
        // return { message: 'Token is required.', status: 400 };
        throw { message: 'Token is required.', status: 400 };
    }

    // Delegate to service layer
    await logout(token);

    return { message: 'Logout successful', status: 200 };
};

/**
 * @desc Handles session verification
 * @route POST /verify-session
 */
export const verify = async (req: Request, res: Response) => {
    const { token } = req.body;

    // Validate input
    if (!token) {
        throw { message: 'Token is required.', status: 400 };
    }

    // Delegate to service layer
    await verifySession(token);

    return { message: 'Session is valid', status: 200 };
};