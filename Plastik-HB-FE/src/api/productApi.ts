import axiosInstance from '../utils/axiosInstance';

/**
 * @desc Fetch featured products
 * @returns Featured products data
 */
export const fetchFeaturedProducts = async (): Promise<object> => {
    const response = await axiosInstance.get('/products/featured');
    return response.data.data;
};


/**
 * @desc Fetch all products
 * @returns All products data
 */
export const fetchProducts = async (): Promise<object> => {
    const response = await axiosInstance.get('/products');
    return response.data.data; // Extract products data from response
}