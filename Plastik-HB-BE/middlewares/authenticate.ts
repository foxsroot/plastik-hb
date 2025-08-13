import { Request, Response, NextFunction } from 'express';
import { Session } from '../models/Session';
import { middlewareWrapper } from '../utils/middlewareWrapper';

// Extend Express Request interface to include session
declare global {
    namespace Express {
        interface Request {
            session?: Session;
        }
    }
}

/**
 * @desc Middleware to authenticate session tokens
 */
const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;

    if (!token) {
        const error = new Error('Unauthorized: No session token provided.');
        (error as any).statusCode = 401;
        throw error;
    }

    const session = await Session.findOne({ where: { token } });

    if (!session || new Date() > session.expires_at) {
        const error = new Error('Unauthorized: Invalid or expired session token.');
        (error as any).statusCode = 401;
        throw error;
    }

    if (new Date() > session.expires_at) {
        // Clean up expired session
        await session.destroy();
        const error = new Error('Unauthorized: Session token has expired.');
        (error as any).statusCode = 401;
        throw error;
    }

    // Attach session info to request for potential use in controllers
    req.session = session;
};

export default middlewareWrapper(authenticate);