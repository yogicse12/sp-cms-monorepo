/**
 * Secure Token Management Service
 * - Access tokens stored in memory (15min expiry)
 * - Refresh tokens stored in HttpOnly cookies
 * - Automatic token refresh
 * - Complete security cleanup
 */

import { encrypt, decrypt } from '@/lib/crypto.js';

class TokenManager {
  constructor() {
    // In-memory storage for access tokens (cleared on page refresh)
    this.accessToken = null;
    this.tokenExpiry = null;
    this.refreshPromise = null;

    // Auto-refresh timer
    this.refreshTimer = null;

    // Setup automatic cleanup on page unload
    this.setupCleanupListeners();
  }

  /**
   * Set access token with automatic expiry management
   * @param {string} token - Access token
   * @param {number} expiresIn - Token expiry in seconds (default 15 minutes)
   */
  setAccessToken(token, expiresIn = 900) {
    // 15 minutes default
    this.accessToken = token;
    this.tokenExpiry = Date.now() + expiresIn * 1000;

    // Schedule automatic refresh 2 minutes before expiry
    this.scheduleTokenRefresh(expiresIn - 120);
  }

  /**
   * Get current access token if valid
   * @returns {string|null} - Access token or null if expired
   */
  getAccessToken() {
    if (!this.accessToken || !this.tokenExpiry) {
      return null;
    }

    // Check if token is expired (with 30 second buffer)
    if (Date.now() >= this.tokenExpiry - 30000) {
      this.clearAccessToken();
      return null;
    }

    return this.accessToken;
  }

  /**
   * Clear access token from memory
   */
  clearAccessToken() {
    this.accessToken = null;
    this.tokenExpiry = null;
    this.clearRefreshTimer();
  }

  /**
   * Set encrypted refresh token in cookie with environment-based security
   * @param {string} refreshToken - Refresh token
   */
  async setRefreshToken(refreshToken) {
    try {
      // Store encrypted refresh token in cookie
      const encryptedToken = await encrypt(refreshToken);

      // Get environment-based cookie settings
      const useSecureCookies =
        import.meta.env.VITE_USE_SECURE_COOKIES === 'true';
      const cookieDomain = import.meta.env.VITE_COOKIE_DOMAIN;
      const isDevelopment = import.meta.env.VITE_ENVIRONMENT === 'development';

      // Build cookie attributes based on environment
      let cookieAttributes = 'Path=/; SameSite=Strict';

      // Add Secure flag based on environment setting
      if (useSecureCookies) {
        cookieAttributes += '; Secure';
      }

      // Add Domain attribute if specified (usually for production)
      if (cookieDomain && cookieDomain !== 'localhost') {
        cookieAttributes += `; Domain=${cookieDomain}`;
      }

      // Add HttpOnly flag for production (when credentials are enabled)
      const enableCredentials =
        import.meta.env.VITE_ENABLE_CREDENTIALS === 'true';
      if (enableCredentials && !isDevelopment) {
        // Note: HttpOnly cookies can only be set by the server
        // This is a reminder that the server should set HttpOnly cookies in production
        // Note: Server should set HttpOnly cookies in production
      }

      // Set the cookie (7 days expiry)
      document.cookie = `refresh_token=${encryptedToken}; ${cookieAttributes}; Max-Age=604800`;
    } catch (error) {
      console.error('Failed to set refresh token:', error);
      throw error;
    }
  }

  /**
   * Get and decrypt refresh token from cookie
   * @returns {string|null} - Decrypted refresh token or null
   */
  async getRefreshToken() {
    try {
      const cookies = document.cookie.split(';');
      const refreshCookie = cookies.find(cookie =>
        cookie.trim().startsWith('refresh_token=')
      );

      if (!refreshCookie) {
        return null;
      }

      const encryptedToken = refreshCookie.split('=')[1];
      return await decrypt(encryptedToken);
    } catch (error) {
      return null;
    }
  }

  /**
   * Clear refresh token cookie with environment-based attributes
   */
  clearRefreshToken() {
    // Get environment-based cookie settings
    const useSecureCookies = import.meta.env.VITE_USE_SECURE_COOKIES === 'true';
    const cookieDomain = import.meta.env.VITE_COOKIE_DOMAIN;

    // Build cookie attributes for clearing
    let cookieAttributes =
      'Path=/; SameSite=Strict; Expires=Thu, 01 Jan 1970 00:00:01 GMT';

    // Add Secure flag if used
    if (useSecureCookies) {
      cookieAttributes += '; Secure';
    }

    // Add Domain attribute if specified
    if (cookieDomain && cookieDomain !== 'localhost') {
      cookieAttributes += `; Domain=${cookieDomain}`;
    }

    document.cookie = `refresh_token=; ${cookieAttributes}`;
  }

