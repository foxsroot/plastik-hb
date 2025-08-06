import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../models/User';
import { Session } from '../models/Session';

/**
 * @desc Handles user login logic
 * @param email - User's email
 * @param password - User's password
 * @returns Session token
 */
export const login = async (email: string, password: string): Promise<string> => {
    const user = await User.findOne({ where: { email } });

    if (!user) {
        throw new Error('Invalid email or password.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        throw new Error('Invalid email or password.');
    }

    // Create a new session
    const session = await Session.create({
        token: generateSessionToken(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000 * 7), // 7 days expiration
    });

    return session.token;
};

/**
 * @desc Handles user logout logic
 * @param token - Session token to invalidate
 */
export const logout = async (token: string): Promise<void> => {
    const session = await Session.findOne({ where: { token } });

    if (!session) {
        throw new Error('Invalid session token.');
    }

    // Delete the session
    await session.destroy();
};

/**
 * @desc Verifies if a session token is valid
 * @param token - Session token to verify
 * @returns Boolean indicating validity
 */
export const verifySession = async (token: string): Promise<boolean> => {
    const session = await Session.findOne({ where: { token } });

    if (!session) {
        throw new Error('Invalid session token.');
    }

    if (new Date() > session.expires_at) {
        throw new Error('Session token has expired.');
    }

    return true; // Session is valid
};

/**
 * @desc Generates a random session token
 * @returns Random session token
 */
const generateSessionToken = (): string => {
    return uuidv4();
};

