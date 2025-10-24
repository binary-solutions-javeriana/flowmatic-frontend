// Application configuration
export const config = {
  api: {
    // Original backend URL (used server-side and for logging)
    backendUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000',

    version: process.env.NEXT_PUBLIC_API_VERSION || 'v1',
    
    // Base URL for API calls
    // Client-side: use proxy to avoid ngrok warning page
    // Server-side: use direct backend URL
    get baseUrl() {
      // Check if we're in browser
      if (typeof window !== 'undefined') {
        // Allow toggling proxy usage from the browser via env var
        // Default: use proxy (true). Set NEXT_PUBLIC_API_USE_PROXY=false to call backend directly.
        const useProxy = (process.env.NEXT_PUBLIC_API_USE_PROXY ?? 'true') !== 'false';
        return useProxy ? '/api/backend' : this.backendUrl;
      }
      // Server-side: use direct backend URL
      return this.backendUrl;
    },
    
    get apiUrl() {
      const url = `${this.baseUrl}/${this.version}`;
      if (typeof window !== 'undefined') {
        console.log('[CONFIG] Using API proxy to bypass ngrok warning');
        console.log('[CONFIG] API URL:', url);
        console.log('[CONFIG] Proxying to:', this.backendUrl);
        console.log('[CONFIG] Version:', this.version);
      }
      return url;
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
      `⚠️ [CONFIG] Missing environment variables: ${missing.join(', ')}. ` +
      'Using fallback values. Please set these in your .env.local file or Vercel environment variables.'
    );
    console.warn(
      `⚠️ [CONFIG] Current NEXT_PUBLIC_API_BASE_URL: ${process.env.NEXT_PUBLIC_API_BASE_URL || 'NOT SET (using fallback: http://localhost:3000)'}`
    );
  } else {
    console.log('✅ [CONFIG] All required environment variables are set');
    console.log(`✅ [CONFIG] NEXT_PUBLIC_API_BASE_URL: ${process.env.NEXT_PUBLIC_API_BASE_URL}`);
  }
}

// Call validation on import
if (typeof window !== 'undefined') {
  validateEnvironment();
}