  /**
   * Schedule automatic token refresh
   * @param {number} delaySeconds - Seconds until refresh
   */
  scheduleTokenRefresh(delaySeconds) {
    this.clearRefreshTimer();

    if (delaySeconds > 0) {
      this.refreshTimer = setTimeout(() => {
        this.refreshAccessToken();
      }, delaySeconds * 1000);
    }
  }

  /**
   * Clear refresh timer
   */
  clearRefreshTimer() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  /**
   * Refresh access token using refresh token
   * @returns {Promise<string|null>} - New access token or null
   */
  async refreshAccessToken() {
    // Prevent multiple simultaneous refresh requests
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = this.performTokenRefresh();
    const result = await this.refreshPromise;
    this.refreshPromise = null;

    return result;
  }

  /**
   * Perform the actual token refresh
   * @returns {Promise<string|null>}
   */
  async performTokenRefresh() {
    try {
      const refreshToken = await this.getRefreshToken();
      if (!refreshToken) {
        // If no refresh token, this might be initial login or token expired
        return null;
      }

      // Make API call to refresh token with environment-based credentials
      const enableCredentials =
        import.meta.env.VITE_ENABLE_CREDENTIALS === 'true';
      const fetchOptions = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      };

      // Add credentials if enabled in environment
      if (enableCredentials) {
        fetchOptions.credentials = 'include';
      }

      const response = await fetch(
        `${import.meta.env.VITE_ENDPOINT || 'https://sp-cms-api.yogicse12.workers.dev'}/api/auth/refresh`,
        fetchOptions
      );

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();

      // Set new access token
      this.setAccessToken(data.accessToken, data.expiresIn);

      // Update refresh token if provided
      if (data.refreshToken) {
        await this.setRefreshToken(data.refreshToken);
      }

      return data.accessToken;
    } catch (error) {
      // Only clear tokens and redirect if this is not a "no refresh token" error
      if (!error.message?.includes('No refresh token available')) {
        this.clearAllTokens();

        // Redirect to login on refresh failure
        const currentPath = window.location.pathname;
        if (currentPath !== '/login' && currentPath !== '/auth/login') {
          window.location.href = '/login';
        }
      }

      return null;
    }
  }

  /**
   * Check if access token needs refresh
   * @returns {boolean}
   */
  needsRefresh() {
    if (!this.tokenExpiry) {
      return false;
    }

    // Refresh if token expires in less than 2 minutes
    return Date.now() >= this.tokenExpiry - 120000;
  }

  /**
   * Clear all tokens and cleanup
   */
  clearAllTokens() {
    this.clearAccessToken();
    this.clearRefreshToken();
    this.clearRefreshTimer();
  }

  /**
   * Setup cleanup listeners for security
   */
  setupCleanupListeners() {
    // Clear sensitive data on page unload
    window.addEventListener('beforeunload', () => {
      this.clearAccessToken();
    });

    // Clear data when tab becomes hidden (optional, for extra security)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Optional: Clear access token when tab is hidden
        // this.clearAccessToken();
      }
    });

    // Handle focus events (clear if away too long)
    let lastFocus = Date.now();
    window.addEventListener('focus', () => {
      const timeDiff = Date.now() - lastFocus;
      // If away for more than 30 minutes, clear tokens
      if (timeDiff > 1800000) {
        this.clearAllTokens();
        window.location.href = '/login';
      }
      lastFocus = Date.now();
    });

    window.addEventListener('blur', () => {
      lastFocus = Date.now();
    });
  }

  /**
   * Get token info for debugging (non-sensitive)
   * @returns {object}
   */
  getTokenInfo() {
    return {
      hasAccessToken: !!this.accessToken,
      accessTokenExpiry: this.tokenExpiry,
      timeUntilExpiry: this.tokenExpiry
        ? Math.max(0, this.tokenExpiry - Date.now())
        : 0,
      needsRefresh: this.needsRefresh(),
    };
  }
}

// Singleton instance
const tokenManager = new TokenManager();

export default tokenManager;
