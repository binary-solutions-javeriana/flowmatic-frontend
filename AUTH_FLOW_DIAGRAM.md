# Authentication Flow Diagram

## Visual Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USER LOGIN ATTEMPT                          │
│                    (email: user@example.com)                        │
└─────────────────────────┬───────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      BACKEND AUTHENTICATION                          │
│                                                                      │
│  Step 1: Check User Table                                          │
│  ┌───────────────────────────────────────────┐                     │
│  │ SELECT * FROM users                        │                     │
│  │ WHERE email = 'user@example.com'          │                     │
│  │ AND password_hash = hash(password)        │                     │
│  └─────────────────┬─────────────────────────┘                     │
│                    │                                                 │
│         ┌──────────┴──────────┐                                    │
│         │                     │                                     │
│      FOUND?                NOT FOUND                                │
│         │                     │                                     │
│         ▼                     ▼                                     │
│  ┌─────────────┐      Step 2: Check TenantAdmin Table            │
│  │   Return    │      ┌────────────────────────────────┐          │
│  │   User      │      │ SELECT * FROM tenant_admins    │          │
│  │   Data      │      │ WHERE email = 'user@example.com'│         │
│  └──────┬──────┘      │ AND password_hash = hash(pwd)  │          │
│         │             └──────────┬─────────────────────┘          │
│         │                        │                                 │
│         │             ┌──────────┴──────────┐                     │
│         │             │                     │                     │
│         │          FOUND?              NOT FOUND                  │
│         │             │                     │                     │
│         │             ▼                     ▼                     │
│         │      ┌──────────────┐    ┌─────────────┐              │
│         │      │   Return     │    │   Return    │              │
│         │      │ TenantAdmin  │    │ 401 Error   │              │
│         │      │    Data      │    └─────────────┘              │
│         │      └──────┬───────┘                                   │
│         │             │                                            │
└─────────┼─────────────┼────────────────────────────────────────────┘
          │             │
          │             │
    ┌─────▼─────┐  ┌───▼──────┐
    │  Regular  │  │  Tenant  │
    │   User    │  │  Admin   │
    │  Response │  │ Response │
    └─────┬─────┘  └────┬─────┘
          │             │
┌─────────▼─────────────▼─────────────────────────────────────────────┐
│                      FRONTEND PROCESSING                             │
└──────────────────────────────────────────────────────────────────────┘
          │             │
          │             │
    ┌─────▼──────────┐  │
    │ User Response  │  │
    │ {              │  │
    │   user: {...}, │  │
    │   isTenantAdmin: false,
    │   userType: "user"
    │ }              │  │
    └────────┬───────┘  │
             │          │
             │          │    ┌──────────────────┐
             │          └───▶│ Admin Response   │
             │               │ {                │
             │               │   user: {...},   │
             │               │   isTenantAdmin: true,
             │               │   userType: "tenantAdmin"
             │               │ }                │
             │               └────────┬─────────┘
             │                        │
             │                        │
┌────────────▼────────────────────────▼─────────────────────────────┐
│                   STORE IN LOCALSTORAGE                            │
│                localStorage.setItem('flowmatic_user', user)         │
└────────────────────────────────┬───────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        REDIRECT LOGIC                                │
│                                                                      │
│  Check: user.user_metadata.isTenantAdmin                           │
│  Check: user.user_metadata.userType                                │
│                                                                      │
│        ┌────────────────┬────────────────┐                         │
│        │                │                │                         │
│   isTenantAdmin    isTenantAdmin    else │                         │
│   === true         === false             │                         │
│        │                │                │                         │
└────────┼────────────────┼────────────────┼─────────────────────────┘
         │                │                │
         │                │                │
         ▼                ▼                ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│   Redirect  │  │   Redirect  │  │   Redirect  │
│     to      │  │     to      │  │     to      │
│  /tenant-   │  │ /dashboard  │  │  /login     │
│   admin     │  │             │  │             │
└─────────────┘  └─────────────┘  └─────────────┘
       │                │
       │                │
       ▼                ▼
