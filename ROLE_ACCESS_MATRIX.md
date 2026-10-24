# SocioTrack - Role-Based Access Control Matrix

## 🎭 Roles Overview

### Three Roles
1. **Resident** - Society members who create complaints
2. **Technician** - Service providers who resolve complaints
3. **Admin** - Management who oversee operations

---

## 🔐 Authentication Endpoints

**Base Path:** `/api/auth`

| Endpoint | Method | Resident | Technician | Admin | Auth Required | Notes |
|----------|--------|----------|------------|-------|---------------|-------|
| `/register` | POST | ✅ | ✅ | ✅ | No | Public registration |
| `/login` | POST | ✅ | ✅ | ✅ | No | Public login |
| `/me` | GET | ✅ | ✅ | ✅ | Yes | Get current user |
| `/logout` | POST | ✅ | ✅ | ✅ | Yes | Logout current user |
| `/refresh-token` | POST | ✅ | ✅ | ✅ | Yes | Refresh JWT token |

**Implementation Status:** ✅ Controller created, ⚠️ Routes not mounted

**Security Checks:**
- [x] Password hashing with bcrypt
- [x] JWT token generation
- [x] Token expiry handling
- [x] Refresh token mechanism
- [x] Last login tracking

---

## 🎫 Complaint Endpoints

**Base Path:** `/api/complaints`

### GET /api/complaints - List All Complaints

| Role | Access | Filter Applied | Implementation |
|------|--------|----------------|----------------|
| Resident | ✅ Own only | `createdBy: userId` | ✅ In controller |
| Technician | ✅ Assigned only | `technician: userId` | ✅ In controller |
| Admin | ✅ All | No filter | ✅ In controller |

**Query Parameters:**
- `page`, `limit` - Pagination
- `status` - Filter by status
- `category` - Filter by category
- `priority` - Filter by priority
- `sortBy`, `sortOrder` - Sorting

**Returns:** 403 if trying to access others' complaints

### GET /api/complaints/:id - Get Single Complaint

| Role | Access | Validation | Implementation |
|------|--------|------------|----------------|
| Resident | ✅ Own only | `complaint.createdBy === userId` | ✅ In controller |
| Technician | ✅ Assigned only | `complaint.technician === userId` | ✅ In controller |
| Admin | ✅ All | No restriction | ✅ In controller |

**Returns:** 
- 404 if complaint not found
- 403 if access denied

### POST /api/complaints - Create New Complaint

| Role | Access | Validation | Implementation |
|------|--------|------------|----------------|
| Resident | ✅ Can create | Sets `createdBy: userId` | ✅ In controller |
| Technician | ❌ Cannot | Should return 403 | ⚠️ Need route middleware |
| Admin | ✅ Can create | Sets `createdBy: userId` | ✅ In controller |

**Required Fields:**
- title (3-200 chars)
- description (10-2000 chars)
- category (enum)
- priority (enum)
- location (optional)

**Returns:** 201 on success

### PUT /api/complaints/:id/assign - Assign Technician (Admin Only)

| Role | Access | Validation | Implementation |
|------|--------|------------|----------------|
| Resident | ❌ Cannot | Should return 403 | ⚠️ Need route middleware |
| Technician | ❌ Cannot | Should return 403 | ⚠️ Need route middleware |
| Admin | ✅ Can assign | Validates technician exists | ✅ In controller |

**Business Rules:**
- [x] Can only assign to active technicians
- [x] Cannot assign if already assigned
- [x] Can only assign pending complaints
- [x] Changes status to "Assigned"
- [x] Sets `assignedAt` timestamp

**Returns:**
- 400 if technician invalid
- 400 if already assigned
- 400 if not pending status

### PUT /api/complaints/:id/status - Update Status (Technician Only)

| Role | Access | Validation | Implementation |
|------|--------|------------|----------------|
| Resident | ❌ Cannot | Should return 403 | ⚠️ Need route middleware |
| Technician | ✅ Assigned only | `complaint.technician === userId` | ✅ In controller |
| Admin | ❌ Cannot | Should return 403 | ⚠️ Need route middleware |

