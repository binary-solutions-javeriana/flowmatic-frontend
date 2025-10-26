# Backend Authentication Integration Guide

## Overview

This guide explains how the backend should handle authentication when users can exist in **two separate tables**:
1. **User table** - Regular users (PROFESOR, ESTUDIANTE roles)
2. **TenantAdmin table** - Tenant administrators

## Login Flow

When a user attempts to login with email and password, the backend should:

1. **Check User table first**
   - Query `User` table for matching email/password
   - If found, return user data with appropriate metadata

2. **Check TenantAdmin table if not found in User**
   - Query `TenantAdmin` table for matching email/password
   - If found, return user data with `isTenantAdmin: true`

3. **Return error if not found in either table**
   - Return 401 Unauthorized

## Required Response Format

### For Regular Users (from User table)

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600,
  "token_type": "bearer",
  "user": {
    "id": "123",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "PROFESOR",
    "tenantId": 1,
    "auth_provider_id": "supabase-uuid-here"
  },
  "userType": "user",
  "isTenantAdmin": false
}
```

### For Tenant Admins (from TenantAdmin table)

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600,
  "token_type": "bearer",
  "user": {
    "id": "456",
    "email": "admin@university.edu",
    "name": "Admin User",
    "role": null,
    "tenantId": 1,
    "auth_provider_id": "supabase-uuid-here"
  },
  "userType": "tenantAdmin",
  "isTenantAdmin": true
}
```

## Key Fields Explanation

### Required in All Responses

| Field | Type | Description |
|-------|------|-------------|
| `access_token` | string | JWT access token |
| `refresh_token` | string | JWT refresh token |
| `expires_in` | number | Token expiration in seconds |
| `token_type` | string | Always "bearer" |
| `user.id` | string | User ID (can be number, will be converted) |
| `user.email` | string | User email address |

### Differentiating User Types

| Field | Type | Description | User Table | TenantAdmin Table |
|-------|------|-------------|------------|-------------------|
| `isTenantAdmin` | boolean | **CRITICAL**: Indicates if user is from TenantAdmin table | `false` | `true` |
| `userType` | string | "user" or "tenantAdmin" | `"user"` | `"tenantAdmin"` |
| `user.role` | string | User role (PROFESOR/ESTUDIANTE) | Required | Can be `null` |
| `user.tenantId` | number | Tenant ID the user belongs to | Required | Required |

## Implementation Example (Java/Spring Boot)

```java
@PostMapping("/auth/login")
public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
    // 1. Check User table first
    Optional<User> regularUser = userRepository.findByEmail(request.getEmail());
    if (regularUser.isPresent() && passwordMatches(regularUser.get(), request.getPassword())) {
        return ResponseEntity.ok(createUserLoginResponse(regularUser.get()));
    }
    
    // 2. Check TenantAdmin table
    Optional<TenantAdmin> tenantAdmin = tenantAdminRepository.findByEmail(request.getEmail());
    if (tenantAdmin.isPresent() && passwordMatches(tenantAdmin.get(), request.getPassword())) {
        return ResponseEntity.ok(createTenantAdminLoginResponse(tenantAdmin.get()));
    }
    
    // 3. Neither found - return unauthorized
    throw new UnauthorizedException("Invalid credentials");
}

private LoginResponse createUserLoginResponse(User user) {
    String accessToken = jwtService.generateAccessToken(user);
    String refreshToken = jwtService.generateRefreshToken(user);
    
    return LoginResponse.builder()
        .accessToken(accessToken)
        .refreshToken(refreshToken)
        .expiresIn(3600)
        .tokenType("bearer")
        .user(UserDto.builder()
            .id(String.valueOf(user.getId()))
            .email(user.getEmail())
            .name(user.getName())
            .role(user.getRole())
            .tenantId(user.getTenantId())
            .authProviderId(user.getAuthProviderId())
            .build())
        .userType("user")
        .isTenantAdmin(false)
        .build();
}

private LoginResponse createTenantAdminLoginResponse(TenantAdmin admin) {
    String accessToken = jwtService.generateAccessToken(admin);
    String refreshToken = jwtService.generateRefreshToken(admin);
    
    return LoginResponse.builder()
        .accessToken(accessToken)
        .refreshToken(refreshToken)
        .expiresIn(3600)
        .tokenType("bearer")
        .user(UserDto.builder()
            .id(String.valueOf(admin.getId()))
            .email(admin.getEmail())
            .name(admin.getName())
            .role(null) // Tenant admins don't have roles
            .tenantId(admin.getTenantId())
            .authProviderId(admin.getAuthProviderId())
            .build())
        .userType("tenantAdmin")
        .isTenantAdmin(true)  // CRITICAL: Must be true!
        .build();
}
```

