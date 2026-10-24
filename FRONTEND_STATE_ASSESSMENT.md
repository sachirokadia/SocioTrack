# SocioTrack - Frontend State Management Assessment

## 📊 Current Status: Infrastructure Only

**Overall Implementation:** ~10% complete  
**State Management:** Not implemented  
**Components:** Placeholders only  
**Services:** Structure only  

---

## 🏗️ Existing Structure

### ✅ What Exists

#### 1. Project Setup
- [x] Vite + React + TypeScript
- [x] React Router DOM configured
- [x] Tailwind CSS configured
- [x] Development server configured (port 3000)
- [x] API proxy to backend (localhost:5000)

#### 2. Directory Structure
```
frontend/src/
├── components/     [EMPTY - No components created]
├── context/        [EMPTY - No context providers]
├── hooks/          [EMPTY - No custom hooks]
├── layouts/        [EMPTY - No layout components]
├── pages/
│   ├── auth/
│   │   ├── LoginPage.tsx      [PLACEHOLDER]
│   │   └── RegisterPage.tsx   [PLACEHOLDER]
│   ├── resident/
│   │   └── ResidentDashboard.tsx [PLACEHOLDER]
│   ├── admin/
│   │   └── AdminDashboard.tsx [PLACEHOLDER]
│   └── technician/
│       └── TechnicianDashboard.tsx [PLACEHOLDER]
├── services/
│   ├── api.ts                 [CONFIGURED]
│   ├── authService.ts         [PLACEHOLDER]
│   ├── complaintService.ts    [PLACEHOLDER]
│   ├── noticeService.ts       [PLACEHOLDER]
│   ├── alertService.ts        [PLACEHOLDER]
│   └── userService.ts         [PLACEHOLDER]
└── types/
    └── index.ts               [COMPLETE]
```

#### 3. Routing (App.tsx)
- [x] Basic routes defined
- [x] Home, Login, Register routes
- [x] Dashboard routes for each role
- [x] Catch-all redirect
- ❌ **NO PROTECTED ROUTES**
- ❌ **NO ROLE-BASED ACCESS CONTROL**

---

## ❌ What's Missing

### 1. Context Providers (Critical)

#### ⚠️ AuthContext - NOT CREATED
**Purpose:** Global authentication state  
**Priority:** HIGH - Required for all features  

**Expected Implementation:**
```typescript
// frontend/src/context/AuthContext.tsx

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize: Check for existing token
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await authService.getMe();
          setUser(response.data);
        } catch {
          localStorage.removeItem('token');
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    const response = await authService.login({ email, password });
    localStorage.setItem('token', response.data.token);
    setUser(response.data.user);
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      // ...
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

**State Refresh Requirements:**
- [ ] After login → set user state
- [ ] After logout → clear user state
- [ ] After token refresh → update user state
- [ ] On mount → check localStorage for existing token

---

#### ⚠️ NotificationContext - NOT CREATED (Optional for MVP)
**Purpose:** Global notification state with unread count  
**Priority:** MEDIUM - Enhances UX but not critical  

**Expected Implementation:**
```typescript
interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  refreshNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
}
```

**State Refresh Requirements:**
- [ ] After login → fetch notifications
- [ ] After mark as read → update list and count
- [ ] After mark all as read → update list and count
- [ ] Periodic polling (optional) → refresh every 30s

---

### 2. Protected Route Component (Critical)

#### ⚠️ ProtectedRoute Component - NOT CREATED
**Purpose:** Prevent unauthorized access to role-specific pages  
**Priority:** HIGH - Security requirement  

**Expected Implementation:**
```typescript
// frontend/src/components/ProtectedRoute.tsx

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  allowedRoles 
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(user!.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};
```

**Usage in Routes:**
```typescript
<Route 
  path="/resident/dashboard" 
  element={
    <ProtectedRoute allowedRoles={['resident']}>
      <ResidentDashboard />
    </ProtectedRoute>
  } 
