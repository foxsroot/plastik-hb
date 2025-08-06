import { Page } from '../models/Page';
import { Section } from '../models/Section';

/**
 * @desc Fetch page data by slug
 * @param slug - Page slug
 * @returns Page data with sections
 */
export const getPageBySlug = async (slug: string): Promise<object> => {
    const page = await Page.findOne({
        where: { slug },
        include: [{
            model: Section,
            as: 'sections',
            required: false,
        }],
        order: [[{ model: Section, as: 'sections' }, 'order', 'ASC']],
    });

    if (!page) {
        throw new Error('Page not found.');
    }

    return page;
};