# Configuración Next.js con Backend en ngrok

Guía mínima para conectar un frontend Next.js con un backend expuesto a través de ngrok.

---

## 📋 Configuración Rápida

### 1. Variables de Entorno

```bash
# .env.local
NEXT_PUBLIC_API_BASE_URL=https://tu-url.ngrok.io
NEXT_PUBLIC_API_VERSION=v1
```

### 2. Archivo de Configuración

```typescript
// src/lib/config.ts
export const config = {
  api: {
    backendUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000',
    version: process.env.NEXT_PUBLIC_API_VERSION || 'v1',
    
    get baseUrl() {
      if (typeof window !== 'undefined') {
        // Cliente: usar proxy para evitar warning de ngrok
        return '/api/backend';
      }
      // Servidor: usar URL directa
      return this.backendUrl;
    },
    
    get apiUrl() {
      return `${this.baseUrl}/${this.version}`;
    }
  }
};
```

### 3. Proxy de Next.js (Requerido para ngrok)

**Por qué:** ngrok muestra una página de advertencia en el navegador. El proxy evita esto.

```typescript
// src/app/api/backend/[...path]/route.ts
import { NextRequest, NextResponse } from 'next/server';

const config = {
  api: {
    backendUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000'
  }
};

export async function GET(
  request: NextRequest, 
  context: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, context, 'GET');
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, context, 'POST');
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, context, 'PUT');
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, context, 'PATCH');
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return handleRequest(request, context, 'DELETE');
}

async function handleRequest(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
  method: string
) {
  const backendBaseUrl = config.api.backendUrl;
  const params = await context.params;
  const pathSegments = params?.path ?? [];
  const joinedPath = pathSegments.join('/');
  const targetUrl = `${backendBaseUrl}/${joinedPath}${request.nextUrl.search}`;

  // Headers permitidos
  const allowedHeaders = ['authorization', 'accept', 'content-type', 'accept-language'];
  const forwardedHeaders = new Headers();
  
  for (const [key, value] of request.headers.entries()) {
    if (allowedHeaders.includes(key.toLowerCase())) {
      forwardedHeaders.set(key, value);
    }
  }

  // Header crítico para ngrok
  if (backendBaseUrl.includes('ngrok')) {
    forwardedHeaders.set('ngrok-skip-browser-warning', 'true');
  }

  // Leer body si existe
  let body: ArrayBuffer | undefined;
  if (method !== 'GET' && method !== 'DELETE') {
    body = await request.arrayBuffer();
  }

  const response = await fetch(targetUrl, {
    method,
    headers: forwardedHeaders,
    body: body,
    cache: 'no-store'
  });

  return new NextResponse(await response.arrayBuffer(), {
    status: response.status,
    headers: { 
      'content-type': response.headers.get('content-type') || 'application/json' 
    }
  });
}
```

### 4. Cliente API

```typescript
// src/lib/api.ts
import { config } from './config';

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const url = `${config.api.apiUrl}${path}`;

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  // Header para ngrok (por si acaso)
  if (config.api.backendUrl && config.api.backendUrl.includes('ngrok')) {
    defaultHeaders['ngrok-skip-browser-warning'] = 'true';
  }

  const response = await fetch(url, {
    ...init,
    headers: {
      ...defaultHeaders,
      ...(init?.headers || {}),
    },
    cache: 'no-store'
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }

  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
```

---

## 🚀 Uso

### Request Simple

```typescript
import { api } from '@/lib/api';

// GET
const data = await api<MyType>('/endpoint');

// POST
const result = await api<MyType>('/endpoint', {
  method: 'POST',
  body: JSON.stringify({ key: 'value' })
});
```

### Request con Autenticación

```typescript
import { api } from '@/lib/api';

const token = localStorage.getItem('access_token');

const data = await api<MyType>('/protected-endpoint', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

## 🔑 Puntos Clave

### Header ngrok
**Crítico:** Siempre incluir `ngrok-skip-browser-warning: true` para evitar la página de advertencia.

### Proxy
**Requerido:** Todas las llamadas deben pasar por `/api/backend` en el cliente.

### Flujo de Requests
```
Cliente → /api/backend/v1/endpoint → Proxy Next.js → https://xxx.ngrok.io/v1/endpoint → Backend
```

### Estructura de URLs
- **Cliente:** `/api/backend/v1/auth/login`
- **Proxy traduce a:** `https://tu-url.ngrok.io/v1/auth/login`
- **Backend recibe:** `/v1/auth/login`

---

## 🔧 Troubleshooting

### Warning de ngrok aparece
- Verificar que el header `ngrok-skip-browser-warning` esté en el proxy
- Asegurarse de usar el proxy (`/api/backend`) y no la URL directa

### CORS errors
- Usar el proxy de Next.js
- No hacer fetch directo a la URL de ngrok desde el cliente

### 404 en requests
- Verificar que la ruta en `[...path]/route.ts` esté correcta
- Confirmar que `NEXT_PUBLIC_API_BASE_URL` esté configurada
- Revisar que el backend esté corriendo en ngrok

---

## 📁 Estructura de Archivos Necesaria

```
src/
├── lib/
│   ├── config.ts          # Configuración de URLs
│   └── api.ts             # Cliente API
└── app/
    └── api/
        └── backend/
            └── [...path]/
                └── route.ts   # Proxy Next.js
```

---

## ✅ Checklist de Implementación

- [ ] Crear `.env.local` con `NEXT_PUBLIC_API_BASE_URL`
- [ ] Crear `src/lib/config.ts`
- [ ] Crear proxy en `src/app/api/backend/[...path]/route.ts`
- [ ] Crear cliente API en `src/lib/api.ts`
- [ ] Verificar que el header `ngrok-skip-browser-warning` esté presente
- [ ] Probar con un endpoint simple del backend

---

**Tiempo estimado de setup:** 10-15 minutos


