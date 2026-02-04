import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

export const getMyProducts = async () => {
    const response = await axios.get(`${API_URL}/products/my-products`, getAuthHeaders());
    return response.data;
};

export const submitProductForReview = async (id) => {
    const response = await axios.put(`${API_URL}/products/${id}/submit`, {}, getAuthHeaders());
    return response.data;
};
