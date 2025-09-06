import axios from 'axios';
import tokenManager from './tokenManager.js';
import {
  sanitizeInput,
  containsXSS,
  generateCSRFToken,
} from '@/lib/security.js';

const API_BASE_URL =
  import.meta.env.VITE_ENDPOINT || 'https://sp-cms-api.yogicse12.workers.dev';

// Get environment-based credential settings
const enableCredentials = import.meta.env.VITE_ENABLE_CREDENTIALS === 'true';

// Create axios instance with environment-based configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 second timeout
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest',
  },
  // Enable credentials based on environment configuration
  withCredentials: enableCredentials,
});

// API configuration loaded

// Track pending refresh to prevent multiple simultaneous requests
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });

  failedQueue = [];
};

// Request interceptor with security and auto-refresh
api.interceptors.request.use(
  async config => {
    // Input sanitization for request data
    if (config.data) {
      config.data = sanitizeRequestData(config.data);
    }

    // Add CSRF token for state-changing operations
    if (
      ['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase())
    ) {
      config.headers['X-CSRF-Token'] = generateCSRFToken();
    }

    // Get access token
    let accessToken = tokenManager.getAccessToken();

    // Check if token needs refresh (but skip for login and refresh requests)
    const isLoginRequest = config.url?.includes('/auth/login');
    const isRefreshRequest = config.url?.includes('/auth/refresh');

    if (
      !isLoginRequest &&
      !isRefreshRequest &&
      (!accessToken || tokenManager.needsRefresh())
    ) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          config.headers.Authorization = `Bearer ${tokenManager.getAccessToken()}`;
          return config;
        });
      }

      // Attempt to refresh token
      isRefreshing = true;
      try {
        accessToken = await tokenManager.refreshAccessToken();
        processQueue(null, accessToken);
      } catch (error) {
        processQueue(error);
        // Don't throw error here, let the original request continue
        // The response interceptor will handle 401 errors
      } finally {
        isRefreshing = false;
      }
    }

    // Add authorization header
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and security
api.interceptors.response.use(
  response => {
    // Validate response data for potential XSS
    if (response.data && typeof response.data === 'object') {
      response.data = sanitizeResponseData(response.data);
    }

    return response;
  },
  async error => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue the failed request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => {
          originalRequest.headers.Authorization = `Bearer ${tokenManager.getAccessToken()}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newToken = await tokenManager.refreshAccessToken();
        processQueue(null, newToken);

        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError);

        // Clear all tokens and redirect to login
        tokenManager.clearAllTokens();

        const currentPath = window.location.pathname;
        if (currentPath !== '/login' && currentPath !== '/auth/login') {
          window.location.href = '/login';
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle other error types silently

    return Promise.reject(error);
  }
);

/**
 * Sanitize request data to prevent XSS and injection attacks
 * @param {any} data - Request data
 * @returns {any} - Sanitized data
 */
const sanitizeRequestData = data => {
  if (typeof data === 'string') {
    if (containsXSS(data)) {
      throw new Error('Potentially malicious content detected');
    }
    return sanitizeInput(data);
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeRequestData);
  }

  if (data && typeof data === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeRequestData(value);
    }
    return sanitized;
  }

  return data;
};

/**
 * Sanitize response data to prevent XSS
 * @param {any} data - Response data
 * @returns {any} - Sanitized data
 */
const sanitizeResponseData = data => {
  if (typeof data === 'string') {
    return sanitizeInput(data);
  }

  if (Array.isArray(data)) {
    return data.map(sanitizeResponseData);
  }

  if (data && typeof data === 'object') {
    const sanitized = {};
    for (const [key, value] of Object.entries(data)) {
      sanitized[key] = sanitizeResponseData(value);
    }
    return sanitized;
  }

  return data;
};

export default api;
