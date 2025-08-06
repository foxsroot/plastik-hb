import { Request, Response, NextFunction } from 'express';
import { Session } from '../models/Session';
import { middlewareWrapper } from '../utils/middlewareWrapper';

/**
 * @desc Middleware to authenticate session tokens
 */
const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers['authorization'];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No session token provided.' });
    }

    const session = await Session.findOne({ where: { token } });

    if (!session || new Date() > session.expires_at) {
        return res.status(401).json({ message: 'Unauthorized: Invalid or expired session token.' });
    }

    next();
};

export default middlewareWrapper(authenticate);