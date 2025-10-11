# Guía de Registro de Usuario - Flowmatic Frontend

Esta guía documenta el proceso completo de registro de usuarios en el servicio Flowmatic, incluyendo los pasos del frontend, los endpoints del backend y el flujo de autenticación con Supabase.

## 📋 Resumen del Proceso

El registro de usuarios en Flowmatic sigue este flujo:

1. **Frontend**: Usuario completa formulario de registro
2. **Validación**: Validación client-side con Zod
3. **Llamada al Backend**: POST a `/v1/auth/register`
4. **Backend**: Registro en Supabase Auth + creación en tabla de usuarios
5. **Respuesta**: Tokens de acceso (auto-confirm) o confirmación por email
6. **Redirección**: Dashboard o página de confirmación

---

## 🔄 Flujo Detallado

### 1. Formulario de Registro (Frontend)

**Archivo**: `src/app/register/RegisterForm.tsx`

**Validación con Zod**:
```typescript
const registerSchema = z.object({
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  password: z.string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});
```

**Campos del formulario**:
- Email (requerido, formato válido)
- Password (mínimo 8 caracteres, mayúscula, minúscula, número)
- Confirm Password (debe coincidir)

### 2. Procesamiento del Formulario

**Función**: `handleSubmit` en `RegisterForm.tsx`

```typescript
async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
  e.preventDefault();
  setIsSubmitting(true);
  setErrors({});
  clearAllErrors();
  setSuccessMessage(null);

  // Validación con Zod
  const result = registerSchema.safeParse({ email, password, confirmPassword });

  if (!result.success) {
    // Manejo de errores de validación
    const fieldErrors: Record<string, string> = {};
    result.error.issues.forEach((issue) => {
      const path = issue.path[0] as string | undefined;
      if (path && !fieldErrors[path]) {
        fieldErrors[path] = issue.message;
      }
    });
    setErrors(fieldErrors);
    setIsSubmitting(false);
    return;
  }

  try {
    // Llamada al servicio de autenticación
    const result = await register(email, password);
    
    // Manejo de diferentes resultados
    if (result && result.requiresEmailConfirmation) {
      router.push('/auth/confirm');
    } else if (result.tokens) {
      router.push('/auth/success');
    } else {
      setSuccessMessage("Registration successful!");
    }
  } catch (error) {
    console.error('Registration failed:', error);
  } finally {
    setIsSubmitting(false);
  }
}
```

### 3. Servicio de Autenticación

**Archivo**: `src/lib/auth-store.tsx`

**Función**: `register`

```typescript
const register = async (email: string, password: string) => {
  try {
    dispatch({ type: 'AUTH_START' });
    
    const result = await service.register({ email, password });
    
    // Almacenar tokens si se proporcionan (caso auto-confirm)
    if (result.tokens) {
      const anyTokens = result.tokens as unknown as Partial<AuthTokens> & Partial<AuthTokensApiShape>;
      const access = anyTokens.accessToken ?? anyTokens.access_token;
      const refresh = anyTokens.refreshToken ?? anyTokens.refresh_token;
      if (access) localStorage.setItem('flowmatic_access_token', access);
      if (refresh) localStorage.setItem('flowmatic_refresh_token', refresh);
      localStorage.setItem('flowmatic_user', JSON.stringify(result.user));
    }
    
    dispatch({
      type: 'AUTH_SUCCESS',
      payload: { user: result.user, tokens: result.tokens as AuthTokens | AuthTokensApiShape | undefined }
    });
    
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Registration failed';
    dispatch({ type: 'AUTH_ERROR', payload: message });
    throw error;
  }
};
```

### 4. Servicio HTTP

**Archivo**: `src/lib/http-auth-service.ts`

**Método**: `register`

```typescript
async register(credentials: RegisterRequest): Promise<AuthResult> {
  try {
    const response = await api<RegisterApiResponse>(`${this.basePath}/register`, {
      method: 'POST',
      body: JSON.stringify(credentials)
    });

    const result: AuthResult = {
      user: this.mapUser(response.user),
      message: response.message
    };

    // Verificar si el registro incluye tokens (auto-confirm) o requiere confirmación por email
    if (hasTokens(response)) {
      result.tokens = this.mapTokens(response);
    } else if (requiresEmailConfirmation(response)) {
      result.requiresEmailConfirmation = true;
    }

    return result;
  } catch (error) {
    throw this.mapError(error);
  }
}
```

---

## 🌐 Endpoints del Backend

### Endpoint Principal: Registro de Usuario

**URL**: `POST /v1/auth/register`

**Configuración**:
- **Base URL**: `${NEXT_PUBLIC_API_BASE_URL}/v1`
- **Proxy**: `/api/backend` (para evitar warning de ngrok)
- **Headers**: 
  - `Content-Type: application/json`
  - `Accept: application/json`
  - `ngrok-skip-browser-warning: true` (si es ngrok)

**Request Body**:
```typescript
{
  email: string;      // Email del usuario
  password: string;   // Contraseña del usuario
}
```

