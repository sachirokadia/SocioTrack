# SocioTrack - Pre-Demo Checklist

## ✅ Completed Tasks

### 1. Project Documentation
- [x] Comprehensive README with setup instructions
- [x] Environment variable documentation
- [x] Demo flow documented
- [x] API endpoints documented
- [x] Future scope clearly listed

### 2. Demo Account Setup
- [x] Seed script created (`backend/src/seed.ts`)
- [x] Script command added to package.json (`npm run seed`)
- [x] Demo accounts:
  - Admin: admin@sociotrack.com / Admin@123
  - Resident: john@sociotrack.com / Resident@123
  - Technician: mike@sociotrack.com / Tech@123

## 🔍 Review Items

### Security & Configuration

#### CORS Configuration
**Status:** ⚠️ NEEDS REVIEW

**Current Implementation:**
```typescript
// backend/src/server.ts
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      'http://localhost:3000',
      'http://127.0.0.1:3000'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};
```

**Action Items:**
- ✅ Configuration looks good for development
- ✅ Uses environment variable for deployed frontend
- ✅ Allows localhost variations
- ⚠️ Consider restricting in production (remove development bypass)

#### Environment Variables
**Status:** ✅ VERIFIED

**Backend (.env.example):**
- PORT ✅
- NODE_ENV ✅
- MONGO_URI ✅
- JWT_SECRET ✅
- JWT_EXPIRES_IN ✅
- FRONTEND_URL ✅

**Frontend (.env.example):**
- VITE_API_BASE_URL ✅

**Verification:**
- [x] No hardcoded secrets in codebase
- [x] All sensitive data from environment
- [x] .env files in .gitignore

#### JWT & Authentication
**Status:** ⚠️ NEEDS TESTING

**Implementation Points:**
```typescript
// backend/src/middleware/auth.ts
- Token verification with proper error handling ✅
- TokenExpiredError returns 401 ✅
- JsonWebTokenError returns 401 ✅
- Missing token returns 401 ✅
```

**Test Cases:**
- [ ] Valid token → Access granted
- [ ] Expired token → 401 with clear message
- [ ] Invalid token → 401 with clear message
- [ ] Missing token → 401 with clear message
- [ ] Malformed token → 401 (not crash)

### Role-Based Access Control

#### Endpoint Access Matrix

**Auth Endpoints** (Public)
- POST /api/auth/register → All ✅
- POST /api/auth/login → All ✅
- GET /api/auth/me → Authenticated ✅

**Complaint Endpoints**
| Endpoint | Resident | Technician | Admin | Implementation |
|----------|----------|------------|-------|----------------|
| GET /api/complaints | Own only | Assigned only | All | ⚠️ VERIFY |
| GET /api/complaints/:id | Own only | Assigned only | All | ⚠️ VERIFY |
| POST /api/complaints | ✅ | ❌ | ✅ | ⚠️ VERIFY |
| PUT /api/complaints/:id/assign | ❌ | ❌ | ✅ Only | ⚠️ VERIFY |
| PUT /api/complaints/:id/status | ❌ | ✅ Assigned | ❌ | ⚠️ VERIFY |
| PUT /api/complaints/:id/feedback | ✅ Own | ❌ | ❌ | ⚠️ VERIFY |

**Notice Endpoints**
| Endpoint | Resident | Technician | Admin | Implementation |
|----------|----------|------------|-------|----------------|
| GET /api/notices | ✅ | ✅ | ✅ | ⚠️ VERIFY |
| GET /api/notices/:id | ✅ | ✅ | ✅ | ⚠️ VERIFY |
| POST /api/notices | ❌ | ❌ | ✅ Only | ⚠️ VERIFY |
| PUT /api/notices/:id | ❌ | ❌ | ✅ Only | ⚠️ VERIFY |
| DELETE /api/notices/:id | ❌ | ❌ | ✅ Only | ⚠️ VERIFY |

**Notification Endpoints**
| Endpoint | Resident | Technician | Admin | Implementation |
|----------|----------|------------|-------|----------------|
| GET /api/notifications | ✅ Own | ✅ Own | ✅ Own | ⚠️ VERIFY |
| PUT /api/notifications/:id/read | ✅ Own | ✅ Own | ✅ Own | ⚠️ VERIFY |
| PUT /api/notifications/read-all | ✅ Own | ✅ Own | ✅ Own | ⚠️ VERIFY |

**Admin Endpoints**
| Endpoint | Resident | Technician | Admin | Implementation |
|----------|----------|------------|-------|----------------|
| GET /api/admin/analytics | ❌ | ❌ | ✅ Only | ⚠️ VERIFY |
| GET /api/admin/users | ❌ | ❌ | ✅ Only | ⚠️ VERIFY |
| GET /api/admin/technicians | ❌ | ✅ | ✅ | ⚠️ VERIFY |

### Database & Models

#### ObjectId References & Population
**Status:** ⚠️ NEEDS VERIFICATION

