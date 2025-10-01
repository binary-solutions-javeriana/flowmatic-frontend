// Application configuration
export const config = {
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://10.43.103.86:3000',
    version: process.env.NEXT_PUBLIC_API_VERSION || 'v1',
    get apiUrl() {
      return `${this.baseUrl}/${this.version}`;
    },
    get healthUrl() {
      return `${this.baseUrl}/health`;
    }
  },
  auth: {
    // Token storage keys
    accessTokenKey: 'flowmatic_access_token',
    refreshTokenKey: 'flowmatic_refresh_token',
    userKey: 'flowmatic_user',
  }
} as const;

// Environment validation
export function validateEnvironment() {
  const required = [
    'NEXT_PUBLIC_API_BASE_URL'
  ] as const;

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.warn(
      `Missing environment variables: ${missing.join(', ')}. ` +
      'Using fallback values. Please set these in your .env.local file.'
    );
  }
}

// Call validation on import
if (typeof window !== 'undefined') {
  validateEnvironment();
}
