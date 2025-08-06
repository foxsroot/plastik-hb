import { Request, Response } from 'express';
import { getPageBySlug } from '../services/pageService';

/**
 * @desc Fetch page data by slug
 * @route GET /pages/:slug
 */
export const getPage = async (req: Request, res: Response) => {
    const { slug } = req.params;

    // Validate input
    if (!slug) {
        throw { message: 'Slug is required.', status: 400 };
    }

    // Delegate to service layer
    const pageData = await getPageBySlug(slug);

    return { data: pageData, status: 200 };
};