/>
```

**Current Issue:** All dashboard routes are publicly accessible!

---

### 3. Service Implementations (Critical)

#### ⚠️ authService.ts - PLACEHOLDER ONLY
**Current:**
```typescript
export const authService = {
  // This will be implemented later
};
```

**Required Implementation:**
```typescript
export const authService = {
  login: async (credentials: LoginData) => {
    const response = await api.post<ApiResponse<LoginResponse>>(
      '/auth/login', 
      credentials
    );
    return response.data;
  },

  register: async (data: RegisterData) => {
    const response = await api.post<ApiResponse<User>>('/auth/register', data);
    return response.data;
  },

  getMe: async () => {
    const response = await api.get<ApiResponse<User>>('/auth/me');
    return response.data;
  },

  logout: async () => {
    const response = await api.post<ApiResponse<void>>('/auth/logout');
    return response.data;
  },

  refreshToken: async () => {
    const response = await api.post<ApiResponse<{ token: string }>>(
      '/auth/refresh-token'
    );
    return response.data;
  },
};
```

---

#### ⚠️ complaintService.ts - PLACEHOLDER ONLY

**Required Implementation:**
```typescript
export const complaintService = {
  getComplaints: async (params?: ComplaintQueryParams) => {
    const response = await api.get<ApiResponse<Complaint[]>>(
      '/complaints',
      { params }
    );
    return response.data;
  },

  getComplaintById: async (id: string) => {
    const response = await api.get<ApiResponse<Complaint>>(
      `/complaints/${id}`
    );
    return response.data;
  },

  createComplaint: async (data: CreateComplaintData) => {
    const response = await api.post<ApiResponse<Complaint>>(
      '/complaints',
      data
    );
    return response.data;
  },

  assignTechnician: async (complaintId: string, technicianId: string) => {
    const response = await api.put<ApiResponse<Complaint>>(
      `/complaints/${complaintId}/assign`,
      { technicianId }
    );
    return response.data;
  },

  updateStatus: async (
    complaintId: string,
    status: ComplaintStatus,
    resolutionNote?: string
  ) => {
    const response = await api.put<ApiResponse<Complaint>>(
      `/complaints/${complaintId}/status`,
      { status, resolutionNote }
    );
    return response.data;
  },

  submitFeedback: async (
    complaintId: string,
    feedback: FeedbackData
  ) => {
    const response = await api.put<ApiResponse<Complaint>>(
      `/complaints/${complaintId}/feedback`,
      feedback
    );
    return response.data;
  },

  getTechnicians: async () => {
    const response = await api.get<ApiResponse<User[]>>(
      '/complaints/technicians'
    );
    return response.data;
  },
};
```

---

#### ⚠️ noticeService.ts - PLACEHOLDER ONLY

**Required Implementation:**
```typescript
export const noticeService = {
  getNotices: async (params?: NoticeQueryParams) => {
    const response = await api.get<ApiResponse<Notice[]>>(
      '/notices',
      { params }
    );
    return response.data;
  },

  getNoticeById: async (id: string) => {
    const response = await api.get<ApiResponse<Notice>>(`/notices/${id}`);
    return response.data;
  },

  createNotice: async (data: CreateNoticeData) => {
    const response = await api.post<ApiResponse<Notice>>('/notices', data);
    return response.data;
  },

  updateNotice: async (id: string, data: UpdateNoticeData) => {
    const response = await api.put<ApiResponse<Notice>>(
      `/notices/${id}`,
      data
    );
    return response.data;
  },

  deleteNotice: async (id: string) => {
    const response = await api.delete<ApiResponse<void>>(`/notices/${id}`);
    return response.data;
  },
};
```

---

### 4. Page Implementations (Critical)

#### ⚠️ LoginPage.tsx - PLACEHOLDER ONLY

**Current:** Disabled form with no functionality

**Required:**
```typescript
export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      
      // Redirect based on role
      const from = location.state?.from?.pathname || getDashboardPath(user.role);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
      {error && <div className="error">{error}</div>}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Logging in...' : 'Login'}
      </button>
    </form>
  );
};
```

**State Refresh Requirements:**
- [x] Form inputs controlled by local state
- [ ] After submit → call login → redirect
- [ ] On error → display error message
- [ ] Loading state during submission

---

#### ⚠️ ResidentDashboard.tsx - PLACEHOLDER ONLY

**Required Features:**
1. **Complaint Summary Cards**
   - Total complaints
   - Pending count
   - In Progress count
   - Resolved count

2. **Recent Complaints List**
   - Last 5-10 complaints
   - Status badges
   - Link to details page

3. **Notices Section**
   - Latest 3-5 notices
   - High-priority alerts highlighted

4. **Notifications**
   - Bell icon with unread count
   - Dropdown with recent notifications

5. **Quick Actions**
   - Create new complaint button

**State Management Needed:**
```typescript
const [complaints, setComplaints] = useState<Complaint[]>([]);
const [notices, setNotices] = useState<Notice[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetchDashboardData();
}, []);

