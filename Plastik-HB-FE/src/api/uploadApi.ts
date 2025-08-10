import axiosInstance from "../utils/axiosInstance";

/**
 * Uploads an image file to the backend and returns the image URL.
 * @param file - The image file to upload
 * @returns Promise<string> - The uploaded image URL
 */
export const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await axiosInstance.post("/uploads", formData, {
        headers: { "Content-Type": "multipart/form-data" },
    });

    // Expecting { imageUrl: string } from backend
    return response.data.imageUrl;
};