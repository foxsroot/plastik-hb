import axiosInstance from '../utils/axiosInstance';

export const fetchAnalytics = async () => {
    const res = await axiosInstance.get('/analytics');
    return res.data.data;
};

export const sendAnalyticsEvent = async (event: any) => {
    const res = await axiosInstance.post('/analytics', event);
    return res.data.data;
};