**Response - Opción A (Auto-confirmación)**:
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

**Response - Opción B (Requiere confirmación por email)**:
```typescript
{
  user: {
    id: string;
    email: string;
    app_metadata?: Record<string, unknown>;
    user_metadata?: Record<string, unknown>;
    aud: string;
  };
  message: string;  // Ej: "Please check your email to confirm your account"
}
```

**Códigos de Error**:
- `400 Bad Request`: Datos de entrada inválidos
- `409 Conflict`: Email ya registrado
- `500 Internal Server Error`: Error del servidor

---

## 🔧 Configuración del Backend

### Variables de Entorno

**Frontend**:
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
NEXT_PUBLIC_API_VERSION=v1
```

**Backend** (Supabase):
```bash
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Proceso en el Backend

El backend debe realizar estos pasos:

1. **Validación de datos**:
   - Email válido
   - Password mínimo 8 caracteres
   - Email único en la base de datos

2. **Registro en Supabase Auth**:
   ```typescript
   const { data, error } = await supabase.auth.signUp({
     email: credentials.email,
     password: credentials.password,
   });
   ```

3. **Creación en tabla de usuarios**:
   ```sql
   INSERT INTO users (id, email, created_at, updated_at)
   VALUES (auth_user_id, email, NOW(), NOW());
   ```

4. **Respuesta según configuración**:
   - **Auto-confirm**: Retornar tokens de acceso
   - **Email confirm**: Retornar solo mensaje de confirmación

---

## 📱 Flujos de Usuario

### Flujo 1: Registro con Auto-confirmación

1. Usuario completa formulario
2. Frontend valida datos
3. POST a `/v1/auth/register`
4. Backend registra en Supabase Auth
5. Backend crea usuario en tabla
6. Backend retorna tokens
7. Frontend almacena tokens en localStorage
8. Redirección a `/auth/success`
9. Usuario autenticado automáticamente

### Flujo 2: Registro con Confirmación por Email

1. Usuario completa formulario
2. Frontend valida datos
3. POST a `/v1/auth/register`
4. Backend registra en Supabase Auth
5. Backend crea usuario en tabla
6. Backend retorna mensaje de confirmación
7. Frontend redirección a `/auth/confirm`
8. Usuario debe confirmar email
9. Después de confirmar, usuario puede hacer login

---

## 🔐 Almacenamiento de Tokens

**LocalStorage Keys**:
- `flowmatic_access_token`: Token de acceso JWT
- `flowmatic_refresh_token`: Token de renovación
- `flowmatic_user`: Información del usuario serializada

**Estructura del usuario almacenado**:
```typescript
{
  id: string;
  email: string;
  app_metadata: Record<string, unknown>;
  user_metadata: Record<string, unknown>;
  aud: string;
}
```

---

## 🚨 Manejo de Errores

### Errores de Validación (Frontend)
- Email inválido
- Password no cumple requisitos
- Passwords no coinciden

### Errores de API
- `400 Bad Request`: Datos inválidos
- `409 Conflict`: Email ya registrado
- `500 Internal Server Error`: Error del servidor

### Manejo en el Frontend
```typescript
try {
  const result = await register(email, password);
  // Manejo de éxito
} catch (error) {
  // Error ya manejado por auth store
  console.error('Registration failed:', error);
}
```

---

## 📁 Archivos Clave

### Frontend
- `src/app/register/RegisterForm.tsx` - Formulario de registro
- `src/app/register/page.tsx` - Página de registro
- `src/lib/auth-store.tsx` - Store de autenticación
- `src/lib/http-auth-service.ts` - Servicio HTTP
- `src/lib/auth-types.ts` - Tipos de autenticación
- `src/lib/api.ts` - Cliente HTTP base

### Configuración
- `src/lib/config.ts` - Configuración de URLs
- `src/app/api/backend/[...path]/route.ts` - Proxy de API

### Tipos
- `src/lib/auth-types.ts` - Interfaces de autenticación
- `src/lib/types/project-types.ts` - Tipos de proyectos

---

## 🔄 Próximos Pasos

Después del registro exitoso, el usuario puede:

1. **Acceder al Dashboard**: `/dashboard`
2. **Crear Proyectos**: `/dashboard/projects/new`
3. **Ver Proyectos**: `/dashboard/projects`
4. **Configurar Perfil**: `/dashboard/settings` (pendiente)

---

## 📝 Notas Técnicas

### Seguridad
- Passwords se envían en texto plano al backend (HTTPS requerido)
- Tokens se almacenan en localStorage (considerar httpOnly cookies)
- Validación tanto en frontend como backend

### Performance
- Validación client-side reduce llamadas al servidor
- Cache: `no-store` para datos frescos
- Proxy para evitar warnings de ngrok

### Testing
- Tests unitarios en `src/app/register/__tests__/`
- Tests de integración en `src/lib/__tests__/`

---

**Última actualización**: 1 de Octubre, 2025  
**Versión**: develop branch  
**API Version**: v1
