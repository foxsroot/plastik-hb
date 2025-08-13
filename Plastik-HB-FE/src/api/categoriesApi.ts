import axiosInstance from '../utils/axiosInstance';

/**
 * @desc Get session token from localStorage
 * @returns Session token string
 */
function getSessionToken(): string | null {
  return localStorage.getItem('sessionToken');
}

/**
 * @desc Fetch all categories
 * @returns All categories data
 */
export const fetchCategories = async (): Promise<object> => {
  const response = await axiosInstance.get('/categories');
  return response.data.data; // Extract categories data from response
};

/**
 * @desc Create a new category
 * @param categoryData
 * @returns Created category
 */
export const createCategory = async (name: string): Promise<object> => {
  const sessionToken = getSessionToken();
  const response = await axiosInstance.post('/categories', { name }, {
    headers: { Authorization: `Bearer ${sessionToken}` },
  });
  return response.data.data;
};

/**
 * @desc Update a category
 * @param id
 * @param categoryData
 * @returns Updated category
 */
export const updateCategory = async (id: number, name: string): Promise<object> => {
  const sessionToken = getSessionToken();
  const response = await axiosInstance.put(`/categories/${id}`, { name }, {
    headers: { Authorization: `Bearer ${sessionToken}` },
  });
  return response.data.data;
};

/**
 * @desc Delete a category
 * @param id
 * @returns Success
 */
export const deleteCategory = async (id: number): Promise<object> => {
  const sessionToken = getSessionToken();
  const response = await axiosInstance.delete(`/categories/${id}`, {
    headers: { Authorization: `Bearer ${sessionToken}` },
  });
  return response.data.data;
};