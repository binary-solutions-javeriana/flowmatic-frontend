import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

// Helper function to handle all HTTP methods
async function handleRequest(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const backendBaseUrl = config.api.backendUrl;

  // Build target URL by joining catch-all path and original query string
  const params = await context.params;
  const pathSegments = params?.path ?? [];
  const joinedPath = pathSegments.join('/');
  const search = request.nextUrl.search;
  const targetUrl = `${backendBaseUrl}/${joinedPath}${search}`;

  console.log(`[PROXY] ${request.method} ${targetUrl}`);

  // Forward selected headers; do not forward forbidden ones
  const incomingHeaders = request.headers;
  const forwardedHeaders = new Headers();
  const allowedForwardHeaders = [
    'authorization',
    'accept',
    'content-type',
    'accept-language',
    'x-request-id',
    'cookie',
    'set-cookie'
  ];

  for (const [key, value] of incomingHeaders.entries()) {
    if (allowedForwardHeaders.includes(key.toLowerCase())) {
      forwardedHeaders.set(key, value);
    }
  }

  // Add ngrok header only when hitting an ngrok host
  try {
    const backendHost = new URL(backendBaseUrl).host;
    if (backendHost.includes('ngrok')) {
      forwardedHeaders.set('ngrok-skip-browser-warning', 'true');
    }
  } catch {
    // If backendBaseUrl is invalid, we just don't add the ngrok header
  }

  // Ensure JSON defaults
  if (!forwardedHeaders.has('accept')) {
    forwardedHeaders.set('accept', 'application/json');
  }

  try {
    // Get request body if present (for POST, PUT, PATCH)
    let body: BodyInit | null = null;
    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      body = await request.arrayBuffer();
    }

    const response = await fetch(targetUrl, {
      method: request.method,
      headers: forwardedHeaders,
      body,
      cache: 'no-store'
    });

    console.log(`[PROXY] Response status: ${response.status}`);

    // Stream back response with same status and content-type
    const contentType = response.headers.get('content-type') || 'application/json';
    const responseBody = await response.arrayBuffer();
    
    // Forward Set-Cookie headers if present
    const responseHeaders = new Headers({
      'content-type': contentType
    });
    
    const setCookie = response.headers.get('set-cookie');
    if (setCookie) {
      responseHeaders.set('set-cookie', setCookie);
    }

    return new NextResponse(responseBody, {
      status: response.status,
      headers: responseHeaders
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Proxy request failed';
    console.error(`[PROXY] Error: ${message}`);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

// Export handlers for all HTTP methods
export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleRequest(request, context);
}

export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleRequest(request, context);
}

export async function PUT(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleRequest(request, context);
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleRequest(request, context);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return handleRequest(request, context);
}


