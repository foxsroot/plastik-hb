import { Section } from '../models/Section';

/**
 * @desc Fetch contact info section (type: ADDRESS)
 * @returns Contact section or null
 */
export const getContactSection = async (): Promise<Section | null> => {
    try {
        return await Section.findOne({
            where: { type: 'ADDRESS' },
        });
    } catch (error) {
        console.error('Error fetching contact section:', error);
        throw new Error('Failed to retrieve contact information');
    }
};

/**
 * @desc Update contact info section (type: ADDRESS)
 * @param data - Contact information object
 * @returns Updated section
 */
export const updateContactSection = async (data: object): Promise<Section> => {
    try {
        let section = await Section.findOne({ where: { type: 'ADDRESS' } });

        if (!section) {
            throw new Error('Contact section not found');
        }

        section.data = data;
        await section.save();

        return section;
    } catch (error: any) {
        console.error('Error updating contact section:', error);
        // Pass through known error, otherwise throw generic
        if (error.message === 'Contact section not found') {
            throw error;
        }
        throw new Error('Failed to update contact information');
    }
};