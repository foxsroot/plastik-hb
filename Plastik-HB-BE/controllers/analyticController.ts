import { Request, Response } from 'express';
import { getTrafficAnalytics } from '../services/analyticService';

export const getAnalytics = async (req: Request, res: Response) => {
    const data = await getTrafficAnalytics();
    return { data, status: 200 };
};