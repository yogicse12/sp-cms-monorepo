/**
 * Security Middleware for Route Protection
 */

import { useAuthStore } from '@/stores/auth.js';
import tokenManager from '@/services/tokenManager.js';

/**
 * Authentication middleware for protected routes
 * @param {Object} to - Target route
 * @param {Object} from - Source route
 * @param {Function} next - Navigation callback
 */
export const authMiddleware = async (to, from, next) => {
  const authStore = useAuthStore();

  try {
    // Check if route requires authentication
    if (to.meta?.requiresAuth) {
      // Validate current session
      const isSessionValid = await authStore.validateSession();

      if (!isSessionValid) {
        // Session invalid, redirect to login
        next({
          path: '/auth/login',
          query: { redirect: to.fullPath },
        });
        return;
      }

      // Check token expiry and refresh if needed
      const accessToken = tokenManager.getAccessToken();
      if (!accessToken) {
        // Try to refresh token
        const refreshed = await tokenManager.refreshAccessToken();
        if (!refreshed) {
          next({
            path: '/auth/login',
            query: { redirect: to.fullPath },
          });
          return;
        }
      }
    }

    // Check if authenticated user trying to access guest-only pages
    if (to.meta?.guest && authStore.isAuthenticated) {
      next({ path: '/' });
      return;
    }

    // Update activity on navigation
    authStore.updateActivity();

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    next({
      path: '/auth/login',
      query: { redirect: to.fullPath },
    });
  }
};

/**
 * Security headers middleware
 * @param {Object} to - Target route
 * @param {Object} from - Source route
 * @param {Function} next - Navigation callback
 */
export const securityMiddleware = (to, from, next) => {
  // Add security-related meta tags if not already present
  if (to.meta?.requiresSecureHeaders) {
    // Prevent caching of sensitive pages
    const preventCacheMeta = document.querySelector(
      'meta[http-equiv="Cache-Control"]'
    );
    if (!preventCacheMeta) {
      const meta = document.createElement('meta');
      meta.httpEquiv = 'Cache-Control';
      meta.content = 'no-cache, no-store, must-revalidate';
      document.head.appendChild(meta);
    }

    // Prevent indexing of sensitive pages
    const noIndexMeta = document.querySelector('meta[name="robots"]');
    if (!noIndexMeta) {
      const meta = document.createElement('meta');
      meta.name = 'robots';
      meta.content = 'noindex, nofollow';
      document.head.appendChild(meta);
    }
  }

  // Log navigation for security monitoring
  if (import.meta.env.PROD) {
    console.info('Navigation:', {
      from: from.path,
      to: to.path,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    });
  }

  next();
};

/**
 * Rate limiting middleware (basic client-side implementation)
 */
export const rateLimitMiddleware = (() => {
  const requests = new Map();
  const WINDOW_SIZE = 60000; // 1 minute
  const MAX_REQUESTS = 100; // Max requests per minute

  return (to, from, next) => {
    const now = Date.now();
    const key = 'global'; // In a real app, you might use IP or user ID

    if (!requests.has(key)) {
      requests.set(key, []);
    }

    const userRequests = requests.get(key);

    // Clean old requests
    const validRequests = userRequests.filter(time => now - time < WINDOW_SIZE);

    if (validRequests.length >= MAX_REQUESTS) {
      console.warn('Rate limit exceeded');
      // In a real app, you might show a rate limit error page
      next(false);
      return;
    }

    validRequests.push(now);
    requests.set(key, validRequests);

    next();
  };
})();

/**
 * Combine all security middlewares
 * @param {Object} to - Target route
 * @param {Object} from - Source route
 * @param {Function} next - Navigation callback
 */
export const securityGuard = async (to, from, next) => {
  try {
    // Run security middleware first
    securityMiddleware(to, from, () => {
      // Then run rate limiting
      rateLimitMiddleware(to, from, () => {
        // Finally run auth middleware
        authMiddleware(to, from, next);
      });
    });
  } catch (error) {
    console.error('Security guard error:', error);
    next({ path: '/auth/login' });
  }
};
