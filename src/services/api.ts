const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; 
const API_KEY = import.meta.env.VITE_API_KEY; 


export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface ApiError {
  message: string;
  status: number;
}

class ApiService {
  private baseURL: string;
  private apiKey: string;

  constructor(baseURL: string, apiKey: string) {
    this.baseURL = baseURL;
    this.apiKey = apiKey;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'X-API-Key': this.apiKey,
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        data,
        status: response.status,
      };
    } catch (error) {
      console.error('API request failed:', error);
      throw {
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 0,
      } as ApiError;
    }
  }

  // GET request
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'GET',
    });
  }

  // POST request
  async post<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

// Create and export a singleton instance
export const apiService = new ApiService(API_BASE_URL, API_KEY);

// Validate that API key is available
if (!API_KEY) {
  console.error('VITE_API_KEY is not defined in environment variables');
  console.error('Current environment:', {
    NODE_ENV: import.meta.env.MODE,
    VITE_API_BASE_URL: API_BASE_URL,
    VITE_API_KEY: API_KEY ? '***' : 'undefined'
  });
} else {
  console.log('API key loaded successfully');
}

// Export the class for testing or custom instances
export { ApiService };