**Status Workflow Validation:**
- [x] Pending → Assigned ✅ (via assign endpoint)
- [x] Assigned → In Progress ✅
- [x] In Progress → Resolved ✅
- [x] Cannot skip steps ❌ (enforced)
- [x] Cannot go backward ❌ (enforced)

**Special Rules:**
- [x] Resolution note required for "Resolved"
- [x] Sets `resolvedAt` timestamp
- [x] Only assigned technician can update

**Returns:**
- 403 if not assigned to this technician
- 400 if invalid transition
- 400 if missing resolution note

### PUT /api/complaints/:id/feedback - Submit Feedback (Resident Only)

| Role | Access | Validation | Implementation |
|------|--------|------------|----------------|
| Resident | ✅ Own only | `complaint.createdBy === userId` | ⚠️ Controller exists |
| Technician | ❌ Cannot | Should return 403 | ⚠️ Need route middleware |
| Admin | ❌ Cannot | Should return 403 | ⚠️ Need route middleware |

**Business Rules:**
- [ ] Can only submit on own complaints
- [ ] Can only submit when status = "Resolved"
- [ ] Cannot submit if feedback already exists
- [ ] Rating: 1-5 stars (required)
- [ ] Comment: text (required)

**Returns:**
- 403 if not complaint owner
- 400 if not resolved
- 400 if feedback already exists

### GET /api/complaints/technicians - Get Technician List (Admin/Technician)

| Role | Access | Implementation |
|------|--------|----------------|
| Resident | ❌ Cannot | ⚠️ Need route middleware |
| Technician | ✅ Can view | ⚠️ Need route middleware |
| Admin | ✅ Can view | ⚠️ Need route middleware |

**Returns:** List of active technicians with name, email

### GET /api/complaints/dashboard/technician - Technician Dashboard

| Role | Access | Validation | Implementation |
|------|--------|------------|----------------|
| Resident | ❌ Cannot | Should return 403 | ⚠️ Need route middleware |
| Technician | ✅ Own data | Returns own assignments | ✅ In controller |
| Admin | ❌ Cannot | Should return 403 | ⚠️ Need route middleware |

**Returns:** Complaints grouped by status with summary counts

---

## 📢 Notice Endpoints

**Base Path:** `/api/notices`

### GET /api/notices - List All Notices

| Role | Access | Filter | Implementation |
|------|--------|--------|----------------|
| Resident | ✅ Published only | `isActive: true` | ⚠️ Controller not created |
| Technician | ✅ Published only | `isActive: true` | ⚠️ Controller not created |
| Admin | ✅ All | No filter (or all) | ⚠️ Controller not created |

**Query Parameters:**
- `type` - Filter by notice/alert
- `page`, `limit` - Pagination

### GET /api/notices/:id - Get Single Notice

| Role | Access | Implementation |
|------|--------|----------------|
| Resident | ✅ Can view | ⚠️ Controller not created |
| Technician | ✅ Can view | ⚠️ Controller not created |
| Admin | ✅ Can view | ⚠️ Controller not created |

### POST /api/notices - Create Notice/Alert (Admin Only)

| Role | Access | Implementation |
|------|--------|----------------|
| Resident | ❌ Cannot | ⚠️ Need route middleware |
| Technician | ❌ Cannot | ⚠️ Need route middleware |
| Admin | ✅ Can create | ⚠️ Controller not created |

**Required Fields:**
- title (3-200 chars)
- description (10-5000 chars)
- type (notice/alert)
- priority (low/medium/high/urgent)

**Special Behavior:**
- [ ] If type = "alert", trigger notification fan-out
- [ ] Create one notification per resident
- [ ] Use Notification.createBulk() static method

### PUT /api/notices/:id - Update Notice (Admin Only)

| Role | Access | Implementation |
|------|--------|----------------|
| Resident | ❌ Cannot | ⚠️ Need route middleware |
| Technician | ❌ Cannot | ⚠️ Need route middleware |
| Admin | ✅ Can update | ⚠️ Controller not created |

