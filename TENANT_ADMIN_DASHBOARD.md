# Tenant Admin Dashboard

A comprehensive dashboard for tenant administrators to manage users, view projects, and monitor KPIs within their organization.

## Overview

The Tenant Admin Dashboard provides a role-based interface for users with the "TenantAdmin" role to:
- View tenant information and statistics
- Monitor key performance indicators (KPIs)
- Perform CRUD operations on tenant users
- View all projects within the tenant
- Access tenant settings

## File Structure

```
src/
├── components/
│   └── tenant-admin/
│       ├── TenantAdminDashboard.tsx  # Main dashboard component
│       ├── TenantInfo.tsx            # Displays tenant information
│       ├── TenantKPIs.tsx            # Displays KPI metrics
│       ├── UserManagement.tsx        # CRUD operations for users
│       ├── TenantProjects.tsx        # Lists all tenant projects
│       └── index.ts                  # Barrel export
├── lib/
│   ├── tenant-admin-service.ts       # API service layer
│   ├── hooks/
│   │   └── use-tenant-admin.ts       # Custom React hooks
│   └── types/
│       └── tenant-admin-types.ts     # TypeScript interfaces
└── app/
    └── tenant-admin/
        └── page.tsx                  # Next.js page route
```

## Components

### TenantAdminDashboard

Main orchestrator component that manages the dashboard layout and navigation.

**Props:**
- `tenantAdminId: number` - The ID of the tenant administrator

**Features:**
- Sidebar navigation with 4 views: Overview, Users, Projects, Settings
- Responsive layout with collapsible sidebar
- Loading and error states
- Auto-refresh capability

### TenantInfo

Displays read-only tenant information.

**Props:**
- `tenant: TenantDto` - Tenant data object

**Displays:**
- University/Organization name
- Tenant ID
- Creation date
- Last updated date

### TenantKPIs

Shows key performance indicators in an attractive card layout.

**Props:**
- `kpis: TenantKpiDto` - KPI metrics
- `totalUsers: number` - Total number of users
- `totalProjects: number` - Total number of projects

**Metrics Displayed:**
- Total Users
- Total Projects
- Active Projects
- Completed Tasks
- User Engagement (%)
- Project Completion Rate (%)

### UserManagement

Full CRUD interface for managing tenant users.

**Props:**
- `tenantAdminId: number` - The ID of the tenant administrator

**Features:**
- View all users in a table
- Search/filter users by name or email
- Create new users with modal form
- Edit existing users
- Delete/deactivate users
- Real-time status indicators (Active/Inactive)
- Role badges (PROFESOR/ESTUDIANTE)

**User Fields:**
- Name (required)
- Email (required)
- Role (PROFESOR or ESTUDIANTE)
- Status (Active/Inactive)

### TenantProjects

Displays all projects within the tenant in a grid layout.

**Props:**
- `projects: ProjectSummaryDto[]` - Array of project summaries

**Project Information:**
- Project name and status
- Task progress (completed/total)
- Start and end dates
- Visual progress bar
- Status color coding

## API Integration

### Endpoints Used

Based on the OpenAPI specification:

#### Dashboard Data
```
GET /tenant-admin/{tenantAdminId}/dashboard
```
Returns comprehensive dashboard data including tenant info, KPIs, and recent projects.

#### User Management
```
GET    /tenant-admin/{tenantAdminId}/users
POST   /tenant-admin/{tenantAdminId}/users
GET    /tenant-admin/{tenantAdminId}/users/{userId}
PUT    /tenant-admin/{tenantAdminId}/users/{userId}
DELETE /tenant-admin/{tenantAdminId}/users/{userId}
```

### Service Layer

The `TenantAdminService` class in `tenant-admin-service.ts` provides methods for all API interactions:

```typescript
// Get dashboard data
await tenantAdminService.getDashboardData(tenantAdminId);

// User operations
await tenantAdminService.getUsers(tenantAdminId);
await tenantAdminService.createUser(tenantAdminId, userData);
await tenantAdminService.updateUser(tenantAdminId, userId, userData);
await tenantAdminService.deleteUser(tenantAdminId, userId);
```

## Custom Hooks

### useTenantAdminDashboard

Manages dashboard data fetching and state.

```typescript
const { data, loading, error, refresh } = useTenantAdminDashboard(tenantAdminId);
```

**Returns:**
- `data: TenantDashboardResponse | null` - Dashboard data
- `loading: boolean` - Loading state
- `error: string | null` - Error message if any
- `refresh: () => Promise<void>` - Function to reload data

