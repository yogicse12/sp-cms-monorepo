# Security Configuration Guide

This application uses environment-based security configuration for different deployment scenarios.

## Environment Files

### Development (`.env.development`)

- **API Endpoint**: `http://localhost:8787`
- **Secure Cookies**: Disabled (HTTP allowed)
- **Credentials**: Disabled (no CORS credentials)
- **Cookie Domain**: `localhost`

### Production (`.env.production`)

- **API Endpoint**: `https://sp-cms-api.yogicse12.workers.dev`
- **Secure Cookies**: Enabled (HTTPS only)
- **Credentials**: Enabled (HttpOnly cookies)
- **Cookie Domain**: Your production domain

## Environment Variables

| Variable                  | Development             | Production                                 | Description                    |
| ------------------------- | ----------------------- | ------------------------------------------ | ------------------------------ |
| `VITE_ENDPOINT`           | `http://localhost:8787` | `https://sp-cms-api.yogicse12.workers.dev` | API base URL                   |
| `VITE_USE_SECURE_COOKIES` | `false`                 | `true`                                     | Enable Secure flag on cookies  |
| `VITE_COOKIE_DOMAIN`      | `localhost`             | `your-domain.com`                          | Cookie domain setting          |
| `VITE_ENABLE_CREDENTIALS` | `false`                 | `true`                                     | Enable credentials in requests |
| `VITE_ENCRYPTION_KEY`     | Dev key                 | Production key                             | 32-character AES key           |

## Security Features by Environment

### Development Mode

- ✅ **AES Encryption** - User data encrypted in memory
- ✅ **Token Auto-refresh** - 15-minute access tokens
- ✅ **XSS Protection** - Input/output sanitization
- ✅ **CSP Headers** - Content Security Policy
- ⚠️ **HTTP Cookies** - Regular cookies (not HttpOnly)
- ⚠️ **No Credentials** - CORS-compatible mode

### Production Mode

- ✅ **AES Encryption** - User data encrypted in memory
- ✅ **Token Auto-refresh** - 15-minute access tokens
- ✅ **XSS Protection** - Input/output sanitization
- ✅ **CSP Headers** - Content Security Policy
- ✅ **HTTPS-Only Cookies** - Secure flag enabled
- ✅ **Credentials Mode** - HttpOnly cookies support
- ✅ **Domain-specific** - Cookie domain restrictions

## Setup Instructions

### 1. Copy Environment File

```bash
# For development
cp .env.development .env

# Or copy example and customize
cp .env.example .env
```

### 2. Update Production Settings

```bash
# Generate a secure encryption key (32 characters)
VITE_ENCRYPTION_KEY=your-secure-32-character-key

# Set your domain
VITE_COOKIE_DOMAIN=yourdomain.com
```

### 3. Server Configuration (Production)

For production deployment, ensure your server/CDN sets:

```http
# HTTP Headers (set by server)
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin

# CORS Headers (for API)
Access-Control-Allow-Origin: https://yourdomain.com
Access-Control-Allow-Credentials: true
```

## Cookie Security Comparison

| Feature     | Development      | Production       |
| ----------- | ---------------- | ---------------- |
| Secure Flag | ❌ (HTTP)        | ✅ (HTTPS)       |
| HttpOnly    | ❌ (Client-side) | ✅ (Server-set)  |
| SameSite    | `Strict`         | `Strict`         |
| Domain      | `localhost`      | `yourdomain.com` |
| Encryption  | ✅ AES-GCM       | ✅ AES-GCM       |

## Troubleshooting

### CORS Errors

- **Development**: Ensure API server allows `http://localhost:3000`
- **Production**: Configure specific origins instead of wildcards

### Cookie Issues

- **Development**: Check browser dev tools for cookie settings
- **Production**: Ensure HTTPS and proper domain configuration

### Token Refresh Failures

- Check console logs for specific error messages
- Verify API endpoints are accessible
- Confirm environment variables are set correctly

## Security Best Practices

1. **Never commit** production encryption keys to version control
2. **Use HTTPS** in production with proper SSL certificates
3. **Configure CORS** with specific origins, not wildcards
4. **Set security headers** at the server/CDN level
5. **Rotate encryption keys** periodically
6. **Monitor** authentication logs for suspicious activity
