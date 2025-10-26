# Verify API Setup

## ✅ Quick Verification Checklist

After making the changes, verify both APIs are working correctly:

### **1. Check Console Logs After Login**

When you login, you should see different API calls based on user type:

#### **Tenant Admin Login** → Redirects to `/tenant-admin`
Console should show:
```
[TenantAdminApi] GET http://localhost:8080/api/v1/tenant-admin/1/dashboard
```

#### **Regular User Login** → Redirects to `/dashboard`
Console should show:
```
[AuthenticatedApi] GET http://localhost:3000/v1/users/123/projects
```

---

### **2. Browser Network Tab**

#### **For Tenant Admin:**
1. Open DevTools → Network tab
2. Navigate to `/tenant-admin`
3. Look for requests to: `localhost:8080`
4. Should see: `GET http://localhost:8080/api/v1/tenant-admin/1/dashboard`

#### **For Regular User:**
1. Open DevTools → Network tab
2. Navigate to `/dashboard`
3. Look for requests to: `localhost:3000`
4. Should see: `GET http://localhost:3000/v1/users/123/projects`

---

### **3. File Check**

Verify the files were created/updated:

```bash
# New file for tenant admin API
✅ src/lib/tenant-admin-api.ts

# Updated to use new API
✅ src/lib/tenant-admin-service.ts

# Should still use localhost:3000
✅ src/lib/authenticated-api.ts (unchanged - still uses localhost:3000)
```

---

### **4. Code Verification**

#### **Check tenant-admin-service.ts:**
```typescript
// Should import tenantAdminAuthApi
import { tenantAdminAuthApi } from './tenant-admin-api';

// Should use tenantAdminAuthApi.get()
async getDashboardData(tenantAdminId: number) {
  return tenantAdminAuthApi.get(`/tenant-admin/${tenantAdminId}/dashboard`);
}
```

#### **Check authenticated-api.ts:**
```typescript
// Should still point to localhost:3000
const url = `http://localhost:3000/v1${path}`;
```

#### **Check tenant-admin-api.ts:**
```typescript
// Should point to localhost:8080
const url = `http://localhost:8080/api/v1${path}`;
```

---

### **5. Test Both Dashboards**

#### **Test Tenant Admin:**
```bash
1. Login as tenant admin
2. Should redirect to /tenant-admin
3. Dashboard should load successfully
4. Console shows: [TenantAdminApi] GET http://localhost:8080/...
5. No errors in console
```

#### **Test Regular User:**
```bash
1. Login as regular user (PROFESOR/ESTUDIANTE)
2. Should redirect to /dashboard
3. Dashboard should load successfully
4. Console shows: [AuthenticatedApi] GET http://localhost:3000/...
5. No errors in console
```

---

### **6. Backend Requirements**

Make sure your Java backend is running and accessible:

```bash
# Check Java backend is running
curl http://localhost:8080/api/v1/health

# Should return 200 OK with health status
```

If CORS errors occur, add CORS configuration to your Java backend (see API_ENDPOINT_CONFIGURATION.md).

---

## 🔍 **Expected Console Output Examples**

### **When Tenant Admin Loads Dashboard:**
```
=== BACKEND RESPONSE DEBUG ===
userType from backend: "tenantAdmin"
isTenantAdmin from backend: true
==============================

[Login] User already authenticated, redirecting...
[isTenantAdmin] Checking user: { hasMetadata: true, isTenantAdmin: true, userType: "tenantAdmin", result: true }
Redirecting to: /tenant-admin

[TenantAdminApi] GET http://localhost:8080/api/v1/tenant-admin/1/dashboard
```

### **When Regular User Loads Dashboard:**
```
[Login] User already authenticated, redirecting...
[isTenantAdmin] Checking user: { hasMetadata: true, isTenantAdmin: false, userType: "user", result: false }
Redirecting to: /dashboard

[AuthenticatedApi] GET http://localhost:3000/v1/users/123/projects
```

---

## ❌ **Common Issues**

### **Issue: Both dashboards call localhost:3000**
**Cause:** `tenant-admin-service.ts` not updated to use `tenantAdminAuthApi`
**Fix:** Check import and ensure using `tenantAdminAuthApi` not `authApi`

### **Issue: CORS error on localhost:8080**
**Cause:** Java backend doesn't allow requests from localhost:3000
**Fix:** Add CORS configuration in Java backend

### **Issue: 404 on tenant admin endpoints**
**Cause:** Java backend `/tenant-admin` endpoints not implemented
**Fix:** Implement endpoints according to OpenAPI spec

### **Issue: Regular dashboard broken**
**Cause:** Accidentally modified `authenticated-api.ts`
**Fix:** Ensure `authenticated-api.ts` still uses `localhost:3000/v1`

---

## 🎯 **Success Criteria**

- ✅ Tenant admin calls go to `localhost:8080/api/v1/tenant-admin/...`
- ✅ Regular user calls go to `localhost:3000/v1/users/...`
- ✅ Both dashboards load without errors
- ✅ Console logs show correct API endpoints
- ✅ No CORS errors
- ✅ Authentication works for both

---

## 📊 **Quick Test Script**

Run in browser console after login:

```javascript
// Check stored user
const user = JSON.parse(localStorage.getItem('flowmatic_user'));
console.log('User type:', user.user_metadata?.userType);
console.log('Is tenant admin:', user.user_metadata?.isTenantAdmin);

// Expected output for tenant admin:
// User type: "tenantAdmin"
// Is tenant admin: true

// Expected output for regular user:
// User type: "user" (or undefined)
// Is tenant admin: false (or undefined)
```

---

## 🚀 **All Set!**

If all checks pass, your API setup is correct and working! 

Both APIs are now properly separated:
- Tenant Admin → Direct to Java backend
- Regular Users → Through Next.js proxy