**Models to Check:**
1. **User Model**
   - No references ✅

2. **Complaint Model**
   - createdBy → User ⚠️ CHECK .populate()
   - technician → User ⚠️ CHECK .populate()

3. **Notice Model**
   - createdBy → User ⚠️ CHECK .populate()

4. **Notification Model**
   - user → User ⚠️ CHECK .populate()
   - relatedNotice → Notice ⚠️ CHECK .populate()

**Population Points to Verify:**
- [ ] complaintController.getComplaints
- [ ] complaintController.getComplaintById
- [ ] complaintController.assignTechnician
- [ ] noticeController.getNotices
- [ ] notificationController.getNotifications

#### Schema Validation
- [ ] User: email uniqueness enforced
- [ ] Complaint: required fields enforced
- [ ] Notice: type enum enforced
- [ ] Notification: isRead default false

### Error Handling

#### Centralized Error Handler
**Status:** ✅ IMPLEMENTED

**Location:** `backend/src/middleware/errorHandler.ts`

**Verified:**
- [x] Consistent error response shape
- [x] Development vs production error details
- [x] 404 handler
- [x] Mongoose error handling (ValidationError, CastError, 11000)
- [x] JWT error handling
- [x] asyncHandler wrapper

**Expected Error Response Format:**
```json
{
  "success": false,
  "message": "Error description",
  "error": "Details (dev only)"
}
```

### Frontend State Management

#### State Refresh After Mutations
**Status:** ⚠️ NEEDS VERIFICATION

**Critical Update Points:**
- [ ] After complaint creation → Refresh complaint list
- [ ] After complaint status update → Refresh complaint details
- [ ] After technician assignment → Refresh complaint list/details
- [ ] After feedback submission → Refresh complaint details
- [ ] After notice creation → Refresh notice list
- [ ] After alert creation → Refresh notifications
- [ ] After notification read → Update unread count
- [ ] After mark all read → Update unread count and list

**Implementation Check:**
- [ ] API calls in try-catch blocks
- [ ] Success responses trigger refetch or state update
- [ ] Error handling with user feedback
- [ ] Loading states while fetching

## 🎯 Demo Flow Verification

### Complete Workflow Test
**Status:** ⚠️ PENDING

#### Step 1: Resident Creates Complaint
- [ ] Start both servers (backend + frontend)
- [ ] Login as john@sociotrack.com
- [ ] Navigate to Create Complaint
- [ ] Fill form:
  - Title: "Leaking Pipe in Kitchen"
  - Description: Detailed description
  - Category: Plumbing
  - Priority: High
  - Location: A-101
- [ ] Submit successfully
- [ ] Verify complaint appears in list with "Pending" status
- [ ] Verify complaint ID and timestamp

#### Step 2: Admin Assigns Technician
- [ ] Logout and login as admin@sociotrack.com
- [ ] See complaint in admin dashboard
- [ ] Open complaint details
- [ ] Click "Assign Technician"
- [ ] See dropdown with available technicians
- [ ] Select Mike Wilson
- [ ] Confirm assignment
- [ ] Verify status changed to "Assigned"
- [ ] Verify assignedAt timestamp set
- [ ] Verify technician name displayed

#### Step 3: Technician Updates Status (Assigned → In Progress)
- [ ] Logout and login as mike@sociotrack.com
- [ ] See assigned complaints in technician dashboard
- [ ] Complaint appears in "Assigned" section
- [ ] Open complaint details
- [ ] Click "Start Work" or status update button
- [ ] Verify status changed to "In Progress"
- [ ] Verify complaint moved to "In Progress" section
- [ ] Verify cannot skip to "Resolved" directly

#### Step 4: Technician Resolves Complaint
- [ ] Still logged in as mike@sociotrack.com
- [ ] Open the in-progress complaint
- [ ] Click "Mark as Resolved"
- [ ] Resolution note field appears (required)
- [ ] Enter: "Replaced damaged pipe section. Tested for leaks. Issue resolved."
- [ ] Submit resolution
- [ ] Verify status changed to "Resolved"
- [ ] Verify resolvedAt timestamp set
- [ ] Verify resolution note saved
- [ ] Verify complaint moved to "Completed" section

#### Step 5: Resident Submits Feedback
- [ ] Logout and login as john@sociotrack.com
- [ ] Navigate to complaint details
- [ ] See feedback form (only visible for resolved complaints)
- [ ] Rate 5 stars
- [ ] Comment: "Excellent work! Very prompt service."
- [ ] Submit feedback
- [ ] Verify feedback replaced form (now read-only)
- [ ] Verify cannot submit feedback again
- [ ] Verify rating and comment displayed

#### Step 6: Admin Creates Alert
- [ ] Logout and login as admin@sociotrack.com
- [ ] Navigate to Alert Management
- [ ] Click "Create Alert"
- [ ] Fill form:
  - Title: "Water Supply Maintenance"
  - Message: "Water supply will be interrupted tomorrow 10 AM - 2 PM"
  - Type: Alert
  - Priority: High/Urgent
