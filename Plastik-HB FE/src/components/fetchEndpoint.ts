import { apiConfig } from "@/config/api";

export const fetchEndpoint = async (
    endpoint: string,
    method = 'GET',
    token?: string | null,
    body?: any
) => {
    try {
        const API_URL = apiConfig.apiUrl;
        const headers: HeadersInit = {};

        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        if (body && !(body instanceof FormData)) {
            headers['Content-Type'] = 'application/json';
        }

        const options: RequestInit = {
            method,
            headers,
            credentials: 'include',
        };

        if (body) {
            options.body = body instanceof FormData ? body : JSON.stringify(body);
        }

        const response = await fetch(`${API_URL}${endpoint}`, options);

        if (!response.ok) {
            try {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error ${response.status}`);
            } catch (jsonError) {
                // If response isn't JSON, use status text
                throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
            }
        }

        if (response.status === 204) {
            return null;
        }

        try {
            return await response.json();
        } catch (error) {
            console.error('Error parsing JSON response:', error);
            throw new Error('Invalid JSON response from server');
        }
    } catch (error) {
        console.error(`Error in fetchEndpoint for ${method} ${endpoint}:`, error);
        throw error;
    }
};