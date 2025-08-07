import axiosInstance from '../utils/axiosInstance';

export const fetchContactInfo = async () => {
    const res = await axiosInstance.get('/contact');
    return res.data.data;
};

export const updateContactInfo = async (data: object) => {
    const token = localStorage.getItem('sessionToken');

    if (!token) {
        throw new Error('No authentication token found');
    }

    const res = await axiosInstance.put('/contact',
        { data },
        {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        }
    );
    return res.data.data;
};