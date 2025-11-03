import axios from 'axios';

// Update this URL to match your backend
const API_BASE_URL = 'http://localhost:8000'; // Change to your backend URL

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let authToken = null;

export const setAuthToken = (token) => {
  authToken = token;
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common['Authorization'];
  }
};

// Auth endpoints
export const authAPI = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', {email, password});
    return response.data;
  },
  register: async (email, password) => {
    const response = await api.post('/users/create', {email, password});
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },
};

// VPN endpoints
export const vpnAPI = {
  getServers: async () => {
    const response = await api.get('/vpn/servers');
    return response.data || [];
  },
  assignServer: async (serverId) => {
    const response = await api.post('/vpn/assign', {serverId});
    return response.data;
  },
  updateUsage: async (dataUsed) => {
    const response = await api.patch('/usage', {dataUsed});
    return response.data;
  },
};

// Ad endpoints
export const adAPI = {
  getAds: async (country = 'IN') => {
    const response = await api.get(`/ads?country=${country}`);
    return response.data || [];
  },
  trackEvent: async (eventType, metadata) => {
    const response = await api.post('/ads/event', {
      user_id: null,
      event_type: eventType,
      metadata,
    });
    return response.data;
  },
};

export default api;