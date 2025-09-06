import { defineStore } from 'pinia';
import api from '@/services/api.js';
import tokenManager from '@/services/tokenManager.js';
import { encrypt, decrypt } from '@/lib/crypto.js';
import { sanitizeInput } from '@/lib/security.js';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    loading: false,
    error: null,
    sessionId: null,
    lastActivity: Date.now(),
  }),

  getters: {
    isAuthenticated: () => {
      // Check if we have a valid access token
      const token = tokenManager.getAccessToken();
      return !!token;
    },

    userInfo: state => state.user,

    isSessionActive: state => {
      // Consider session active if last activity was within 30 minutes
      return Date.now() - state.lastActivity < 1800000; // 30 minutes
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
          expiresIn = 900, // Default 15 minutes
        } = response.data;

        // Store access token in memory with automatic expiry
        if (accessToken) {
          tokenManager.setAccessToken(accessToken, expiresIn);
        }

        // Store refresh token in secure cookie if provided
        if (refreshToken) {
          await tokenManager.setRefreshToken(refreshToken);
        }

        // Store encrypted user data in memory
        this.user = await this.encryptUserData(user);
        this.sessionId = this.generateSessionId();
        this.updateActivity();

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
            console.warn('Logout API call failed:', error);
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

      // Clear any persistent encrypted data
      try {
        localStorage.removeItem('sp_session_backup');
        sessionStorage.clear();
      } catch (error) {
        console.warn('Storage cleanup failed:', error);
      }

      // Clear browser cache for sensitive pages
      if ('caches' in window) {
        try {
          const cacheNames = await caches.keys();
          await Promise.all(
            cacheNames.map(cacheName => caches.delete(cacheName))
          );
        } catch (error) {
          console.warn('Cache cleanup failed:', error);
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
      try {
        // Check if we have tokens
        const accessToken = tokenManager.getAccessToken();
        const refreshToken = await tokenManager.getRefreshToken();

        if (!accessToken && refreshToken) {
          // Try to refresh the access token
          const newToken = await tokenManager.refreshAccessToken();
          if (newToken) {
            await this.fetchUserInfo();
          }
        } else if (accessToken) {
          await this.fetchUserInfo();
        }
      } catch (error) {
        console.warn('Session initialization failed:', error);
        await this.performCompleteLogout();
      }
    },

    /**
     * Fetch current user information
     */
    async fetchUserInfo() {
      try {
        const response = await api.get('/api/auth/me');
        this.user = await this.encryptUserData(response.data.user);
        this.updateActivity();
      } catch (error) {
        console.error('Failed to fetch user info:', error);
        throw error;
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
     * Encrypt user data for secure storage
     */
    async encryptUserData(userData) {
      try {
        const encrypted = await encrypt(JSON.stringify(userData));
        return { encrypted: true, data: encrypted };
      } catch (error) {
        console.warn('User data encryption failed, storing unencrypted');
        return userData;
      }
    },

    /**
     * Decrypt user data
     */
    async decryptUserData(encryptedData) {
      if (!encryptedData?.encrypted) {
        return encryptedData;
      }

      try {
        const decrypted = await decrypt(encryptedData.data);
        return JSON.parse(decrypted);
      } catch (error) {
        console.error('User data decryption failed');
        return null;
      }
    },

    /**
     * Get decrypted user data
     */
    async getUserData() {
      if (!this.user) {
        return null;
      }

      if (this.user.encrypted) {
        return await this.decryptUserData(this.user);
      }

      return this.user;
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
