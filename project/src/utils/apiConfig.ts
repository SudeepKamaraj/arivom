// API Configuration utility for consistent URL handling across the application

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'https://arivom-backend.onrender.com/api',
  BACKEND_URL: import.meta.env.VITE_BACKEND_URL || 'https://arivom-backend.onrender.com',
  FRONTEND_URL: import.meta.env.VITE_FRONTEND_URL || 'https://arivom.onrender.com'
};

/**
 * Get the full API URL for a given endpoint
 * @param endpoint - The API endpoint (should start with /)
 * @returns The full URL
 */
export const getApiUrl = (endpoint: string): string => {
  // Remove leading slash if present to avoid double slashes
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_CONFIG.BASE_URL}/${cleanEndpoint}`;
};

/**
 * Get the backend URL for a given path
 * @param path - The path (should start with /)
 * @returns The full backend URL
 */
export const getBackendUrl = (path: string = ''): string => {
  if (!path) return API_CONFIG.BACKEND_URL;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${API_CONFIG.BACKEND_URL}/${cleanPath}`;
};

/**
 * Common fetch wrapper with default headers
 * @param endpoint - API endpoint
 * @param options - Fetch options
 * @returns Promise<Response>
 */
export const apiRequest = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
  const token = localStorage.getItem('authToken');
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };

  const mergedOptions: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers
    }
  };

  return fetch(getApiUrl(endpoint), mergedOptions);
};