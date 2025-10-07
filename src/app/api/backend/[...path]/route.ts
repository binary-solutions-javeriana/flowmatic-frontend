import { NextRequest, NextResponse } from 'next/server';
import { config } from '@/lib/config';

// Proxy only GET requests. Other verbs can be added similarly if needed.
export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  const backendBaseUrl = config.api.backendUrl; // e.g., ngrok or production URL

  // Build target URL by joining catch-all path and original query string
  const params = await context.params;
  const pathSegments = params?.path ?? [];
  const joinedPath = pathSegments.join('/');
  const search = request.nextUrl.search; // includes leading '?', or empty string
  const targetUrl = `${backendBaseUrl}/${joinedPath}${search}`;

  // Forward selected headers; do not forward forbidden ones
  const incomingHeaders = request.headers;
  const forwardedHeaders = new Headers();
  const allowedForwardHeaders = [
    'authorization',
    'accept',
    'content-type',
    'accept-language',
    'x-request-id'
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
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: forwardedHeaders,
      cache: 'no-store'
    });

    // Stream back response with same status and content-type
    const contentType = response.headers.get('content-type') || 'application/json';
    const body = await response.arrayBuffer();
    return new NextResponse(body, {
      status: response.status,
      headers: {
        'content-type': contentType
      }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Proxy request failed';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}


