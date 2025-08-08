import { Page } from '../models/Page';
import { Section } from '../models/Section';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/banners';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const filename = `banner-${Date.now()}-${file.originalname}`;
        cb(null, filename);
    },
});

export const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        // Only allow image files
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    }
});

/**
 * @desc Fetch page data by slug
 * @param slug - Page slug
 * @returns Page data with sections
 */
export const getPageBySlug = async (slug: string): Promise<object> => {
    console.log(`Fetching page with slug: ${slug}`);

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
        throw new Error(`Page with slug '${slug}' not found.`);
    }

    console.log(`Page found successfully: ${page.title}`);
    return page;
};

/**
 * @desc Update homepage data and its sections with banner image support
 * @param data - Homepage data (title, description, published, sections)
 * @param bannerFile - Optional banner image file
 * @returns Updated homepage with sections
 */
export const updateHomepageData = async ({
    title,
    description,
    published,
    sections
}: {
    title: string;
    description: string;
    published: boolean;
    sections: any[];
}, bannerFile?: Express.Multer.File): Promise<object> => {
    // Find homepage by slug
    const homepage = await Page.findOne({
        where: { slug: 'homepage' },
        include: [{ model: Section, as: 'sections' }],
    });
    if (!homepage) throw new Error('Homepage not found');

    // Update main fields
    homepage.title = title;
    homepage.description = description;
    homepage.published = published;
    await homepage.save();

    // Update sections with banner image handling
    const homepageSections = homepage.sections || [];
    for (const sectionData of sections) {
        let section = homepageSections.find((s: any) => s.id === sectionData.id);

        // Handle banner image upload for banner carousel sections
        if (sectionData.type === 'banner_carousel' && bannerFile) {
            const baseUrl = '/uploads/banners/';
            const bannerImageUrl = `${baseUrl}${bannerFile.filename}`;

            // Update section data with new banner image
            if (sectionData.data && sectionData.data.banners) {
                sectionData.data.banners = sectionData.data.banners.map((banner: any) => ({
                    ...banner,
                    image: bannerImageUrl,
                }));
            }
        }

        if (section) {
            section.data = sectionData.data;
            section.order = sectionData.order;
            section.visible = sectionData.visible;
            await section.save();
        } else {
            // Create new section if not found
            await Section.create({
                page_id: homepage.id,
                type: sectionData.type,
                data: sectionData.data,
                order: sectionData.order,
                visible: sectionData.visible,
            });
        }
    }

    // Reload homepage with updated sections
    const updatedHomepage = await Page.findOne({
        where: { slug: 'homepage' },
        include: [{ model: Section, as: 'sections' }],
        order: [[{ model: Section, as: 'sections' }, 'order', 'ASC']],
    });

    if (!updatedHomepage) throw new Error('Homepage not found after update');
    return updatedHomepage;
};

/**
 * @desc Delete banner image file
 * @param imagePath - Path to the image file
 */
export const deleteBannerImage = async (imagePath: string): Promise<void> => {
    try {
        const fullPath = path.join(process.cwd(), imagePath);
        if (fs.existsSync(fullPath)) {
            fs.unlinkSync(fullPath);
        }
    } catch (error) {
        console.error('Error deleting banner image:', error);
    }
};

/**
 * @desc Update specific banner in a carousel section
 * @param sectionId - Section ID
 * @param bannerIndex - Index of banner to update
 * @param bannerData - Banner data (title, subtitle, buttonText, buttonLink)
 * @param bannerFile - Optional new banner image
 */
export const updateBannerInSection = async (
    sectionId: string,
    bannerIndex: number,
    bannerData: {
        title?: string;
        subtitle?: string;
        buttonText?: string;
        buttonLink?: string;
    },
    bannerFile?: Express.Multer.File
): Promise<object> => {
    const section = await Section.findByPk(sectionId);
    if (!section) throw new Error('Section not found');

    const sectionDataObj = section.data as any;
    if (!sectionDataObj.banners || !sectionDataObj.banners[bannerIndex]) {
        throw new Error('Banner not found at specified index');
    }

    // Update banner data
    const banner = sectionDataObj.banners[bannerIndex];
    if (bannerData.title !== undefined) banner.title = bannerData.title;
    if (bannerData.subtitle !== undefined) banner.subtitle = bannerData.subtitle;
    if (bannerData.buttonText !== undefined) banner.buttonText = bannerData.buttonText;
    if (bannerData.buttonLink !== undefined) banner.buttonLink = bannerData.buttonLink;

    // Update banner image if provided
    if (bannerFile) {
        // Delete old image if exists
        if (banner.image) {
            await deleteBannerImage(banner.image);
        }

        const baseUrl = '/uploads/banners/';
        banner.image = `${baseUrl}${bannerFile.filename}`;
    }

    // Save updated section
    section.data = sectionDataObj;
    await section.save();

    return section;
};