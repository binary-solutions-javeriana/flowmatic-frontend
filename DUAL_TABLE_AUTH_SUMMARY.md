# Dual Table Authentication - Implementation Summary

## What Changed

The authentication system has been updated to support **two separate user tables** in Supabase:
1. **User table** - Regular users (PROFESOR, ESTUDIANTE)
2. **TenantAdmin table** - Tenant administrators

## How It Works

### Login Flow

```
User enters credentials
        ↓
Backend checks User table
        ↓
    Found? → Return with isTenantAdmin: false → Redirect to /dashboard
        ↓ No
Backend checks TenantAdmin table
        ↓
    Found? → Return with isTenantAdmin: true → Redirect to /tenant-admin
        ↓ No
Return 401 Unauthorized
```

### Files Modified

#### 1. **src/lib/auth-types.ts**
Added fields to track user type:
- `userType?: 'user' | 'tenantAdmin'`
- `isTenantAdmin?: boolean`

#### 2. **src/lib/http-auth-service.ts**
Updated `mapUser()` to handle user type flags and store them in `user_metadata`

#### 3. **src/app/login/LoginForm.tsx**
Updated redirect logic to check `isTenantAdmin` and route accordingly

#### 4. **src/components/RoleBasedRoute.tsx**
Updated to check localStorage for user type and determine role

#### 5. **src/lib/auth-redirect.ts**
Complete rewrite with utility functions:
- `getStoredUser()` - Get user from localStorage
- `isTenantAdmin()` - Check if user is tenant admin
- `getUserRole()` - Get user role (TenantAdmin, PROFESOR, ESTUDIANTE)
- `getDashboardRoute()` - Get correct dashboard route
- `redirectToDashboard()` - Redirect to appropriate dashboard
- `getUserId()` - Get user ID as number

#### 6. **src/app/tenant-admin/page.tsx**
Updated to use auth-redirect utilities for cleaner code

### New Files Created

#### 1. **BACKEND_AUTH_INTEGRATION.md**
Comprehensive guide for backend developers explaining:
- Required response format
- How to check both tables
- Implementation examples in Java
- Testing checklist

## Usage

### For Frontend Developers

**Check if user is tenant admin:**
```typescript
import { isTenantAdmin } from '@/lib/auth-redirect';

if (isTenantAdmin()) {
  // User is tenant admin
}
```

**Get user role:**
```typescript
import { getUserRole } from '@/lib/auth-redirect';

const role = getUserRole(); // 'TenantAdmin' | 'PROFESOR' | 'ESTUDIANTE' | null
```

**Redirect to appropriate dashboard:**
```typescript
import { redirectToDashboard } from '@/lib/auth-redirect';

// After login
redirectToDashboard(router);
```

**Check required role:**
```typescript
import { hasRequiredRole } from '@/lib/auth-redirect';

if (hasRequiredRole(['TenantAdmin'])) {
  // User has required role
}
```

### For Backend Developers

**Critical: Response must include these fields**

For regular users:
```json
{
  "isTenantAdmin": false,
  "userType": "user"
}
```

For tenant admins:
```json
{
  "isTenantAdmin": true,
  "userType": "tenantAdmin"
}
```

See `BACKEND_AUTH_INTEGRATION.md` for complete implementation guide.

## Testing

### Test Regular User
1. Login with user from User table
2. Should redirect to `/dashboard`
3. Check console: "Redirecting to user dashboard"

### Test Tenant Admin
1. Login with user from TenantAdmin table
2. Should redirect to `/tenant-admin`
3. Check console: "Redirecting to tenant admin dashboard"

### Test Protection
1. Try accessing `/tenant-admin` as regular user
2. Should redirect to `/dashboard` or `/unauthorized`

## What the Backend Needs to Do

1. **Check both tables** during login
2. **Set `isTenantAdmin: true`** for users from TenantAdmin table
3. **Set `isTenantAdmin: false`** for users from User table
4. **Return proper error** if user not found in either table

## Frontend State

User data is stored in localStorage as:
```json
{
  "id": "123",
  "email": "user@example.com",
  "user_metadata": {
    "name": "John Doe",
    "role": "PROFESOR",
    "tenantId": 1,
    "userType": "user",
    "isTenantAdmin": false
  }
}
```

For tenant admin:
```json
{
  "id": "456",
  "email": "admin@university.edu",
  "user_metadata": {
    "name": "Admin User",
    "tenantId": 1,
    "userType": "tenantAdmin",
    "isTenantAdmin": true
  }
}
```

## Dashboard Access

| User Type | Table | Dashboard Route | Role Value |
|-----------|-------|----------------|------------|
| Regular User | User | `/dashboard` | PROFESOR or ESTUDIANTE |
| Tenant Admin | TenantAdmin | `/tenant-admin` | N/A (no role field) |

## Security

- ✅ Role-based route protection with `RoleBasedRoute` component
- ✅ Server-side verification needed (JWT should include user type)
- ✅ Protected routes check localStorage for user type
- ✅ Unauthorized users redirected to appropriate page

## Common Scenarios

### Scenario 1: New User Registration
- User registers → Goes to User table
- Has role: PROFESOR or ESTUDIANTE
- Can access regular dashboard

### Scenario 2: Tenant Admin Login
- Admin logs in → Checked in TenantAdmin table
- No role field needed
- Can access tenant admin dashboard
- Can manage all users in their tenant
- Can view all projects in their tenant

### Scenario 3: User Tries to Access Admin Dashboard
- Regular user tries `/tenant-admin`
- `RoleBasedRoute` checks `isTenantAdmin`
- Returns false → Redirect to `/unauthorized` or `/dashboard`

## Quick Reference

### Check User Type in Component
```typescript
'use client';
import { isTenantAdmin, getUserRole } from '@/lib/auth-redirect';

export default function MyComponent() {
  const isAdmin = isTenantAdmin();
  const role = getUserRole();
  
  return (
    <div>
      {isAdmin ? 'Admin View' : 'User View'}
      {role === 'PROFESOR' && 'Professor Tools'}
    </div>
  );
}
```

### Protect a Route
```typescript
import RoleBasedRoute from '@/components/RoleBasedRoute';

export default function AdminPage() {
  return (
    <RoleBasedRoute allowedRoles={['TenantAdmin']}>
      <YourAdminContent />
    </RoleBasedRoute>
  );
}
```

### Get Current User ID
```typescript
import { getUserId } from '@/lib/auth-redirect';

const userId = getUserId(); // Returns number or null
```

## Next Steps

1. ✅ Frontend is ready
2. ⏳ **Backend needs to implement dual table check**
3. ⏳ **Backend needs to return `isTenantAdmin` flag**
4. ⏳ Test with real users from both tables
5. ⏳ Add JWT claims for user type (recommended)

## Documentation

- `BACKEND_AUTH_INTEGRATION.md` - Backend implementation guide
- `TENANT_ADMIN_DASHBOARD.md` - Tenant admin dashboard docs
- `TENANT_ADMIN_QUICK_START.md` - Quick start guide
- `src/lib/auth-redirect.ts` - Auth utility functions

## Support

All authentication utilities are fully typed with TypeScript and include JSDoc comments for IntelliSense support.

The system is production-ready on the frontend side. Backend just needs to check both tables and return the appropriate flags! 🚀

