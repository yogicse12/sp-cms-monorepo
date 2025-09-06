/**
 * XSS Protection and Security Utilities
 */

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param {string} input - Raw HTML input
 * @returns {string} - Sanitized HTML
 */
export const sanitizeHtml = input => {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Create a temporary div element
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
};

/**
 * Escape HTML entities
 * @param {string} text - Text to escape
 * @returns {string} - Escaped text
 */
export const escapeHtml = text => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
  };

  return text.replace(/[&<>"'/]/g, s => map[s]);
};

/**
 * Validate and sanitize user input
 * @param {string} input - User input
 * @param {object} options - Validation options
 * @returns {string} - Sanitized input
 */
export const sanitizeInput = (input, options = {}) => {
  if (!input || typeof input !== 'string') {
    return '';
  }

  let sanitized = input.trim();

  // Remove potential script tags and event handlers
  sanitized = sanitized.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    ''
  );
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/javascript:/gi, '');

  if (options.maxLength) {
    sanitized = sanitized.substring(0, options.maxLength);
  }

  return sanitized;
};

/**
 * Content Security Policy configuration
 */
export const CSP_CONFIG = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'", // Required for Vue.js in development
    "'unsafe-eval'", // Required for Vue.js in development
    'https://cdn.jsdelivr.net',
    'https://unpkg.com',
  ],
  'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
  'font-src': ["'self'", 'https://fonts.gstatic.com'],
  'img-src': ["'self'", 'data:', 'https:'],
  'connect-src': [
    "'self'",
    'https://sp-cms-api.yogicse12.workers.dev',
    'http://localhost:8787', // Development API
    'wss:',
  ],
  'frame-src': ["'none'"],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
};

/**
 * Generate CSP header value from config
 * @returns {string} - CSP header value
 */
export const generateCSPHeader = () => {
  return Object.entries(CSP_CONFIG)
    .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
    .join('; ');
};

/**
 * Apply security headers to HTML document
 */
export const applySecurityHeaders = () => {
  // Set CSP via meta tag (should ideally be set by server)
  const cspMeta = document.createElement('meta');
  cspMeta.httpEquiv = 'Content-Security-Policy';
  cspMeta.content = generateCSPHeader();
  document.head.appendChild(cspMeta);

  // Note: X-Frame-Options can only be set via HTTP headers, not meta tags
  // This should be configured on your web server or CDN
  // frameMeta.httpEquiv = 'X-Frame-Options'; // This causes a warning

  // Prevent MIME type sniffing
  const noSniffMeta = document.createElement('meta');
  noSniffMeta.httpEquiv = 'X-Content-Type-Options';
  noSniffMeta.content = 'nosniff';
  document.head.appendChild(noSniffMeta);

  // Enable XSS protection
  const xssProtectionMeta = document.createElement('meta');
  xssProtectionMeta.httpEquiv = 'X-XSS-Protection';
  xssProtectionMeta.content = '1; mode=block';
  document.head.appendChild(xssProtectionMeta);

  // Referrer policy
  const referrerMeta = document.createElement('meta');
  referrerMeta.name = 'referrer';
  referrerMeta.content = 'strict-origin-when-cross-origin';
  document.head.appendChild(referrerMeta);
};

/**
 * Validate JWT token structure (basic validation)
 * @param {string} token - JWT token
 * @returns {boolean} - Whether token has valid structure
 */
export const isValidJWTStructure = token => {
  if (!token || typeof token !== 'string') {
    return false;
  }

  const parts = token.split('.');
  return parts.length === 3 && parts.every(part => part.length > 0);
};

/**
 * Check if string contains potential XSS payload
 * @param {string} input - Input to check
 * @returns {boolean} - Whether input contains potential XSS
 */
export const containsXSS = input => {
  if (!input || typeof input !== 'string') {
    return false;
  }

  const xssPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /vbscript:/i,
    /data:text\/html/i,
  ];

  return xssPatterns.some(pattern => pattern.test(input));
};

/**
 * Secure random string generator for CSRF tokens
 * @param {number} length - Length of the token
 * @returns {string} - Random token
 */
export const generateCSRFToken = (length = 32) => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Initialize security measures
 */
export const initializeSecurity = () => {
  // Apply security headers
  applySecurityHeaders();

  // Set up global error handler for security events
  window.addEventListener('securitypolicyviolation', event => {
    console.warn('CSP violation detected:', {
      violatedDirective: event.violatedDirective,
      blockedURI: event.blockedURI,
      originalPolicy: event.originalPolicy,
    });

    // In production, you might want to report this to your security monitoring
  });

  // Prevent console access in production
  if (import.meta.env.PROD) {
    // Disable console methods
    const noop = () => {};
    Object.keys(console).forEach(key => {
      if (typeof console[key] === 'function') {
        console[key] = noop;
      }
    });

    // Detect DevTools opening attempts
    let devtools = { open: false, orientation: null };
    setInterval(() => {
      if (
        window.outerHeight - window.innerHeight > 200 ||
        window.outerWidth - window.innerWidth > 200
      ) {
        if (!devtools.open) {
          devtools.open = true;
          // In production, you might want to log out the user or show a warning
        }
      } else {
        devtools.open = false;
      }
    }, 500);
  }
};