### useTenantUsers

Manages user CRUD operations with optimistic updates.

```typescript
const {
  users,
  loading,
  error,
  refresh,
  createUser,
  updateUser,
  deleteUser
} = useTenantUsers(tenantAdminId);
```

**Returns:**
- `users: UserResponse[]` - List of users
- `loading: boolean` - Loading state
- `error: string | null` - Error message if any
- `refresh: () => Promise<void>` - Reload users
- `createUser: (data) => Promise<UserResponse>` - Create user
- `updateUser: (id, data) => Promise<UserResponse>` - Update user
- `deleteUser: (id) => Promise<void>` - Delete user

## Usage

### 1. Accessing the Dashboard

Navigate to `/tenant-admin` in your application. The page is protected by `ProtectedRoute` component.

### 2. Authentication

The dashboard requires the user to have the "TenantAdmin" role. You'll need to:

1. Update `src/app/tenant-admin/page.tsx` to get the actual `tenantAdminId` from your auth context:

```typescript
// Example with auth context
const { user } = useAuth();
const tenantAdminId = user?.id;

// Or from session storage
const tenantAdminId = Number(sessionStorage.getItem('userId'));
```

2. Add role checking in your `ProtectedRoute` component or create a new `TenantAdminRoute` component:

```typescript
const TenantAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  
  if (!user || user.role !== 'TenantAdmin') {
    return <Navigate to="/unauthorized" />;
  }
  
  return <>{children}</>;
};
```

### 3. Integrating with Existing Auth

Update your authentication flow to include the tenant admin role check:

```typescript
// In your auth service
export interface User {
  id: number;
  email: string;
  name: string;
  role: 'TenantAdmin' | 'PROFESOR' | 'ESTUDIANTE';
  tenantId: number;
}

// When redirecting after login
if (user.role === 'TenantAdmin') {
  router.push('/tenant-admin');
} else {
  router.push('/dashboard');
}
```

## Styling

The dashboard uses the existing Flowmatic design system:

- **Primary Color:** `#14a67e` (Green)
- **Secondary Color:** `#9fdbc2` (Light Green)
- **Dark Color:** `#0c272d` (Dark Blue)
- **Gradients:** Various green gradients for visual appeal
- **Animations:** Smooth transitions and hover effects
- **Responsive:** Mobile-first design with Tailwind CSS

## Future Enhancements

Potential features to add:

1. **Settings Page:**
   - Edit tenant information
   - Configure tenant preferences
   - Manage integrations

2. **Enhanced Project View:**
   - Filter and sort projects
   - Drill down into project details
   - Export project data

3. **Analytics:**
   - Charts and graphs for KPIs
   - Historical data trends
   - Custom reports

4. **Notifications:**
   - Real-time updates
   - Email notifications
   - Activity feed

5. **Bulk Operations:**
   - Import users from CSV
   - Bulk user actions
   - Export user data

## Testing

To test the dashboard:

1. **Mock Data:** Create mock responses in your development environment
2. **API Testing:** Use tools like Postman to verify API endpoints
3. **Role Testing:** Test with different user roles to ensure proper access control
4. **Responsive Testing:** Test on various screen sizes

## Troubleshooting

### Common Issues

**Issue: "Authentication required" error**
- Ensure the user is logged in
- Check that auth token is valid
- Verify API proxy is configured correctly

**Issue: "Failed to load dashboard data"**
- Check network tab for API errors
- Verify backend is running
- Confirm tenantAdminId is correct

**Issue: Users not displaying**
- Check API response format matches TypeScript types
- Verify tenant has users
- Look for console errors

**Issue: CORS errors**
- Ensure backend CORS is configured
- Check API_CONFIG in your environment
- Verify proxy configuration

## API Response Examples

### Dashboard Response
```json
{
  "tenantInfo": {
    "tenantId": 1,
    "universityName": "Example University",
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-10-25T00:00:00Z"
  },
  "totalUsers": 150,
  "totalProjects": 45,
  "kpis": {
    "activeProjects": 30,
    "completedTasks": 456,
    "userEngagement": 78.5,
    "projectCompletionRate": 65.2
  },
  "recentProjects": [...]
}
```

### User Response
```json
{
  "userId": 1,
  "name": "John Doe",
  "mail": "john.doe@example.com",
  "rol": "PROFESOR",
  "isActive": true,
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-10-25T00:00:00Z"
}
```

## License

Part of the Flowmatic project management system.

