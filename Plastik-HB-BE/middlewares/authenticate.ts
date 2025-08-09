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
        return res.status(401).json({ message: 'Unauthorized: No session token provided.' });
    }

    const session = await Session.findOne({ where: { token } });

    if (!session || new Date() > session.expires_at) {
        return res.status(401).json({ message: 'Unauthorized: Invalid or expired session token.' });
    }

    if (new Date() > session.expires_at) {
        // Clean up expired session
        await session.destroy();
        return res.status(401).json({
            message: 'Unauthorized: Session token has expired.',
            status: 401
        });
    }

    // Attach session info to request for potential use in controllers
    req.session = session;
};

export default middlewareWrapper(authenticate);