- [ ] Publish alert
- [ ] Verify alert created

#### Step 7: Resident Sees Notification
- [ ] Logout and login as john@sociotrack.com
- [ ] Dashboard loads
- [ ] See alert banner/popup (high-priority alert)
- [ ] See notification bell icon with unread count (1 or more)
- [ ] Click notification bell
- [ ] See notification in dropdown
- [ ] Click notification to read
- [ ] Verify unread count decreases
- [ ] Click "Mark All as Read"
- [ ] Verify all notifications marked read
- [ ] Verify unread count is 0

## 🐛 Known Issues

### Critical Issues (Must Fix)
1. **API Routes Not Mounted**
   - Issue: server.ts has no route mounting
   - Impact: No API endpoints accessible
   - Fix: Need to create and mount auth, complaint, notice, notification routes

2. **Missing Schema Import**
   - Issue: Notice.ts and Notification.ts missing Schema import
   - Impact: Build fails
   - Fix: Add `import { Schema } from 'mongoose'`

### Medium Priority
1. **CORS in Production**
   - Issue: Development bypass allows all origins
   - Impact: Security risk in production
   - Fix: Remove development bypass for production builds

2. **Rate Limiting**
   - Issue: Only applied to /api/ prefix
   - Impact: Health endpoint not rate limited
   - Fix: Apply globally or exclude health check explicitly

### Low Priority (Acceptable for Demo)
1. **No Request Logging**
   - Impact: Harder to debug issues
   - Fix: Add morgan or custom logging middleware

2. **No Test Coverage**
   - Impact: Manual testing required
   - Fix: Add Jest/Mocha tests (Future enhancement)

## 📋 Pre-Demo Checklist

### Day Before Demo
- [ ] Run `npm run seed` to create demo accounts
- [ ] Test complete demo flow once
- [ ] Verify all credentials work
- [ ] Clear browser cache/storage
- [ ] Prepare backup demo data if needed
- [ ] Take screenshots of key features
- [ ] Practice demo flow (15-20 minutes)

### Demo Day Setup (30 minutes before)
- [ ] Start MongoDB service
- [ ] Start backend: `cd backend && npm run dev`
- [ ] Start frontend: `cd frontend && npm run dev`
- [ ] Test login with all three roles
- [ ] Have README open for reference
- [ ] Have terminal windows arranged
- [ ] Browser zoom at 100%
- [ ] Clear any test data from previous runs

### During Demo
- [ ] Explain project scope (2 weeks, 2 people)
- [ ] Show role-based dashboards
- [ ] Demonstrate workflow: Complaint → Assignment → Resolution → Feedback
- [ ] Show alert creation and notification delivery
- [ ] Highlight security features (JWT, RBAC, validation)
- [ ] Mention tech stack (MERN + TypeScript)
- [ ] Discuss architecture decisions
- [ ] Answer questions about implementation

### Viva Questions - Be Prepared
1. **Why MongoDB over SQL?**
   - Flexible schema for evolving requirements
   - Easy to scale horizontally
   - Good for document-based data (complaints, notices)
   - JSON-like structure matches JavaScript ecosystem

2. **Why JWT over session-based auth?**
   - Stateless authentication
   - Scalable across multiple servers
   - Works well with mobile apps
   - Industry standard for REST APIs

3. **How do you handle security?**
   - Password hashing with bcrypt
   - JWT token authentication
   - Role-based access control
   - Input validation
   - CORS protection
   - Rate limiting
   - Helmet for security headers

4. **What would you add with more time?**
   - Real-time notifications (Socket.IO)
   - Email notifications
   - File upload for images
   - Mobile app
   - Advanced analytics/reporting
   - See Future Scope in README

5. **How does the status workflow work?**
   - Mongoose methods validate transitions
   - Cannot skip steps (e.g., Assigned → Resolved blocked)
   - Cannot go backward
   - Resolution note required for Resolved status
   - Enforced at database level

6. **How are notifications delivered?**
   - Alert creation triggers fan-out
   - One notification per resident
   - insertMany for bulk creation
   - Fetch-on-load (not real-time)
   - Could add Socket.IO for real-time (Future)

## ✅ Final Sign-Off

### Code Review
- [ ] All TypeScript errors resolved
- [ ] No console.errors in production code
- [ ] Consistent code formatting
- [ ] Meaningful variable names
- [ ] Comments on complex logic

### Documentation
- [x] README complete and accurate
- [x] API endpoints documented
- [x] Setup instructions clear
- [x] Demo flow explained
- [x] Future scope listed

### Functionality
- [ ] All critical features work
- [ ] No breaking bugs
- [ ] Error messages user-friendly
- [ ] Loading states present
- [ ] Success/error feedback clear

**Demo Ready:** ⚠️ PENDING (after fixing critical issues)

**Estimated Time to Demo-Ready:** 2-4 hours (fix critical issues + testing)

---

Last Updated: September 13, 2026
