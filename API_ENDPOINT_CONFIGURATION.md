# API Endpoint Configuration

## Overview

The frontend now uses **two different API endpoints** based on the component:

### 🎯 **Architecture**

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────┐      ┌──────────────────────┐       │
│  │  Tenant Admin        │      │  Regular Dashboard   │       │
│  │  Dashboard           │      │  (PROFESOR/ESTUDIANTE)│      │
│  └──────────┬───────────┘      └──────────┬───────────┘       │
│             │                              │                    │
│             │                              │                    │
│    Uses tenant-admin-api.ts       Uses authenticated-api.ts    │
│             │                              │                    │
└─────────────┼──────────────────────────────┼────────────────────┘
              │                              │
              ▼                              ▼
   ┌──────────────────────┐      ┌──────────────────────┐
   │  Java Backend        │      │  Next.js Proxy       │
   │  localhost:8080      │      │  localhost:3000      │
   │  /api/v1/...         │      │  /v1/...             │
   └──────────────────────┘      └──────────┬───────────┘
                                             │
                                             ▼
                                  ┌──────────────────────┐
                                  │  Java Backend        │
                                  │  localhost:8080      │
                                  │  /api/v1/...         │
                                  └──────────────────────┘
```

## 📁 **File Structure**

### **Tenant Admin (Direct to Java Backend)**

**API Client:** `src/lib/tenant-admin-api.ts`
- Base URL: `http://localhost:8080/api/v1`
- Exports: `tenantAdminAuthApi`
- Methods: `get`, `post`, `put`, `patch`, `delete`

**Service:** `src/lib/tenant-admin-service.ts`
- Uses: `tenantAdminAuthApi`
- Endpoints:
  - `/tenant-admin/{tenantAdminId}/dashboard`
  - `/tenant-admin/{tenantAdminId}/users`
  - `/tenant-admin/{tenantAdminId}/users/{userId}`

**Components:**
- `src/components/tenant-admin/TenantAdminDashboard.tsx`
- `src/components/tenant-admin/UserManagement.tsx`
- `src/components/tenant-admin/TenantInfo.tsx`
- `src/components/tenant-admin/TenantKPIs.tsx`
- `src/components/tenant-admin/TenantProjects.tsx`

---

### **Regular Dashboard (Through Next.js Proxy)**

**API Client:** `src/lib/authenticated-api.ts`
- Base URL: `http://localhost:3000/v1`
- Exports: `authApi`
- Methods: `get`, `post`, `put`, `patch`, `delete`

**Hooks:**
- `src/lib/hooks/use-projects.ts`
- `src/lib/hooks/use-tasks.ts`

**Components:**
- `src/components/dashboard/Dashboard.tsx`
- `src/components/dashboard/ProjectsList.tsx`
- `src/components/dashboard/TasksOverview.tsx`
- `src/components/dashboard/Overview.tsx`

---

## 🔧 **Configuration**

### **Tenant Admin API** (`tenant-admin-api.ts`)
```typescript
const url = `http://localhost:8080/api/v1${path}`;
```

**Example Calls:**
```typescript
// Dashboard data
GET http://localhost:8080/api/v1/tenant-admin/1/dashboard

// List users
GET http://localhost:8080/api/v1/tenant-admin/1/users

// Create user
POST http://localhost:8080/api/v1/tenant-admin/1/users
```

### **Regular Dashboard API** (`authenticated-api.ts`)
```typescript
const url = `http://localhost:3000/v1${path}`;
```

**Example Calls:**
```typescript
// User projects (proxied through Next.js)
GET http://localhost:3000/v1/users/123/projects

// Project tasks (proxied through Next.js)
GET http://localhost:3000/v1/projects/456/tasks
```

---

## 🚀 **Usage**

### **Using Tenant Admin API**

```typescript
import { tenantAdminService } from '@/lib/tenant-admin-service';

// Get dashboard data
const dashboard = await tenantAdminService.getDashboardData(tenantAdminId);

// Get users
const users = await tenantAdminService.getUsers(tenantAdminId);