### DELETE /api/notices/:id - Delete Notice (Admin Only)

| Role | Access | Implementation |
|------|--------|----------------|
| Resident | ❌ Cannot | ⚠️ Need route middleware |
| Technician | ❌ Cannot | ⚠️ Need route middleware |
| Admin | ✅ Can delete | ⚠️ Controller not created |

**Implementation:** Soft delete (set `isActive: false`)

---

## 🔔 Notification Endpoints

**Base Path:** `/api/notifications`

### GET /api/notifications - Get User's Notifications

| Role | Access | Filter | Implementation |
|------|--------|--------|----------------|
| Resident | ✅ Own only | `user: userId` | ⚠️ Controller not created |
| Technician | ✅ Own only | `user: userId` | ⚠️ Controller not created |
| Admin | ✅ Own only | `user: userId` | ⚠️ Controller not created |

**Returns:**
- List of notifications
- Unread count
- Pagination info

**Query Parameters:**
- `page`, `limit` - Pagination

### PUT /api/notifications/:id/read - Mark as Read

| Role | Access | Validation | Implementation |
|------|--------|------------|----------------|
| Resident | ✅ Own only | `notification.user === userId` | ⚠️ Controller not created |
| Technician | ✅ Own only | `notification.user === userId` | ⚠️ Controller not created |
| Admin | ✅ Own only | `notification.user === userId` | ⚠️ Controller not created |

**Business Rules:**
- [ ] Can only mark own notifications as read
- [ ] Sets `isRead: true` and `readAt: timestamp`

**Returns:** 403 if trying to mark others' notifications

### PUT /api/notifications/read-all - Mark All as Read

| Role | Access | Filter | Implementation |
|------|--------|--------|----------------|
| Resident | ✅ Own only | `user: userId, isRead: false` | ⚠️ Controller not created |
| Technician | ✅ Own only | `user: userId, isRead: false` | ⚠️ Controller not created |
| Admin | ✅ Own only | `user: userId, isRead: false` | ⚠️ Controller not created |

**Returns:** Count of notifications marked as read

---

## 👨‍💼 Admin Endpoints

**Base Path:** `/api/admin`

### GET /api/admin/analytics - Get Dashboard Analytics (Admin Only)

| Role | Access | Implementation |
|------|--------|----------------|
| Resident | ❌ Cannot | ⚠️ Need route middleware |
| Technician | ❌ Cannot | ⚠️ Need route middleware |
| Admin | ✅ Can view | ⚠️ Controller not created |

**Returns:**
- Complaint counts by status
- Total residents count
- Total technicians count
- Complaints by category (aggregation)
- Recent complaints (last 10)

### GET /api/admin/users - Get All Users (Admin Only)

| Role | Access | Implementation |
|------|--------|----------------|
| Resident | ❌ Cannot | ⚠️ Need route middleware |
| Technician | ❌ Cannot | ⚠️ Need route middleware |
| Admin | ✅ Can view | ⚠️ Controller not created |

**Returns:** List of all users with role filter option

---

## 🧪 Testing Checklist

### Authentication Tests

- [ ] **Valid Login**
  - POST /api/auth/login with correct credentials
  - Expect: 200, JWT token, user data

- [ ] **Invalid Login**
  - POST /api/auth/login with wrong password
  - Expect: 401, error message

- [ ] **Token Expiry**
  - Wait for token to expire or use expired token
  - Make authenticated request
  - Expect: 401, "Token has expired"

- [ ] **Invalid Token**
  - Use malformed/tampered token
  - Expect: 401, "Invalid token"

- [ ] **Missing Token**
  - Make authenticated request without token
  - Expect: 401, "No authentication token provided"

### Role Restriction Tests

