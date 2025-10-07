# Guía de Mapeo de Llamadas Frontend → Backend

Esta guía documenta todas las llamadas del frontend de Flowmatic a los endpoints del backend, incluyendo métodos HTTP, rutas, parámetros y respuestas esperadas.

## Configuración Base

**URL Base del API**: `${NEXT_PUBLIC_API_BASE_URL}/v1`
- Por defecto: `http://localhost:3000/v1`
- Configurable mediante variable de entorno `NEXT_PUBLIC_API_BASE_URL`

**Health Check**: `${NEXT_PUBLIC_API_BASE_URL}/health` (sin versión)

---

## 📋 Índice de Endpoints

- [Autenticación](#autenticación)
- [Proyectos](#proyectos)
- [Health Check](#health-check)
- [Endpoints Futuros (No Implementados)](#endpoints-futuros-no-implementados)

---

## 🔐 Autenticación

### 1. Login de Usuario

**Frontend:**
- **Archivo**: `src/lib/http-auth-service.ts`
- **Método**: `login(credentials: LoginRequest)`
- **Línea**: 25-38

**Backend:**
```
POST /v1/auth/login
```

**Request Body:**
```typescript
{
  email: string;      // Email del usuario
  password: string;   // Contraseña del usuario
}
```

**Response (200 OK):**
```typescript
{
  user: {
    id: string;
    email: string;
    app_metadata?: Record<string, unknown>;
    user_metadata?: Record<string, unknown>;
    aud: string;
  };
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type?: 'bearer';
}
```

**Errores Esperados:**
- `400 Bad Request`: Datos de entrada inválidos
- `401 Unauthorized`: Credenciales incorrectas
- `409 Conflict`: Conflicto con recurso existente

**Usado en:**
- `src/app/login/LoginForm.tsx`
- `src/components/auth/LoginForm.tsx`
- `src/components/auth/Login.tsx`

---

### 2. Registro de Usuario

**Frontend:**
- **Archivo**: `src/lib/http-auth-service.ts`
- **Método**: `register(credentials: RegisterRequest)`
- **Línea**: 41-63

**Backend:**
```
POST /v1/auth/register
```

**Request Body:**
```typescript
{
  email: string;      // Email del usuario
  password: string;   // Contraseña del usuario
}
```

**Response (201 Created):**

Opción A - Registro con confirmación automática:
```typescript
{
  user: {
    id: string;
    email: string;
    app_metadata?: Record<string, unknown>;
    user_metadata?: Record<string, unknown>;
    aud: string;
  };
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type?: 'bearer';
  message?: string;
}
```

Opción B - Registro que requiere confirmación por email:
```typescript
{
  user: {
    id: string;
    email: string;
    app_metadata?: Record<string, unknown>;
    user_metadata?: Record<string, unknown>;
    aud: string;
  };
  message: string;  // Ej: "Please confirm your email"
}
```

**Errores Esperados:**
- `400 Bad Request`: Datos de entrada inválidos
- `409 Conflict`: Email ya registrado

**Usado en:**
- `src/app/register/RegisterForm.tsx`

---

## 📁 Proyectos

Todos los endpoints de proyectos requieren autenticación mediante token JWT en el header:
```
Authorization: Bearer {access_token}
```

### 3. Obtener Lista de Proyectos (con filtros y paginación)

**Frontend:**
- **Archivo**: `src/lib/hooks/use-projects.ts`
- **Hook**: `useProjects(initialFilters?: ProjectFilters)`
- **Línea**: 14-73

**Backend:**
```
GET /v1/projects?page={page}&limit={limit}&search={search}&status={status}&type={type}&orderBy={orderBy}&order={order}
```

**Query Parameters:**
- `page` (number, requerido): Número de página (default: 1)
- `limit` (number, requerido): Registros por página (default: 10)
- `search` (string, opcional): Búsqueda en nombre/descripción
- `status` (string, opcional): Filtrar por estado del proyecto
- `type` (string, opcional): Filtrar por tipo de proyecto
- `orderBy` (string, opcional): Campo para ordenar (ej: 'created_at', 'updated_at', 'name_proyect')
- `order` ('asc' | 'desc', opcional): Dirección del ordenamiento

**Response (200 OK):**
```typescript
{
  data: [
    {
      proyect_id: number;
      name_proyect: string;
      description?: string;
      state: string;
      type?: string;
      start_date?: string;
      end_date?: string;
      created_by?: number;
      created_at: string;
      updated_at: string;
    }
  ];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

**Usado en:**
- `src/app/dashboard/projects/page.tsx`
- `src/components/dashboard/ProjectsGrid.tsx`
- `src/components/dashboard/ProjectsList.tsx`

---

### 4. Obtener Proyectos Recientes

**Frontend:**
- **Archivo**: `src/lib/hooks/use-projects.ts`
- **Hook**: `useRecentProjects(limit: number = 5)`
- **Línea**: 203-234

**Backend:**
```
GET /v1/projects?limit={limit}&orderBy=updated_at&order=desc
```

**Query Parameters:**
- `limit` (number): Número de proyectos recientes (default: 5)
- `orderBy`: 'updated_at' (fijo)
- `order`: 'desc' (fijo)

**Response:** Mismo formato que "Obtener Lista de Proyectos"

**Usado en:**
- `src/app/dashboard/projects/recent/page.tsx`
- `src/components/dashboard/Overview.tsx`

---

### 5. Obtener Detalle de Proyecto Individual

**Frontend:**
- **Archivo**: `src/lib/hooks/use-projects.ts`
- **Hook**: `useProject(projectId: number)`
- **Línea**: 76-109

**Backend:**
```
GET /v1/projects/{projectId}
```

**Path Parameters:**
- `projectId` (number): ID del proyecto

**Response (200 OK):**
```typescript
{
  proyect_id: number;
  name_proyect: string;
  description?: string;
  state: string;
  type?: string;
  start_date?: string;
  end_date?: string;
  created_by?: number;
  created_at: string;
  updated_at: string;
}
```

**Errores Esperados:**
- `404 Not Found`: Proyecto no existe

**Usado en:**
- `src/app/dashboard/projects/[id]/page.tsx`
- `src/components/dashboard/ProjectDetailsModal.tsx`

---

### 6. Crear Nuevo Proyecto

**Frontend:**
- **Archivo**: `src/lib/hooks/use-projects.ts`
- **Hook**: `useCreateProject()`
- **Método**: `createProject(data: CreateProjectRequest)`
- **Línea**: 112-139

**Backend:**
```
POST /v1/projects
```

**Request Body:**
```typescript
{
  name_proyect: string;        // Requerido: Nombre del proyecto
  description?: string;         // Opcional: Descripción
  state: string;               // Requerido: Estado del proyecto
  type?: string;               // Opcional: Tipo de proyecto
  start_date?: string;         // Opcional: Fecha de inicio (ISO 8601)
  end_date?: string;           // Opcional: Fecha de fin (ISO 8601)
  created_by: number;          // Requerido: ID del usuario creador
}
```

**Response (201 Created):**
```typescript
{
  proyect_id: number;
  name_proyect: string;
  description?: string;
  state: string;
  type?: string;
  start_date?: string;
  end_date?: string;
  created_by?: number;
  created_at: string;
  updated_at: string;
}
```

**Errores Esperados:**
- `400 Bad Request`: Datos de entrada inválidos
- `401 Unauthorized`: Token inválido o expirado

**Usado en:**
- `src/app/dashboard/projects/new/page.tsx`
- `src/components/ProjectForm.tsx`
- `src/components/dashboard/ProjectModal.tsx`

---

### 7. Actualizar Proyecto

**Frontend:**
- **Archivo**: `src/lib/hooks/use-projects.ts`
- **Hook**: `useUpdateProject()`
- **Método**: `updateProject(projectId: number, data: Partial<CreateProjectRequest>)`
- **Línea**: 142-169

**Backend:**
```
PATCH /v1/projects/{projectId}
```

**Path Parameters:**
- `projectId` (number): ID del proyecto a actualizar

**Request Body (todos los campos opcionales):**
```typescript
{
  name_proyect?: string;
  description?: string;
  state?: string;
  type?: string;
  start_date?: string;
  end_date?: string;
}
```

**Response (200 OK):**
```typescript
{
  proyect_id: number;
  name_proyect: string;
  description?: string;
  state: string;
  type?: string;
  start_date?: string;
  end_date?: string;
  created_by?: number;
  created_at: string;
  updated_at: string;
}
```

**Errores Esperados:**
- `400 Bad Request`: Datos de entrada inválidos
- `401 Unauthorized`: Token inválido o expirado
- `404 Not Found`: Proyecto no existe

**Usado en:**
- `src/app/dashboard/projects/[id]/edit/page.tsx`
- `src/components/ProjectForm.tsx`

---

### 8. Eliminar Proyecto

**Frontend:**
- **Archivo**: `src/lib/hooks/use-projects.ts`
- **Hook**: `useDeleteProject()`
- **Método**: `deleteProject(projectId: number)`
- **Línea**: 172-200

**Backend:**
```
DELETE /v1/projects/{projectId}
```

**Path Parameters:**
- `projectId` (number): ID del proyecto a eliminar

**Response (204 No Content):**
Sin cuerpo de respuesta

**Errores Esperados:**
- `401 Unauthorized`: Token inválido o expirado
- `404 Not Found`: Proyecto no existe

**Usado en:**
- `src/components/dashboard/ProjectsGrid.tsx`
- `src/components/dashboard/ProjectsList.tsx`
- `src/components/dashboard/ProjectDetailsModal.tsx`

---

## 🏥 Health Check

### 9. Verificar Estado del Servicio

**Frontend:**
- **Archivo**: `src/lib/api.ts`
- **Función**: `checkHealth()`
- **Línea**: 98-116

**Backend:**
```
GET /health
```

**Nota:** Este endpoint NO usa el prefijo `/v1`

**Response (200 OK):**
```typescript
{
  status: string;     // Ej: "ok", "healthy"
  service: string;    // Nombre del servicio
  uptime: number;     // Tiempo de actividad en segundos
  timestamp: string;  // Timestamp ISO 8601
}
```

**Usado en:**
- `src/components/ApiTest.tsx`
- Tests y monitoreo de disponibilidad

---

## 🚧 Endpoints Futuros (No Implementados)

Los siguientes endpoints están definidos en el código pero aún no están implementados en el backend:

### Perfil de Usuario

```typescript
// Obtener perfil
GET /v1/user/profile

// Actualizar perfil
PUT /v1/user/profile
Request Body: Record<string, unknown>

// Obtener configuraciones
GET /v1/user/settings

// Actualizar configuraciones
PATCH /v1/user/settings
Request Body: Record<string, unknown>

// Eliminar cuenta
DELETE /v1/user/account
```

**Referencias en código:**
- `src/lib/authenticated-api.ts` (líneas 70-95)

### Refresh de Tokens

```typescript
// Refrescar tokens de autenticación
POST /v1/auth/refresh
Request Body: {
  refreshToken: string;
}

Response: {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: 'bearer';
}
```

**Referencias en código:**
- `src/lib/http-auth-service.ts` (líneas 66-74)
- `src/lib/auth-service.ts` (líneas 42-46)

### Obtener Usuario Actual

```typescript
// Obtener información del usuario autenticado
GET /v1/user/me  o  GET /v1/auth/me

Response: {
  id: string;
  email: string;
  app_metadata?: Record<string, unknown>;
  user_metadata?: Record<string, unknown>;
  aud: string;
}
```

**Referencias en código:**
- `src/lib/http-auth-service.ts` (líneas 82-96)

---

## 📝 Notas Técnicas

### Headers Comunes

**Todas las peticiones incluyen:**
```
Content-Type: application/json
Accept: application/json
```

**Peticiones autenticadas agregan:**
```
Authorization: Bearer {access_token}
```

### Almacenamiento de Tokens

Los tokens se guardan en localStorage con las siguientes keys:
- `flowmatic_access_token`: Access token JWT
- `flowmatic_refresh_token`: Refresh token
- `flowmatic_user`: Información del usuario serializada

### Manejo de Errores

El backend debe responder con el siguiente formato de error:
```typescript
{
  statusCode: number;
  message: string | string[];
  path: string;
  method: string;
  timestamp: string;
  requestId: string;
}
```

### Cache Policy

Todas las peticiones del frontend se hacen con:
```typescript
cache: 'no-store'
```

Esto previene cacheo y asegura datos frescos en cada petición.

---

## 🔍 Ubicación de Archivos Clave

### Servicios HTTP
- `src/lib/api.ts` - Cliente HTTP base
- `src/lib/authenticated-api.ts` - Cliente HTTP con autenticación
- `src/lib/http-auth-service.ts` - Servicio de autenticación HTTP
- `src/lib/config.ts` - Configuración de URLs

### Hooks
- `src/lib/hooks/use-projects.ts` - Hooks para operaciones de proyectos
- `src/lib/use-authenticated-api.ts` - Hook genérico para llamadas autenticadas

### Tipos
- `src/lib/auth-types.ts` - Tipos de autenticación
- `src/lib/types/project-types.ts` - Tipos de proyectos

---

## 📊 Resumen de Endpoints

| # | Método | Endpoint | Autenticación | Estado |
|---|--------|----------|---------------|---------|
| 1 | POST | `/v1/auth/login` | No | ✅ Implementado |
| 2 | POST | `/v1/auth/register` | No | ✅ Implementado |
| 3 | GET | `/v1/projects` | Sí | ✅ Implementado |
| 4 | GET | `/v1/projects/{id}` | Sí | ✅ Implementado |
| 5 | POST | `/v1/projects` | Sí | ✅ Implementado |
| 6 | PATCH | `/v1/projects/{id}` | Sí | ✅ Implementado |
| 7 | DELETE | `/v1/projects/{id}` | Sí | ✅ Implementado |
| 8 | GET | `/health` | No | ✅ Implementado |
| 9 | POST | `/v1/auth/refresh` | Parcial | ⏳ Pendiente |
| 10 | GET | `/v1/user/profile` | Sí | ⏳ Pendiente |
| 11 | PUT | `/v1/user/profile` | Sí | ⏳ Pendiente |
| 12 | GET | `/v1/user/settings` | Sí | ⏳ Pendiente |
| 13 | PATCH | `/v1/user/settings` | Sí | ⏳ Pendiente |
| 14 | DELETE | `/v1/user/account` | Sí | ⏳ Pendiente |
| 15 | GET | `/v1/user/me` | Sí | ⏳ Pendiente |

---

## 🔄 Última Actualización

**Fecha**: 1 de Octubre, 2025  
**Versión Frontend**: develop branch  
**Versión API**: v1

---

**Nota para el equipo de Backend**: Esta guía está basada en el código actual del frontend. Si encuentran discrepancias o necesitan modificar algún contrato de API, por favor coordinar con el equipo de frontend para mantener la sincronización.



