import { Request, Response } from 'express';
import { getPageBySlug, updateHomepageData, updateAboutPageData } from '../services/pageService';

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

/**
 * @desc Update homepage data
 * @route PUT /homepage
 */
export const updateHomepage = async (req: Request, res: Response) => {
    try {
        const { title, description, published, sections } = req.body;
        if (!title || !sections) {
            return res.status(400).json({ message: 'Title and sections are required.' });
        }
        // Delegate to service layer (implement updateHomepageData in pageService)
        const updatedHomepage = await updateHomepageData({ title, description, published, sections });
        return res.status(200).json({ message: 'Homepage updated', data: updatedHomepage });
    } catch (err: any) {
        return res.status(500).json({ message: 'Server error', error: err.message || err });
    }
};

/**
 * @desc Update About Page data
 * @route PUT /pages/:id
 */
export const updateAboutPage = async (req: Request, res: Response) => {
    try {
        const { id, title, description, published, sections } = req.body;

        // --- Input Validation ---
        if (!id || !title || !sections) {
            return res.status(400).json({ message: 'ID, title, and sections are required.' });
        }

        // --- Delegate to Service Layer ---
        const updatedPage = await updateAboutPageData({
            id,
            title,
            description,
            published,
            sections,
        });

        // --- Success Response ---
        return res.status(200).json({ message: 'About page updated', data: updatedPage });
    } catch (err: any) {
        // --- Error Handling ---
        return res.status(500).json({ message: 'Server error', error: err.message || err });
    }
};