#### Resident Tests
- [ ] Create complaint ✅
- [ ] View own complaints ✅
- [ ] View others' complaints ❌ (403)
- [ ] Assign technician ❌ (403)
- [ ] Update complaint status ❌ (403)
- [ ] Submit feedback on own resolved complaint ✅
- [ ] Submit feedback on others' complaint ❌ (403)
- [ ] Create notice ❌ (403)
- [ ] View notices ✅
- [ ] View own notifications ✅
- [ ] Access admin analytics ❌ (403)

#### Technician Tests
- [ ] Create complaint ❌ (403)
- [ ] View assigned complaints ✅
- [ ] View non-assigned complaints ❌ (403)
- [ ] Assign technician ❌ (403)
- [ ] Update status of assigned complaint ✅
- [ ] Update status of non-assigned complaint ❌ (403)
- [ ] Skip workflow steps ❌ (400)
- [ ] Go backward in workflow ❌ (400)
- [ ] Mark as resolved without resolution note ❌ (400)
- [ ] Submit feedback ❌ (403)
- [ ] Create notice ❌ (403)
- [ ] View notices ✅
- [ ] Access technician dashboard ✅
- [ ] Access admin analytics ❌ (403)

#### Admin Tests
- [ ] Create complaint ✅
- [ ] View all complaints ✅
- [ ] Assign technician to pending complaint ✅
- [ ] Assign technician to non-pending complaint ❌ (400)
- [ ] Re-assign already assigned complaint ❌ (400)
- [ ] Update complaint status ❌ (403)
- [ ] Submit feedback ❌ (403)
- [ ] Create notice ✅
- [ ] Create alert (triggers notifications) ✅
- [ ] Update notice ✅
- [ ] Delete notice ✅
- [ ] View analytics ✅
- [ ] Access technician dashboard ❌ (403)

### Workflow Validation Tests

- [ ] **Status Transition: Pending → Assigned**
  - Admin assigns technician
  - Expect: status = "Assigned", assignedAt timestamp

- [ ] **Status Transition: Assigned → In Progress**
  - Technician updates status
  - Expect: status = "In Progress"

- [ ] **Status Transition: In Progress → Resolved**
  - Technician updates with resolution note
  - Expect: status = "Resolved", resolvedAt timestamp, resolution note saved

- [ ] **Invalid: Pending → In Progress** (skip)
  - Expect: 400, "Cannot skip workflow steps"

- [ ] **Invalid: Pending → Resolved** (skip)
  - Expect: 400, "Cannot skip workflow steps"

- [ ] **Invalid: Assigned → Resolved** (skip)
  - Expect: 400, "Cannot skip workflow steps"

- [ ] **Invalid: In Progress → Assigned** (backward)
  - Expect: 400, "Cannot move backward"

- [ ] **Invalid: Resolved → Any** (backward)
  - Expect: 400, "Complaint is already resolved"

- [ ] **Resolved without resolution note**
  - Expect: 400, "Resolution note is required"

### Notification Fan-out Tests

- [ ] **Admin Creates Alert**
  - POST /api/notices with type="alert"
  - Expect: Notice created + notifications for all residents

- [ ] **Resident Sees Notification**
  - GET /api/notifications as resident
  - Expect: Notification in list, unreadCount > 0

- [ ] **Mark as Read**
  - PUT /api/notifications/:id/read
  - Expect: isRead = true, unreadCount decreases

- [ ] **Mark All as Read**
  - PUT /api/notifications/read-all
  - Expect: All unread → read, unreadCount = 0

### Data Isolation Tests

