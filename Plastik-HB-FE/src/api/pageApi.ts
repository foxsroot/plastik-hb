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

export async function fetchFeaturedProducts() {
    const response = await axiosInstance.get('/products/featured');
    console.log("Featured Products Response:", response.data);
    return response.data.data;
}