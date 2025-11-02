import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = __DEV__ 
  ? 'http://10.0.2.2:8000' // Android emulator localhost
  : 'https://your-backend-url.com';

class APIService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired, logout user
          await AsyncStorage.removeItem('token');
          // Navigate to login screen
        }
        return Promise.reject(error);
      }
    );
  }

  // Authentication
  async login(email, password) {
    const response = await this.api.post('/auth/login', { email, password });
    const { access_token } = response.data;
    await AsyncStorage.setItem('token', access_token);
    return response.data;
  }

  async register(email, password) {
    const response = await this.api.post('/users/create', { email, password });
    return response.data;
  }

  async getCurrentUser() {
    const response = await this.api.get('/users/me');
    return response.data;
  }

  // VPN Servers
  async getServers() {
    const response = await this.api.get('/vpn/servers');
    return response.data;
  }

  async assignVPN(serverId) {
    const response = await this.api.post('/vpn/assign', { serverId });
    return response.data;
  }

  // Usage tracking
  async updateUsage(dataUsed) {
    const response = await this.api.patch('/usage', { dataUsed });
    return response.data;
  }

  // Ads
  async getAds(country = 'IN') {
    const response = await this.api.get(`/ads?country=${country}`);
    return response.data;
  }

  async trackAdEvent(eventType, metadata) {
    const response = await this.api.post('/ads/event', {
      user_id: null,
      event_type: eventType,
      metadata
    });
    return response.data;
  }

  // Health check
  async checkHealth() {
    const response = await this.api.get('/health');
    return response.data;
  }
}

export default new APIService();