import AsyncStorage from '@react-native-async-storage/async-storage';

import { API_CONFIG } from '../constants/api';

// API Configuration
const API_BASE_URL = __DEV__ 
  ? API_CONFIG.DEV_BASE_URL  // Development - Use network IP for mobile devices
  : API_CONFIG.PROD_BASE_URL; // Production

// API Response interface
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Get stored auth token
  private async getAuthToken(): Promise<string | null> {
    try {
      const authData = await AsyncStorage.getItem('auth-storage');
      if (authData) {
        const parsed = JSON.parse(authData);
        return parsed.state?.token || null;
      }
      return null;
    } catch (error) {
      console.error('Error getting auth token:', error);
      return null;
    }
  }

  // Create headers with auth token
  private async createHeaders(includeAuth = true): Promise<HeadersInit> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = await this.getAuthToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    return headers;
  }

  // Generic API request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    includeAuth = true
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const headers = await this.createHeaders(includeAuth);

      const config: RequestInit = {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      };

      console.log(`API Request: ${config.method || 'GET'} ${url}`);

      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`API Error on ${endpoint}:`, error);
      throw error;
    }
  }

  // GET request
  async get<T>(endpoint: string, includeAuth = true): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' }, includeAuth);
  }

  // POST request
  async post<T>(
    endpoint: string,
    data?: any,
    includeAuth = true
  ): Promise<ApiResponse<T>> {
    return this.request<T>(
      endpoint,
      {
        method: 'POST',
        body: data ? JSON.stringify(data) : undefined,
      },
      includeAuth
    );
  }

  // PUT request
  async put<T>(
    endpoint: string,
    data?: any,
    includeAuth = true
  ): Promise<ApiResponse<T>> {
    return this.request<T>(
      endpoint,
      {
        method: 'PUT',
        body: data ? JSON.stringify(data) : undefined,
      },
      includeAuth
    );
  }

  // DELETE request
  async delete<T>(endpoint: string, includeAuth = true): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' }, includeAuth);
  }

  // Upload file
  async uploadFile<T>(
    endpoint: string,
    file: {
      uri: string;
      name: string;
      type: string;
    },
    additionalData?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    try {
      const formData = new FormData();
      
      // Add file to form data
      formData.append('file', {
        uri: file.uri,
        name: file.name,
        type: file.type,
      } as any);

      // Add additional data if provided
      if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
          formData.append(key, value);
        });
      }

      const token = await this.getAuthToken();
      const headers: HeadersInit = {};
      
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error(`Upload Error on ${endpoint}:`, error);
      throw error;
    }
  }
}

// Create and export API instance
export const api = new ApiService();

// Health check function
export const checkApiHealth = async (): Promise<boolean> => {
  try {
    const baseUrl = __DEV__ ? API_CONFIG.DEV_BASE_URL : API_CONFIG.PROD_BASE_URL;
    const response = await fetch(`${baseUrl.replace('/api', '')}/health`);
    return response.ok;
  } catch (error) {
    console.error('API Health check failed:', error);
    return false;
  }
};

export default api;