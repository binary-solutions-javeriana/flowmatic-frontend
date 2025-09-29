# Environment Configuration

## Required Environment Variables

Create a `.env.local` file in the project root with the following variables:

```bash
# Flowmatic Backend API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
NEXT_PUBLIC_API_VERSION=v1
```

## Environment Variables Explained

- `NEXT_PUBLIC_API_BASE_URL`: Base URL of the Flowmatic backend API
- `NEXT_PUBLIC_API_VERSION`: API version prefix (defaults to 'v1')

## Default Values

If environment variables are not set, the application will use these fallbacks:
- API Base URL: `http://localhost:3000`
- API Version: `v1`

## API Endpoints

With the default configuration, the following endpoints will be available:
- Health Check: `http://localhost:3000/health`
- Auth API: `http://localhost:3000/v1/auth/`
  - Login: `POST /v1/auth/login`
  - Register: `POST /v1/auth/register`

## Development Setup

1. Copy this file to `.env.local`
2. Update the values according to your backend setup
3. Restart the development server: `npm run dev`

## Production Setup

Set these environment variables in your production environment (Vercel, Netlify, etc.) with your production API URLs.
