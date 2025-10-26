# Debugging Tenant Admin Login Issue

## Problem
Tenant admin is redirecting to `/dashboard` instead of `/tenant-admin`

## How to Debug

### Step 1: Check Browser Console

1. **Open browser DevTools** (F12)
2. **Go to Console tab**
3. **Login with a tenant admin account**
4. **Look for these debug logs:**

```
=== BACKEND RESPONSE DEBUG ===
Full response: { ... }
userType from backend: ???
isTenantAdmin from backend: ???
user object from backend: { ... }
==============================

=== MAPPED USER DEBUG ===
Mapped user: { ... }
user_metadata: { ... }
=========================

=== LOGIN DEBUG ===
Stored user data: "{ ... }"
Parsed user data: { ... }
user_metadata: { ... }
isTenantAdmin: ???
userType: ???
Is tenant admin? false/true
Redirecting to: /dashboard or /tenant-admin
===================
```

### Step 2: Identify the Issue

#### ✅ If you see this (CORRECT):
```javascript
// Backend response
userType from backend: "tenantAdmin"
isTenantAdmin from backend: true

// Mapped user
user_metadata: {
  isTenantAdmin: true,
  userType: "tenantAdmin",
  ...
}

// Final check
Is tenant admin? true
Redirecting to: /tenant-admin
```
**→ Everything is working! Backend is correct.**

---

#### ❌ If you see this (BACKEND PROBLEM):
```javascript
// Backend response
userType from backend: undefined
isTenantAdmin from backend: undefined

// Mapped user
user_metadata: {
  isTenantAdmin: false,  // or undefined
  userType: "user",      // or undefined
  ...
}

// Final check
Is tenant admin? false
Redirecting to: /dashboard
```
**→ BACKEND IS NOT RETURNING THE FLAGS!**

---

## Most Likely Issue: Backend Not Returning Flags

Your backend is probably returning this:
```json
{
  "access_token": "...",
  "refresh_token": "...",
  "user": { ... }
  // ❌ Missing isTenantAdmin
  // ❌ Missing userType
}
```

### What Backend MUST Return for Tenant Admin:

```json
{
  "access_token": "...",
  "refresh_token": "...",
  "expires_in": 3600,
  "token_type": "bearer",
  "user": {
    "id": "456",
    "email": "admin@university.edu",
    "name": "Admin Name",
    "tenantId": 1
  },
  "isTenantAdmin": true,        ← ADD THIS!
  "userType": "tenantAdmin"     ← ADD THIS!
}
```

### What Backend MUST Return for Regular User:

```json
{
  "access_token": "...",
  "refresh_token": "...",
  "expires_in": 3600,
  "token_type": "bearer",
  "user": {
    "id": "123",
    "email": "user@university.edu",
    "name": "User Name",
    "role": "PROFESOR",
    "tenantId": 1
  },
  "isTenantAdmin": false,       ← ADD THIS!
  "userType": "user"            ← ADD THIS!
}
```

---

## Backend Implementation

Your backend needs to:

### 1. Check TenantAdmin Table
```java
Optional<TenantAdmin> tenantAdmin = tenantAdminRepository.findByEmail(email);
if (tenantAdmin.isPresent()) {
    return LoginResponse.builder()
        .accessToken(...)
        .user(...)
        .isTenantAdmin(true)        // ← MUST SET THIS!
        .userType("tenantAdmin")    // ← MUST SET THIS!
        .build();
}
```

### 2. Check User Table
```java
Optional<User> user = userRepository.findByEmail(email);
if (user.isPresent()) {
    return LoginResponse.builder()
        .accessToken(...)
        .user(...)
        .isTenantAdmin(false)       // ← MUST SET THIS!
        .userType("user")           // ← MUST SET THIS!
        .build();
}
```

---

## Quick Test

### Test in Browser Console After Login:

```javascript
// Check what's stored
const user = JSON.parse(localStorage.getItem('flowmatic_user'));
console.log('isTenantAdmin:', user.user_metadata?.isTenantAdmin);
console.log('userType:', user.user_metadata?.userType);

// Should output:
// For tenant admin:
//   isTenantAdmin: true
//   userType: "tenantAdmin"

// For regular user:
//   isTenantAdmin: false
//   userType: "user"
```

---

## API Response Examples

### Check Your Backend's Actual Response

1. **Open Network tab in DevTools**
2. **Login with tenant admin**
3. **Find the request to** `/v1/auth/login`
4. **Check the Response tab**

**What you probably have now (WRONG):**
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "expires_in": 3600,
  "token_type": "bearer",
  "user": {
    "id": "456",
    "email": "admin@university.edu"
  }
}
```

**What you NEED (CORRECT):**
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "expires_in": 3600,
  "token_type": "bearer",
  "user": {
    "id": "456",
    "email": "admin@university.edu"
  },
  "isTenantAdmin": true,      ← ADD THIS
  "userType": "tenantAdmin"   ← ADD THIS
}
```

---

## Summary

**99% chance this is a BACKEND ISSUE.**

The backend is NOT returning:
- ❌ `isTenantAdmin: true`
- ❌ `userType: "tenantAdmin"`

### Fix in Backend:
1. When user is found in **TenantAdmin table** → Set both flags to true/"tenantAdmin"
2. When user is found in **User table** → Set both flags to false/"user"
3. Add these fields to your `LoginResponse` DTO

### After Backend Fix:
The frontend will automatically redirect correctly! No frontend changes needed.

---

## Need More Help?

Check these files:
- `BACKEND_AUTH_INTEGRATION.md` - Full backend implementation guide
- `AUTH_FLOW_DIAGRAM.md` - Visual flow diagram
- `DUAL_TABLE_AUTH_SUMMARY.md` - System overview

**Contact your backend developer and show them `BACKEND_AUTH_INTEGRATION.md`** 📚

