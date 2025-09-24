import { supabase } from './supabase';

// Define API base URL - uses environment variable or default
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Generic interface for API responses
interface ApiResponse<T = any> {
  data?: T;
  error?: {
    message: string;
    code?: string;
    status?: number;
  };
}

// Type for request options
interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string>;
  signal?: AbortSignal;
}

/**
 * General purpose fetch wrapper with error handling
 */
async function fetchWithAuth<T>(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const token = sessionData.session?.access_token;

    // Construct URL with query parameters if provided
    let url = `${API_BASE_URL}${endpoint}`;
    if (options.params) {
      const queryParams = new URLSearchParams();
      Object.entries(options.params).forEach(([key, value]) => {
        queryParams.append(key, value);
      });
      url += `?${queryParams.toString()}`;
    }

    // Default headers
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    // Prepare request
    const requestOptions: RequestInit = {
      method,
      headers,
      signal: options.signal,
    };

    // Add body for non-GET requests
    if (method !== 'GET' && body !== undefined) {
      requestOptions.body = JSON.stringify(body);
    }

    // Execute request
    const response = await fetch(url, requestOptions);
    
    // Parse response
    let data: any;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Handle API response
    if (!response.ok) {
      return {
        error: {
          message: data.message || 'API request failed',
          code: data.code,
          status: response.status,
        },
      };
    }

    return { data };
  } catch (error: any) {
    return {
      error: {
        message: error.message || 'Network error',
        code: 'NETWORK_ERROR',
      },
    };
  }
}

// Export convenience methods for different HTTP verbs
export const apiClient = {
  get: <T>(endpoint: string, options?: RequestOptions) => 
    fetchWithAuth<T>(endpoint, 'GET', undefined, options),
  
  post: <T>(endpoint: string, data?: any, options?: RequestOptions) => 
    fetchWithAuth<T>(endpoint, 'POST', data, options),
  
  put: <T>(endpoint: string, data?: any, options?: RequestOptions) => 
    fetchWithAuth<T>(endpoint, 'PUT', data, options),
  
  delete: <T>(endpoint: string, options?: RequestOptions) => 
    fetchWithAuth<T>(endpoint, 'DELETE', undefined, options),
  
  // Helper for checking if the API is available
  checkHealth: async (): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      return response.ok;
    } catch (error) {
      console.error('API health check failed:', error);
      return false;
    }
  },
};

export default apiClient;