// Create user
const newUser = await tenantAdminService.createUser(tenantAdminId, {
  name: "John Doe",
  mail: "john@example.com",
  rol: "PROFESOR"
});
```

### **Using Regular API**

```typescript
import { authApi } from '@/lib/authenticated-api';

// Get projects
const projects = await authApi.get('/users/123/projects');

// Create project
const project = await authApi.post('/users/123/projects', projectData);
```

---

## 🔒 **Authentication**

Both APIs use the **same JWT token** stored in localStorage:
- Key: `flowmatic_access_token`
- Sent as: `Authorization: Bearer {token}`

The token is obtained during login and works for both APIs.

---

## 🌐 **Environment Configuration**

For production, you can make these configurable:

```typescript
// tenant-admin-api.ts
const TENANT_ADMIN_API_URL = process.env.NEXT_PUBLIC_TENANT_ADMIN_API_URL 
  || 'http://localhost:8080/api/v1';

// authenticated-api.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL 
  || 'http://localhost:3000/v1';
```

**`.env.local`:**
```bash
# Production
NEXT_PUBLIC_TENANT_ADMIN_API_URL=https://api.yourdomain.com/api/v1
NEXT_PUBLIC_API_URL=https://yourapp.com/v1

# Development (defaults)
NEXT_PUBLIC_TENANT_ADMIN_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_API_URL=http://localhost:3000/v1
```

---

## 📊 **Comparison Table**

| Feature | Tenant Admin API | Regular Dashboard API |
|---------|------------------|----------------------|
| **File** | `tenant-admin-api.ts` | `authenticated-api.ts` |
| **Base URL** | `localhost:8080/api/v1` | `localhost:3000/v1` |
| **Purpose** | Direct Java backend access | Proxied through Next.js |
| **Used By** | Tenant admin components | Regular user components |
| **Endpoints** | `/tenant-admin/*` | `/users/*`, `/projects/*` |
| **Auth** | JWT token | JWT token (same) |

---

## ✅ **Benefits of This Setup**

1. **Separation of Concerns**
   - Tenant admin goes directly to backend (no proxy overhead)
   - Regular users go through Next.js proxy (can add middleware if needed)

2. **Flexibility**
   - Easy to add rate limiting on proxy
   - Easy to add request/response transformation
   - Can route to different backend versions if needed

3. **Performance**
   - Tenant admin has direct connection (faster)
   - Can cache differently for different user types

4. **Security**
   - Can apply different security rules at Next.js level
   - Can add additional validation for regular users

---

## 🧪 **Testing**

### **Test Tenant Admin API:**
```bash
# Make sure Java backend is running on port 8080
# Login as tenant admin
# Navigate to /tenant-admin
# Check console for:
[TenantAdminApi] GET http://localhost:8080/api/v1/tenant-admin/1/dashboard
```

### **Test Regular API:**
```bash
# Make sure Next.js is running on port 3000
# Login as regular user
# Navigate to /dashboard
# Check console for:
[AuthenticatedApi] GET http://localhost:3000/v1/users/123/projects
```

---

## 🐛 **Troubleshooting**

### **CORS Issues with Tenant Admin API**

If you get CORS errors on port 8080:

**Java Backend (Spring Boot):**
```java
@Configuration
public class CorsConfig {
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry.addMapping("/api/**")
                    .allowedOrigins("http://localhost:3000")
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                    .allowedHeaders("*")
                    .allowCredentials(true);
            }
        };
    }
}
```

### **Proxy Not Working for Regular Dashboard**

Check `next.config.js` has proxy configured:
```javascript
async rewrites() {
  return [
    {
      source: '/v1/:path*',
      destination: 'http://localhost:8080/api/v1/:path*'
    }
  ];
}
```

---

## 📝 **Summary**

- ✅ **Tenant Admin** → Direct to Java backend (`localhost:8080/api/v1`)
- ✅ **Regular Users** → Through Next.js proxy (`localhost:3000/v1`)
- ✅ Both use same JWT authentication
- ✅ Clean separation of concerns
- ✅ Easy to maintain and extend

🎉 **Configuration Complete!**

