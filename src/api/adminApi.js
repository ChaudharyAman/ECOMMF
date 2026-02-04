import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/api`;

// Helper to get token (assuming it's stored in localStorage)
// Helper to get token (assuming it's stored in localStorage)
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };
};

export const fetchPendingProducts = async (params = {}) => {
    console.log('[API] calling fetchPendingProducts with params:', params);
    const response = await axios.get(`${API_URL}/admin/products/pending`, { ...getAuthHeaders(), params });
    console.log('[API] fetchPendingProducts response:', response.data);
    return response.data;
};

export const approveProduct = async (id) => {
    const response = await axios.put(`${API_URL}/admin/products/${id}/approve`, {}, getAuthHeaders());
    return response.data;
};

export const rejectProduct = async (id, reason) => {
    const response = await axios.put(`${API_URL}/admin/products/${id}/reject`, { reason }, getAuthHeaders());
    return response.data;
};

export const updateProduct = async (id, data) => {
    const response = await axios.put(`${API_URL}/products/${id}`, data, getAuthHeaders());
    return response.data;
};

export const fetchAllProducts = async (params = {}) => {
    console.log('[API] calling fetchAllProducts with params:', params);
    const response = await axios.get(`${API_URL}/products`, { ...getAuthHeaders(), params });
    console.log('[API] fetchAllProducts response:', response.data);
    return response.data;
};
// Vendor Management
export const fetchVendors = async () => {
    const response = await axios.get(`${API_URL}/admin/vendors`, getAuthHeaders());
    return response.data;
};

export const approveVendor = async (id) => {
    const response = await axios.put(`${API_URL}/admin/vendors/${id}/approve`, {}, getAuthHeaders());
    return response.data;
};

export const restrictVendor = async (id, reason) => {
    const response = await axios.put(`${API_URL}/admin/vendors/${id}/reject`, { reason }, getAuthHeaders());
    return response.data;
};

export const updateVendor = async (id, data) => {
    const response = await axios.put(`${API_URL}/admin/vendors/${id}`, data, getAuthHeaders());
    return response.data;
};

export const createVendor = async (data) => {
    const response = await axios.post(`${API_URL}/admin/vendors`, data, getAuthHeaders());
    return response.data;
};


export const createCategory = async (data) => {
    const response = await axios.post(`${API_URL}/categories`, data, getAuthHeaders());
    return response.data;
};

export const fetchCategories = async () => {
    const response = await axios.get(`${API_URL}/categories`);
    return response.data;
};

export const updateCategory = async (id, data) => {
    const response = await axios.put(`${API_URL}/categories/${id}`, data, getAuthHeaders());
    return response.data;
};
