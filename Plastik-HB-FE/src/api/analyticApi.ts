import axiosInstance from '../utils/axiosInstance';

export const fetchAnalytics = async () => {
    const res = await axiosInstance.get('/analytics');
    return res.data.data;
};