┌─────────────┐  ┌─────────────┐
│   Tenant    │  │   Regular   │
│   Admin     │  │    User     │
│  Dashboard  │  │  Dashboard  │
│             │  │             │
│  Features:  │  │  Features:  │
│  • KPIs     │  │  • Projects │
│  • Users    │  │  • Tasks    │
│  • Projects │  │  • Settings │
│  • Tenant   │  │             │
│    Info     │  │             │
└─────────────┘  └─────────────┘
```

## Response Format Comparison

### Regular User (from User table)
```json
{
  "access_token": "...",
  "user": {
    "id": "123",
    "email": "profesor@university.edu",
    "role": "PROFESOR",
    "tenantId": 1
  },
  "isTenantAdmin": false,     ← Frontend checks this
  "userType": "user"           ← And this
}
```
**Result:** Redirects to `/dashboard`

---

### Tenant Admin (from TenantAdmin table)
```json
{
  "access_token": "...",
  "user": {
    "id": "456",
    "email": "admin@university.edu",
    "role": null,
    "tenantId": 1
  },
  "isTenantAdmin": true,       ← Frontend checks this
  "userType": "tenantAdmin"    ← And this
}
```
**Result:** Redirects to `/tenant-admin`

## Database Schema

```sql
-- Regular Users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    name VARCHAR(255),
    role VARCHAR(50),           -- 'PROFESOR' or 'ESTUDIANTE'
    tenant_id INTEGER,
    created_at TIMESTAMP
);

-- Tenant Administrators
CREATE TABLE tenant_admins (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    name VARCHAR(255),
    tenant_id INTEGER,          -- Which tenant they manage
    created_at TIMESTAMP
);
```

## Route Protection

```
┌─────────────────────────────────────────────────────────────┐
│                    ROUTE ACCESS MATRIX                      │
├──────────────────┬─────────────┬─────────────┬─────────────┤
│ Route            │ TenantAdmin │ PROFESOR    │ ESTUDIANTE  │
├──────────────────┼─────────────┼─────────────┼─────────────┤
│ /dashboard       │ ❌ Redirect │ ✅ Allow    │ ✅ Allow    │
│ /tenant-admin    │ ✅ Allow    │ ❌ Redirect │ ❌ Redirect │
│ /login           │ ✅ Allow    │ ✅ Allow    │ ✅ Allow    │
│ /register        │ ✅ Allow    │ ✅ Allow    │ ✅ Allow    │
└──────────────────┴─────────────┴─────────────┴─────────────┘
```

## Code Flow

### 1. Login Form Submission
```typescript
// src/app/login/LoginForm.tsx
await login(email, password);
↓
redirectToDashboard(router);
```

### 2. Auth Service
```typescript
// src/lib/http-auth-service.ts
const response = await fetch('/v1/auth/login', {...});
const data = await response.json();
↓
mapUser(data.user, data.userType, data.isTenantAdmin);
```

### 3. User Mapping
```typescript
// Stores in user_metadata
{
  user_metadata: {
    userType: 'tenantAdmin',
    isTenantAdmin: true,
    ...
  }
}
```

### 4. Redirect Logic
```typescript
// src/lib/auth-redirect.ts
if (isTenantAdmin()) {
  return '/tenant-admin';
} else {
  return '/dashboard';
}
```

### 5. Route Protection
```typescript
// src/components/RoleBasedRoute.tsx
const userRole = getUserRole();  // 'TenantAdmin', 'PROFESOR', etc.
if (!allowedRoles.includes(userRole)) {
  redirect('/unauthorized');
}
```

## Key Points

1. **Backend checks both tables** sequentially
2. **Backend sets `isTenantAdmin` flag** based on which table found user
3. **Frontend stores user data** in localStorage
4. **Frontend checks flags** to determine routing
5. **Route protection** ensures users can't access wrong dashboards

## Testing Checklist

- [ ] Regular user logs in → Goes to `/dashboard`
- [ ] Tenant admin logs in → Goes to `/tenant-admin`
- [ ] Regular user can't access `/tenant-admin`
- [ ] Tenant admin can't access `/dashboard` (optional)
- [ ] Invalid credentials → 401 error
- [ ] Token refresh works for both types
- [ ] Logout clears localStorage
- [ ] Protected routes redirect unauthorized users

## Files Involved

| File | Purpose |
|------|---------|
| `src/lib/auth-types.ts` | TypeScript definitions |
| `src/lib/http-auth-service.ts` | API calls & response mapping |
| `src/lib/auth-redirect.ts` | Routing utilities |
| `src/app/login/LoginForm.tsx` | Login form with redirect |
| `src/components/RoleBasedRoute.tsx` | Route protection |
| `src/app/tenant-admin/page.tsx` | Admin dashboard page |

---

**Summary:** The system checks two tables, returns appropriate flags, and the frontend redirects users to the correct dashboard based on those flags. Simple! 🎯

