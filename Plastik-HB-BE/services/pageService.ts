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

/**
 * @desc Update homepage data and its sections
 * @param data - Homepage data (title, description, published, sections)
 * @returns Updated homepage with sections
 */
export const updateHomepageData = async ({ title, description, published, sections }: {
  title: string;
  description: string;
  published: boolean;
  sections: any[];
}): Promise<object> => {
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

  // Update sections
  const homepageSections = homepage.sections || [];
  for (const sectionData of sections) {
    let section = homepageSections.find((s: any) => s.id === sectionData.id);
    if (section) {
      section.data = sectionData.data;
      section.order = sectionData.order;
      section.visible = sectionData.visible;
      await section.save();
    } else {
      // Optionally create new section if not found
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