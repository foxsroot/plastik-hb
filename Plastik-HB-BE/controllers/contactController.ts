import { Request, Response } from 'express';
import { getContactSection, updateContactSection } from '../services/contactService';

/**
 * GET /contact-info
 */
export const getContactInfo = async (req: Request, res: Response) => {
    const section = await getContactSection();
    if (!section) throw { message: 'Contact info not found', status: 404 };
    return { data: section.data, status: 200 };
};

/**
 * PUT /contact-info
 */
export const putContactInfo = async (req: Request, res: Response) => {
    const { data } = req.body;
    if (!data) throw { message: 'Missing contact info data', status: 400 };
    const section = await updateContactSection(data);
    return { data: section.data, status: 200 };
};