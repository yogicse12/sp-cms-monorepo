import { defineStore } from 'pinia';
import api from '@/services/api.js';
import tokenManager from '@/services/tokenManager.js';
import { sanitizeInput } from '@/lib/security.js';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    loading: false,
    error: null,
    sessionId: null,
    lastActivity: Date.now(),
    initialized: false,
    initializationPromise: null,
  }),

  getters: {
    isAuthenticated: state => {
      // Check if we have a valid access token AND user data
      const hasTokenInMemory = !!tokenManager.getAccessToken();
      const hasUser = !!state.user;
      const result = hasTokenInMemory && hasUser;
      return result;
    },

    userInfo: state => state.user,

    isSessionActive: state => {
      // Consider session active if last activity was within 24 hours (matching JWT token expiry)
      return Date.now() - state.lastActivity < 86400000; // 24 hours (86400000 ms)
    },
  },

  actions: {
    /**
     * Secure login with encrypted user data storage
     */
    async login(credentials) {
      this.loading = true;
      this.error = null;

      try {
        // Sanitize credentials
        const sanitizedCredentials = {
          email: sanitizeInput(credentials.email?.toLowerCase().trim(), {
            maxLength: 254,
          }),
          password: credentials.password, // Don't sanitize password as it might affect validation
        };
        const response = await api.post(
          '/api/auth/login',
          sanitizedCredentials
        );

        // Handle the current API response structure (token, user)
        // Fallback to new structure if available (accessToken, refreshToken, user, expiresIn)

        const {
          token,
          accessToken = token,
          refreshToken,
          user,
          expiresIn = 24 * 60 * 60, // API returns 24h tokens
        } = response.data;

        // Store JWT token in secure cookie (better security)
        if (accessToken) {
          // Store in memory for current session
          tokenManager.setAccessToken(accessToken, expiresIn);

          // Store in secure cookie for persistence across refreshes
          try {
            const expires = new Date();
            expires.setSeconds(expires.getSeconds() + expiresIn);

            // Use secure cookie attributes
            const cookieAttributes = [
              'Path=/',
              'SameSite=Strict',
              `Expires=${expires.toUTCString()}`,
            ];

            // Add Secure flag if HTTPS (production)
            if (window.location.protocol === 'https:') {
              cookieAttributes.push('Secure');
            }

            document.cookie = `auth_token=${accessToken}; ${cookieAttributes.join('; ')}`;
          } catch (error) {
            // Silent fail for token storage
          }
        }

        // Note: This API doesn't provide refresh tokens (uses 24h JWT tokens)
        if (refreshToken) {
          await tokenManager.setRefreshToken(refreshToken);
        }

        // Store user data in localStorage (non-sensitive data)
        this.user = user; // Store plain user data in Pinia state
        this.sessionId = this.generateSessionId();
        this.updateActivity();
        this.initialized = true;

        // Store user data in localStorage for persistence
        try {
          localStorage.setItem('sp_user_data', JSON.stringify(user));
        } catch (error) {
          // Silent fail for user data storage
        }

        return response;
      } catch (error) {
        this.error = error.response?.data?.error || 'Login failed';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Secure logout with complete cleanup
     */
    async logout(skipApiCall = false) {
      this.loading = true;

      try {
        // Call logout API to invalidate server-side session
        if (!skipApiCall) {
          try {
            await api.post('/api/auth/logout');
          } catch (error) {
            // Continue with cleanup even if API call fails
          }
        }

        // Complete cleanup
        await this.performCompleteLogout();
      } finally {
        this.loading = false;
      }
    },

    /**
     * Perform complete logout cleanup
     */
    async performCompleteLogout() {
      // Clear all tokens
      tokenManager.clearAllTokens();

      // Clear store state
      this.user = null;
      this.sessionId = null;
      this.error = null;
      this.lastActivity = 0;
      this.initialized = false;

      // Clear cookies and localStorage
      try {
        this.clearTokenCookie();
        localStorage.removeItem('sp_user_data');
        localStorage.removeItem('sp_session_backup');
        sessionStorage.clear();
      } catch (error) {
        // Silent fail for storage cleanup
      }

      // Clear browser cache for sensitive pages
      if ('caches' in window) {
        try {
          const cacheNames = await caches.keys();
          await Promise.all(
            cacheNames.map(cacheName => caches.delete(cacheName))
          );
        } catch (error) {
          // Silent fail for cache cleanup
        }
      }

      // Redirect to login
      window.location.href = '/login';
    },

    /**
     * Change password with additional security
     */
    async changePassword(passwordData) {
      this.loading = true;
      this.error = null;

      try {
        // Validate password strength
        if (!this.isStrongPassword(passwordData.newPassword)) {
          throw new Error(
            'Password must be at least 8 characters with uppercase, lowercase, number, and special character'
          );
        }

        const response = await api.put('/api/auth/change-password', {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        });

        // Password change successful - logout for security
        await this.logout(true); // Skip API logout call since we just made one

        return response.data;
      } catch (error) {
        this.error = error.response?.data?.error || 'Password change failed';
        throw error;
      } finally {
        this.loading = false;
      }
    },

    /**
     * Initialize user session from stored tokens
     */
    async initializeSession() {
      // If already initialized or currently initializing, return the existing promise
      if (this.initialized) {
        return;
      }

      if (this.initializationPromise) {
        return this.initializationPromise;
      }

      // Create initialization promise
      this.initializationPromise = this.performInitialization();

      try {
        return await this.initializationPromise;
      } finally {
        this.initializationPromise = null;
      }
    },

    /**
     * Perform the actual session initialization
     */
    async performInitialization() {
      try {
        // First, try to get token from cookie
        let accessToken = this.getTokenFromCookie();

        // If found in cookie but not in memory, restore to memory
        if (accessToken && !tokenManager.getAccessToken()) {
          // Store in token manager for current session (24h to match API)
          tokenManager.setAccessToken(accessToken, 86400); // 24h = 86400 seconds
        }

        // Try to restore user data from localStorage
        if (accessToken) {
          try {
            const storedUserData = localStorage.getItem('sp_user_data');
            if (storedUserData) {
              this.user = JSON.parse(storedUserData);
              this.initialized = true;
              this.updateActivity();
              return;
            }
          } catch (error) {
            localStorage.removeItem('sp_user_data');
          }

          // If no user data in localStorage, fetch from API
          try {
            await this.fetchUserInfo();
            this.initialized = true;
            return;
          } catch (error) {
            // Token might be invalid, clear everything
            this.clearTokenCookie();
            localStorage.removeItem('sp_user_data');
            tokenManager.clearAccessToken();
            throw error;
          }
        }

        this.initialized = true;
      } catch (error) {
        this.initialized = true;
        // Only logout if there was an actual error, not just missing tokens
        if (error.message && !error.message.includes('No refresh token')) {
          await this.performCompleteLogout();
        }
      }
    },

    /**
     * Fetch current user information
     */
    async fetchUserInfo() {
      const response = await api.get('/api/auth/profile');

      // The backend returns { message, user } structure
      const userData = response.data.user || response.data;
      this.user = userData; // Store plain user data
      this.updateActivity();

      // Store in localStorage for persistence
      try {
        localStorage.setItem('sp_user_data', JSON.stringify(userData));
      } catch (error) {
        // Silent fail for user data storage
      }
    },

    /**
     * Update user activity timestamp
     */
    updateActivity() {
      this.lastActivity = Date.now();
    },

    /**
     * Check session validity and refresh if needed
     */
    async validateSession() {
      // Ensure session is initialized first
      await this.initializeSession();

      if (!this.isSessionActive) {
        await this.performCompleteLogout();
        return false;
      }

      const token = tokenManager.getAccessToken();
      if (!token) {
        await this.performCompleteLogout();
        return false;
      }

      this.updateActivity();
      return true;
    },

    /**
     * Get user data (now stored plain in localStorage)
     */
    getUserData() {
      return this.user;
    },

    /**
     * Get JWT token from cookie
     */
    getTokenFromCookie() {
      try {
        const cookies = document.cookie.split(';');
        const authCookie = cookies.find(cookie =>
          cookie.trim().startsWith('auth_token=')
        );

        if (authCookie) {
          return authCookie.split('=')[1];
        }

        return null;
      } catch (error) {
        return null;
      }
    },

    /**
     * Clear auth token cookie
     */
    clearTokenCookie() {
      try {
        // Clear the auth token cookie
        document.cookie =
          'auth_token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Strict';
      } catch (error) {
        // Silent fail for cookie clearing
      }
    },

    /**
     * Generate secure session ID
     */
    generateSessionId() {
      return crypto.getRandomValues(new Uint32Array(4)).join('-');
    },

    /**
     * Validate password strength
     */
    isStrongPassword(password) {
      if (!password || password.length < 8) {
        return false;
      }

      const hasUppercase = /[A-Z]/.test(password);
      const hasLowercase = /[a-z]/.test(password);
      const hasNumbers = /\d/.test(password);
      const hasSpecialChar = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(
        password
      );

      return hasUppercase && hasLowercase && hasNumbers && hasSpecialChar;
    },

    /**
     * Clear error state
     */
    clearError() {
      this.error = null;
    },

    /**
     * Handle session timeout
     */
    handleSessionTimeout() {
      this.error = 'Session expired. Please log in again.';
      this.performCompleteLogout();
    },
  },
});