const fetchDashboardData = async () => {
  try {
    const [complaintsRes, noticesRes] = await Promise.all([
      complaintService.getComplaints({ limit: 10 }),
      noticeService.getNotices({ limit: 5 }),
    ]);
    setComplaints(complaintsRes.data);
    setNotices(noticesRes.data);
  } catch (error) {
    // Handle error
  } finally {
    setLoading(false);
  }
};
```

**State Refresh Requirements:**
- [ ] On mount → fetch complaints and notices
- [ ] After complaint creation → refetch complaints
- [ ] After feedback submission → refetch complaint details
- [ ] Periodic refresh (optional) → every 60s

---

#### ⚠️ AdminDashboard.tsx - PLACEHOLDER ONLY

**Required Features:**
1. **Analytics Cards**
   - Total complaints by status
   - Total residents
   - Total technicians
   - Category breakdown

2. **Recent Complaints**
   - All complaints (not filtered)
   - Ability to assign technician

3. **Quick Actions**
   - Create notice/alert
   - View all users

**State Management Needed:**
```typescript
const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
const [recentComplaints, setRecentComplaints] = useState<Complaint[]>([]);
const [technicians, setTechnicians] = useState<User[]>([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  fetchDashboardData();
}, []);

const fetchDashboardData = async () => {
  try {
    const [analyticsRes, complaintsRes, techniciansRes] = await Promise.all([
      adminService.getAnalytics(),
      complaintService.getComplaints({ limit: 10 }),
      complaintService.getTechnicians(),
    ]);
    setAnalytics(analyticsRes.data);
    setRecentComplaints(complaintsRes.data);
    setTechnicians(techniciansRes.data);
  } finally {
    setLoading(false);
  }
};
```

**State Refresh Requirements:**
- [ ] On mount → fetch analytics, complaints, technicians
- [ ] After technician assignment → refetch complaints
- [ ] After notice/alert creation → refetch notices (if displayed)

---

#### ⚠️ TechnicianDashboard.tsx - PLACEHOLDER ONLY

**Required Features:**
1. **Summary Cards**
   - Assigned count
   - In Progress count
   - Completed count

2. **Complaints by Status**
   - Assigned section (start work button)
   - In Progress section (mark resolved button)
   - Recently completed section

3. **Complaint Details**
   - View complaint info
   - Update status
   - Add resolution note

**State Management Needed:**
```typescript
const [dashboardData, setDashboardData] = useState<TechnicianDashboardData | null>(null);
const [loading, setLoading] = useState(true);
const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

useEffect(() => {
  fetchDashboard();
}, []);

const fetchDashboard = async () => {
  try {
    const response = await complaintService.getTechnicianDashboard();
    setDashboardData(response.data);
  } finally {
    setLoading(false);
  }
};

const handleStatusUpdate = async (
  complaintId: string,
  newStatus: ComplaintStatus,
  resolutionNote?: string
) => {
  setUpdatingStatus(complaintId);
  try {
    await complaintService.updateStatus(complaintId, newStatus, resolutionNote);
    await fetchDashboard(); // Refresh data
  } catch (error) {
    // Handle error
  } finally {
    setUpdatingStatus(null);
  }
};
```

**State Refresh Requirements:**
- [ ] On mount → fetch dashboard data
- [ ] After status update → refetch dashboard (moves card to different section)
- [ ] Loading state per complaint during update

---

## 🔄 State Refresh Patterns

### Critical Refresh Points

#### 1. After Mutations
```typescript
// Pattern: Optimistic update or refetch

// Option A: Refetch (Simple, reliable)
const handleCreate = async (data) => {
  await complaintService.createComplaint(data);
  await fetchComplaints(); // Refresh list
};

// Option B: Optimistic update (Better UX)
const handleCreate = async (data) => {
  const newComplaint = await complaintService.createComplaint(data);
  setComplaints(prev => [newComplaint.data, ...prev]);
};
```

#### 2. After Status Changes
```typescript
// MUST refresh because complaint moves between sections
const handleStatusUpdate = async (id, status) => {
  await complaintService.updateStatus(id, status);
  await fetchDashboard(); // Refresh entire dashboard
};
```

#### 3. After Assignment
```typescript
// Admin assigns technician → complaint disappears from unassigned list
const handleAssign = async (complaintId, technicianId) => {
  await complaintService.assignTechnician(complaintId, technicianId);
  await fetchComplaints(); // Refresh to remove from pending
};
```

#### 4. After Feedback Submission
```typescript
// Feedback form → read-only display
const handleFeedbackSubmit = async (data) => {
  await complaintService.submitFeedback(complaintId, data);
  await fetchComplaintDetails(complaintId); // Refresh to show feedback
};
```

---

### Error Handling Pattern

```typescript
const [error, setError] = useState<string | null>(null);

const handleAction = async () => {
  setError(null);
  try {
    await someService.action();
    // Refresh state
  } catch (err: any) {
    setError(err.response?.data?.message || 'Something went wrong');
  }
};

