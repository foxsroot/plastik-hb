import axiosInstance from '../utils/axiosInstance';

/**
 * @desc Update featured products
 * @param productIds - Array of product IDs to set as featured
 * @returns Updated featured products
 */
export const updateFeaturedProducts = async (productIds: string[]): Promise<object> => {
  const response = await axiosInstance.put('/products/featured', { productIds });
  return response.data;
};
