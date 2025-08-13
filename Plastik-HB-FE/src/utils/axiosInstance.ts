import axios from 'axios';

const apiUrl = import.meta.env.VITE_API_URL + "/api";

console.log("URL: ", apiUrl);

const axiosInstance = axios.create({
    baseURL: apiUrl,
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json',
    },
});

export default axiosInstance;