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

  // Get stored auth tokens
  private async getAuthTokens(): Promise<{ token: string | null; refreshToken: string | null }> {
    try {
      const authData = await AsyncStorage.getItem('auth-storage');
      
      if (authData) {
        const parsed = JSON.parse(authData);
        return {
          token: parsed.state?.token || null,
          refreshToken: parsed.state?.refreshToken || null
        };
      }
      
      return { token: null, refreshToken: null };
    } catch (error) {
      console.error('Error getting auth tokens:', error);
      return { token: null, refreshToken: null };
    }
  }

  // Get stored auth token (backward compatibility)
  private async getAuthToken(): Promise<string | null> {
    const tokens = await this.getAuthTokens();
    return tokens.token;
  }

  // Refresh access token using refresh token
  private async refreshAccessToken(): Promise<string | null> {
    try {
      const tokens = await this.getAuthTokens();
      if (!tokens.refreshToken) {
        return null;
      }

      const response = await fetch(`${this.baseURL}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: tokens.refreshToken }),
      });

      if (!response.ok) {
        console.error('Token refresh failed:', response.status);
        return null;
      }

      const data = await response.json();

      if (data.success && data.data?.accessToken) {
        // Update the stored token
        const authData = await AsyncStorage.getItem('auth-storage');
        if (authData) {
          const parsed = JSON.parse(authData);
          parsed.state.token = data.data.accessToken;
          await AsyncStorage.setItem('auth-storage', JSON.stringify(parsed));
          console.log('Access token refreshed successfully');
          return data.data.accessToken;
        }
      }

      return null;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return null;
    }
  }

  // Force logout - clear all auth data
  private async forceLogout(): Promise<void> {
    try {
      console.log('API: Force logout initiated');
      await AsyncStorage.removeItem('auth-storage');
      console.log('API: Auth storage cleared');
    } catch (error) {
      console.error('API: Error during force logout:', error);
    }
  }

  // Create headers with auth token
  private async createHeaders(includeAuth = true): Promise<HeadersInit> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    console.log('API: Creating headers with includeAuth:', includeAuth);

    if (includeAuth) {
      const token = await this.getAuthToken();
      if (token) {
        headers.Authorization = `Bearer ${token}`;
        console.log('API: Using auth token:', token.substring(0, 20) + '...');
      } else {
        console.warn('API: No auth token available');
      }
    } else {
      console.log('API: Not including auth header');
    }

    return headers;
  }

  // Generic API request method with auto token refresh
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
      console.log('Request Headers:', JSON.stringify(config.headers, null, 2));
      if (config.body) {
        console.log('Request Body:', config.body);
      }

      let response = await fetch(url, config);
      console.log(`Response Status: ${response.status} ${response.statusText}`);
      
      // Clone response to read text if JSON parsing fails
      const responseClone = response.clone();
      let data;
      try {
        data = await response.json();
        console.log('Response Data:', JSON.stringify(data, null, 2));
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        try {
          const rawText = await responseClone.text();
          console.log('Raw response text:', rawText);
        } catch (textError) {
          console.error('Failed to read response as text:', textError);
        }
        throw new Error('Invalid JSON response from server');
      }

      // If we get a 401 and we have auth enabled, try to refresh the token
      if (response.status === 401 && includeAuth) {
        console.log('Received 401, attempting to refresh token...');
        const tokens = await this.getAuthTokens();
        
        if (!tokens.refreshToken) {
          console.log('No refresh token found - user needs to log in');
          // Force logout
          await this.forceLogout();
          throw new Error('Authentication required - please log in');
        }
        
        const newToken = await this.refreshAccessToken();
        
        if (newToken) {
          // Retry the request with the new token
          const newHeaders = await this.createHeaders(true);
          const retryConfig: RequestInit = {
            ...options,
            headers: {
              ...newHeaders,
              ...options.headers,
            },
          };
          
          console.log(`Retrying API Request with refreshed token: ${retryConfig.method || 'GET'} ${url}`);
          response = await fetch(url, retryConfig);
          data = await response.json();
          console.log(`Retry response: ${response.status} ${response.statusText}`);
        } else {
          console.log('Token refresh failed - user needs to log in again');
          // Force logout when refresh fails
          await this.forceLogout();
          throw new Error('Session expired - please log in again');
        }
      }

      if (!response.ok) {
        const errorMessage = data.message || data.error || `HTTP error! status: ${response.status}`;
        console.error(`API Error Details:`, {
          status: response.status,
          statusText: response.statusText,
          url: url,
          method: config.method || 'GET',
          responseData: data,
          errorMessage
        });
        throw new Error(`[${response.status}] ${errorMessage}`);
      }

      return data;
    } catch (error) {
      console.error(`API Error on ${endpoint}:`, error);
      
      // Re-throw with more context if it's a network or timeout error
      if (error instanceof Error) {
        if (error.message.includes('fetch') || error.message.includes('network')) {
          throw new Error('Network error. Please check your internet connection.');
        } else if (error.message.includes('timeout')) {
          throw new Error('Request timeout. Please try again.');
        }
      }
      
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