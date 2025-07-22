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

  // Check if a JWT token is expired
  private isTokenExpired(token: string): boolean {
    try {
      console.log('API: Checking token expiration using atob method');
      
      // Explicitly check if atob is available
      if (typeof atob === 'undefined') {
        console.error('API: atob is not available in this environment');
        return true;
      }
      
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Math.floor(Date.now() / 1000);
      const expired = payload.exp < now;
      
      console.log('API: Token validation result:', {
        exp: payload.exp,
        now: now,
        expired: expired
      });
      
      return expired;
    } catch (error) {
      console.error('API: Error checking token expiration:', error);
      return true; // Assume expired if can't parse
    }
  }

  // Refresh access token using refresh token
  private async refreshAccessToken(): Promise<string | null> {
    try {
      const tokens = await this.getAuthTokens();
      if (!tokens.refreshToken) {
        console.log('No refresh token available for refresh');
        return null;
      }

      console.log('Attempting to refresh access token...');
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: tokens.refreshToken }),
      });

      console.log('Token refresh response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Token refresh failed:', response.status, errorData);
        
        if (response.status === 401) {
          console.log('Refresh token is expired or invalid');
        }
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

  // Check if both tokens are expired and clear them if so
  private async checkAndClearExpiredTokens(): Promise<boolean> {
    try {
      const tokens = await this.getAuthTokens();
      
      if (!tokens.token && !tokens.refreshToken) {
        return false; // No tokens to check
      }

      const accessExpired = tokens.token ? this.isTokenExpired(tokens.token) : true;
      const refreshExpired = tokens.refreshToken ? this.isTokenExpired(tokens.refreshToken) : true;

      if (accessExpired && refreshExpired) {
        console.log('API: Both tokens are expired, clearing auth data');
        await this.forceLogout();
        return true;
      }

      return false;
    } catch (error) {
      console.error('API: Error checking expired tokens:', error);
      return false;
    }
  }

  // Force logout - clear all auth data
  private async forceLogout(): Promise<void> {
    try {
      console.log('API: Force logout initiated');
      await AsyncStorage.removeItem('auth-storage');
      console.log('API: Auth storage cleared');
      
      // Dispatch an event to notify the auth store
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('forceLogout'));
      }
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
        // Temporarily disable token expiration check in headers
        // TODO: Re-enable this after fixing the Buffer issue
        // if (this.isTokenExpired(token)) {
        //   console.warn('API: Access token is expired, not including in headers');
        //   // Don't include expired token in headers
        // } else {
        //   headers.Authorization = `Bearer ${token}`;
        //   console.log('API: Using auth token:', token.substring(0, 20) + '...');
        // }
        
        // For now, just use the token without checking expiration
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
      // Temporarily disable preemptive token checking to debug the issue
      // TODO: Re-enable this after fixing the Buffer issue
      // if (includeAuth) {
      //   const expiredTokensCleared = await this.checkAndClearExpiredTokens();
      //   if (expiredTokensCleared) {
      //     throw new Error('Session expired - please log in again');
      //   }
      // }

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
        
        // Provide specific error messages for common status codes
        let userFriendlyMessage = errorMessage;
        if (response.status === 500) {
          userFriendlyMessage = 'Server error. Please try again later or contact support if the problem persists.';
        } else if (response.status === 503) {
          userFriendlyMessage = 'Service temporarily unavailable. Please try again in a few minutes.';
        } else if (response.status === 502 || response.status === 504) {
          userFriendlyMessage = 'Server connection issue. Please check your internet connection and try again.';
        }
        
        throw new Error(`[${response.status}] ${userFriendlyMessage}`);
      }

      return data;
    } catch (error) {
      console.error(`API Error on ${endpoint}:`, error);
      
      // Re-throw with more context if it's a network or timeout error
      if (error instanceof Error) {
        if (error.message.includes('fetch') || error.message.includes('network') || error.message.includes('ECONNREFUSED')) {
          throw new Error('Unable to connect to server. Please check your internet connection and try again.');
        } else if (error.message.includes('timeout')) {
          throw new Error('Request timeout. Please try again.');
        } else if (error.message.includes('ENOTFOUND')) {
          throw new Error('Server not found. Please check your network connection.');
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
    
    // Try both /health and /api/health endpoints with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    let response;
    try {
      // First try /health endpoint
      response = await fetch(`${baseUrl.replace('/api', '')}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });
    } catch (healthError) {
      // If that fails, try /api/health
      response = await fetch(`${baseUrl}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });
    }
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    console.error('API Health check failed:', error);
    return false;
  }
};

// Enhanced health check with detailed response
export const checkApiHealthDetailed = async (): Promise<{ 
  isHealthy: boolean; 
  error?: string; 
  status?: number; 
  baseUrl: string; 
}> => {
  try {
    const baseUrl = __DEV__ ? API_CONFIG.DEV_BASE_URL : API_CONFIG.PROD_BASE_URL;
    
    // Add timeout and try multiple endpoints
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
    
    let response;
    let healthUrl;
    let lastError;
    
    try {
      // First try /health endpoint
      healthUrl = `${baseUrl.replace('/api', '')}/health`;
      console.log('Checking API health at:', healthUrl);
      
      response = await fetch(healthUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });
    } catch (healthError) {
      lastError = healthError;
      // If that fails, try /api/health
      healthUrl = `${baseUrl}/health`;
      console.log('Retrying API health check at:', healthUrl);
      
      response = await fetch(healthUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: controller.signal,
      });
    }
    
    clearTimeout(timeoutId);
    
    return {
      isHealthy: response.ok,
      status: response.status,
      baseUrl: healthUrl,
    };
  } catch (error) {
    console.error('API Health check failed:', error);
    return {
      isHealthy: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      baseUrl: __DEV__ ? API_CONFIG.DEV_BASE_URL : API_CONFIG.PROD_BASE_URL,
    };
  }
};

export default api;