- [ ] **Resident A cannot see Resident B's complaints**
  - Login as Resident A
  - GET /api/complaints/:id (Resident B's complaint)
  - Expect: 403

- [ ] **Technician A cannot update Technician B's complaint**
  - Login as Technician A
  - PUT /api/complaints/:id/status (assigned to Technician B)
  - Expect: 403

- [ ] **Resident cannot mark others' notifications**
  - Login as Resident A
  - PUT /api/notifications/:id/read (belongs to Resident B)
  - Expect: 403

---

## 🔒 Security Verification

### Password Security
- [x] Passwords hashed with bcrypt (salt rounds: 10)
- [x] Passwords never returned in API responses
- [x] Password comparison uses bcrypt.compare()

### Token Security
- [x] JWT secret from environment variable
- [x] Token expiry configured (default: 7 days)
- [x] Tokens verified on each protected request
- [x] Token refresh mechanism in place
- [x] Expired tokens return 401 (not 500)

### Input Validation
- [x] Mongoose schema validation on all models
- [x] Required fields enforced
- [x] String length limits enforced
- [x] Enum values validated
- [x] Email format validated (Mongoose built-in)

### Error Handling
- [x] Centralized error handler
- [x] Consistent error response format
- [x] Production vs development error details
- [x] No stack traces in production
- [x] Mongoose errors properly caught

### CORS
- [x] CORS configured with allowed origins
- [x] Credentials enabled
- [x] Environment-based configuration
- ⚠️ Development bypass (remove for production)

### Rate Limiting
- [x] Rate limiter on /api/ routes
- [x] 100 requests per 15 minutes per IP
- [ ] Consider stricter limits for auth endpoints

---

## 📊 Implementation Status Summary

### ✅ Fully Implemented
- User model with password hashing
- Complaint model with workflow validation
- Notice model with static methods
- Notification model with bulk operations
- Auth middleware (JWT verification)
- Role middleware (RBAC)
- Error handler middleware
- Auth controller (register, login, getMe, logout, refresh)
- Partial complaint controller (CRUD, assign, status update)

### ⚠️ Partially Implemented
- Complaint controller (missing feedback endpoint)
- Routes created but not mounted in server.ts

### ❌ Not Implemented
- Notice controller (create, read, update, delete)
- Notification controller (get, mark read, mark all read)
- Admin controller (analytics, users)
- Route files (auth, complaint, notice, notification, admin)
- Route mounting in server.ts
- Frontend implementation (all)

---

## 🎯 Demo Test Script

### Pre-requisites
1. MongoDB running
2. Backend server running (`npm run dev`)
3. Demo accounts seeded (`npm run seed`)
4. Postman/Thunder Client ready

### Test Sequence (30 minutes)

**1. Authentication (5 min)**
- Login as admin@sociotrack.com
- Login as john@sociotrack.com (resident)
- Login as mike@sociotrack.com (technician)
- Test expired token
- Test invalid token

**2. Resident Flow (5 min)**
- Login as resident
- Create high-priority plumbing complaint
- View own complaints
- Try to view others' complaints (403)
- Try to assign technician (403)
- Try to update status (403)

**3. Admin Flow (5 min)**
- Login as admin
- View all complaints
- Assign technician to complaint
- Try to re-assign (400)
- Create alert notice
- Verify notification fan-out

**4. Technician Flow (5 min)**
- Login as technician
- View assigned complaints
- Try to view others' complaints (403)
- Update status: Assigned → In Progress
- Update status: In Progress → Resolved (with note)
- Try to skip workflow (400)

**5. Feedback & Notifications (5 min)**
- Login as resident
- Submit feedback on resolved complaint
- Try to submit feedback again (400)
- View notifications
- Mark notification as read
- Mark all as read

**6. Security Tests (5 min)**
- Test all cross-role access attempts
- Verify all return 403
- Test workflow violations
- Verify all return 400

---

## 📝 Notes

### Current Blockers
1. **Routes not mounted** - No API endpoints accessible
2. **Missing controllers** - Notice, Notification, Admin not created
3. **Frontend not implemented** - Cannot test UI flow

### Estimated Time to Fix
- Create controllers: 2 hours
- Create and mount routes: 1 hour
- Test all endpoints: 1 hour
- **Total: 4 hours to backend completion**

### Recommended Next Steps
1. Fix route mounting (15 min)
2. Create missing controllers (2 hrs)
3. Test with Postman (1 hr)
4. Then move to frontend implementation

---

**Last Updated:** September 13, 2026  
**Status:** Comprehensive checklist created, awaiting implementation testing
