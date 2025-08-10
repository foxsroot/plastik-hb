import axiosInstance from '../utils/axiosInstance';

/**
 * @desc Fetch page data by slug
 * @param slug - Page slug
 * @returns Page data
 */
export const getPage = async (slug: string): Promise<object> => {
  const response = await axiosInstance.get(`/pages/${slug}`);
  return response.data.data; // Extract page data from response
};

export const updateHomepage = async (data: {
  title: string;
  description?: string;
  published: boolean;
  sections: any[];
}): Promise<object> => {
  const response = await axiosInstance.put('/pages/homepage', data);
  return response.data; // Extract updated homepage data from response
}

export const updateAboutPage = async (pageId: string, data: object): Promise<object> => {
  const response = await axiosInstance.put('/pages/tentang-kami', data);
  return response.data;
};