## Frontend Behavior

Based on the response:

1. **If `isTenantAdmin: true`** → Redirects to `/tenant-admin`
2. **If `isTenantAdmin: false`** → Redirects to `/dashboard`

The frontend checks the following fields to determine user type (in order of priority):
1. `isTenantAdmin` boolean flag
2. `userType === 'tenantAdmin'`
3. Checks `user.user_metadata.isTenantAdmin`
4. Checks `user.user_metadata.userType === 'tenantAdmin'`

## Testing Checklist

### Test Regular User Login
- [ ] User exists in User table
- [ ] Login returns `isTenantAdmin: false`
- [ ] Login returns `userType: "user"`
- [ ] User has valid `role` (PROFESOR or ESTUDIANTE)
- [ ] Frontend redirects to `/dashboard`

### Test Tenant Admin Login
- [ ] Admin exists in TenantAdmin table
- [ ] Login returns `isTenantAdmin: true`
- [ ] Login returns `userType: "tenantAdmin"`
- [ ] Frontend redirects to `/tenant-admin`

### Test Edge Cases
- [ ] User doesn't exist in either table → 401 error
- [ ] Wrong password → 401 error
- [ ] Email exists in both tables (edge case - decide priority)

## Common Issues

### Issue: Tenant Admin redirected to regular dashboard
**Cause:** Backend not setting `isTenantAdmin: true`
**Fix:** Ensure the field is explicitly set in the response

### Issue: User not found in either table but no error
**Cause:** Backend not returning 401 status
**Fix:** Return proper HTTP status code and error message

### Issue: Frontend showing wrong dashboard
**Cause:** Backend returning inconsistent `userType` and `isTenantAdmin` values
**Fix:** Ensure both fields match (if `isTenantAdmin: true`, then `userType: "tenantAdmin"`)

## Database Schema Considerations

### User Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50), -- 'PROFESOR' or 'ESTUDIANTE'
    tenant_id INTEGER REFERENCES tenants(id),
    auth_provider_id UUID,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

### TenantAdmin Table
```sql
CREATE TABLE tenant_admins (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    tenant_id INTEGER REFERENCES tenants(id),
    auth_provider_id UUID,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

## API Endpoint Summary

### POST /v1/auth/login

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (Success - Regular User):**
```json
{
  "access_token": "...",
  "refresh_token": "...",
  "expires_in": 3600,
  "token_type": "bearer",
  "user": { ... },
  "userType": "user",
  "isTenantAdmin": false
}
```

**Response (Success - Tenant Admin):**
```json
{
  "access_token": "...",
  "refresh_token": "...",
  "expires_in": 3600,
  "token_type": "bearer",
  "user": { ... },
  "userType": "tenantAdmin",
  "isTenantAdmin": true
}
```

**Response (Error):**
```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "path": "/v1/auth/login",
  "method": "POST",
  "timestamp": "2025-10-25T12:00:00Z",
  "requestId": "abc-123"
}
```

## Questions?

If you have questions about this integration, check:
- `src/lib/auth-types.ts` - TypeScript type definitions
- `src/lib/http-auth-service.ts` - Frontend auth service implementation
- `src/lib/auth-redirect.ts` - User type detection logic
- `src/app/login/LoginForm.tsx` - Login form with redirect logic

The frontend is ready to handle both user types. The backend just needs to:
1. Check both tables
2. Set `isTenantAdmin` correctly
3. Return the proper response format

