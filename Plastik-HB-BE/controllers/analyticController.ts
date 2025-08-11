import { Request, Response } from 'express';
import { getTrafficAnalytics, createAnalytics, isExist } from '../services/analyticService';

export const getAnalytics = async (req: Request, res: Response) => {
    const data = await getTrafficAnalytics();
    return { data, status: 200 };
};

export const addAnalytics = async (req: Request, res: Response) => {
    const { type, targetId, url } = req.body;
    if (!type || !targetId || !url) {
        throw { message: 'Type, targetId, and url are required.', status: 400 };
    }

    if (!isExist(targetId)) {
        throw { message: 'Target ID does not exist.', status: 404 };
    }

    const ipAddress =
        req.headers["x-forwarded-for"]?.toString().split(",")[0] ||
        req.socket.remoteAddress ||
        "-";

    const analytic = await createAnalytics({
        type,
        targetId,
        url,
        ipAddress,
    });

    return { data: analytic, status: 201 };
};