// Display error
{error && (
  <div className="error-banner">
    {error}
    <button onClick={() => setError(null)}>×</button>
  </div>
)}
```

---

### Loading State Pattern

```typescript
const [isLoading, setIsLoading] = useState(false);

const handleAction = async () => {
  setIsLoading(true);
  try {
    await someService.action();
  } finally {
    setIsLoading(false);
  }
};

// Display loading
<button disabled={isLoading}>
  {isLoading ? <Spinner /> : 'Submit'}
</button>
```

---

## 📋 Implementation Checklist

### Phase 1: Authentication (2-3 hours)
- [ ] Create AuthContext with login/logout/register
- [ ] Implement authService functions
- [ ] Implement LoginPage with form
- [ ] Implement RegisterPage with form
- [ ] Add token persistence (localStorage)
- [ ] Test login flow end-to-end

### Phase 2: Protected Routes (30 min)
- [ ] Create ProtectedRoute component
- [ ] Wrap all dashboard routes
- [ ] Add loading state for auth check
- [ ] Add unauthorized page
- [ ] Test role-based access

### Phase 3: Dashboard Data (3-4 hours)
- [ ] Implement complaintService functions
- [ ] Implement noticeService functions
- [ ] Implement ResidentDashboard with data fetching
- [ ] Implement AdminDashboard with data fetching
- [ ] Implement TechnicianDashboard with data fetching
- [ ] Test all dashboards

### Phase 4: Mutations & Refresh (2-3 hours)
- [ ] Create complaint form
- [ ] Implement status update UI
- [ ] Implement feedback form
- [ ] Add refresh after each mutation
- [ ] Test state updates

### Phase 5: Polish (1-2 hours)
- [ ] Add error toast notifications
- [ ] Add loading spinners
- [ ] Add success messages
- [ ] Improve UI/UX
- [ ] Test edge cases

---

## ⚠️ Current Risks

### 1. No State Refresh
**Issue:** Even when services are implemented, if components don't refetch data after mutations, users will see stale data.

**Example:**
```typescript
// BAD: No refresh
const handleCreate = async (data) => {
  await complaintService.createComplaint(data);
  // User doesn't see new complaint in list!
};

// GOOD: Refetch
const handleCreate = async (data) => {
  await complaintService.createComplaint(data);
  await fetchComplaints(); // ✅ Refresh list
};
```

### 2. No Protected Routes
**Issue:** Anyone can access any dashboard by typing the URL.

**Fix:** Wrap all role-specific routes with ProtectedRoute component.

### 3. No Error Handling
**Issue:** When API calls fail, user sees nothing (or app crashes).

**Fix:** Add try-catch with error state and user-friendly messages.

### 4. No Loading States
**Issue:** User clicks button, nothing happens, clicks again → duplicate requests.

**Fix:** Disable buttons during loading, show spinners.

---

## 🎯 Minimum Viable Implementation

For a working demo, implement in this order:

### Absolute Minimum (4-5 hours)
1. **AuthContext** (1 hour)
2. **authService** (30 min)
3. **LoginPage** (1 hour)
4. **ProtectedRoute** (30 min)
5. **One dashboard** with real data (1.5-2 hours)

### Better Demo (8-10 hours)
Add above plus:
6. **All three dashboards** with real data
7. **Complaint creation** form
8. **Status update** functionality
9. **Feedback** form
10. **Proper error/loading states**

---

## 📊 Summary

| Component | Status | Priority | Effort |
|-----------|--------|----------|--------|
| AuthContext | ❌ Not created | HIGH | 1 hour |
| ProtectedRoute | ❌ Not created | HIGH | 30 min |
| authService | ❌ Placeholder | HIGH | 30 min |
| complaintService | ❌ Placeholder | HIGH | 1 hour |
| noticeService | ❌ Placeholder | MEDIUM | 30 min |
| LoginPage | ❌ Placeholder | HIGH | 1 hour |
| RegisterPage | ❌ Placeholder | MEDIUM | 45 min |
| ResidentDashboard | ❌ Placeholder | HIGH | 2 hours |
| AdminDashboard | ❌ Placeholder | HIGH | 2 hours |
| TechnicianDashboard | ❌ Placeholder | HIGH | 2 hours |
| NotificationContext | ❌ Not created | LOW | 1 hour |
| Common Components | ❌ Not created | MEDIUM | 2 hours |

**Total Estimated Effort:** 14-16 hours for complete frontend
**Minimum Demo-Ready:** 4-5 hours (auth + one dashboard)

---

**Last Updated:** September 13, 2026  
**Assessment:** Frontend is 10% complete. State management architecture needs full implementation.
