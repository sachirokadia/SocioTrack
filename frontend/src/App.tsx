import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UserRole } from './types';

// Layouts
import ResidentLayout from './layouts/ResidentLayout';
import AdminLayout from './layouts/AdminLayout';
import TechnicianLayout from './layouts/TechnicianLayout';

// Components
import ProtectedRoute from './components/ProtectedRoute';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';

// Resident Pages
import ResidentDashboard from './pages/resident/ResidentDashboard';
import MyComplaints from './pages/resident/MyComplaints';
import CreateComplaint from './pages/resident/CreateComplaint';
import ResidentComplaintDetails from './pages/resident/ComplaintDetails';
import ResidentNotices from './pages/resident/Notices';
import ResidentNotifications from './pages/resident/Notifications';
import ResidentProfile from './pages/resident/Profile';
import ResidentBills from './pages/resident/Bills';
import ResidentPayOnline from './pages/resident/PayOnline';
import ResidentPaymentHistory from './pages/resident/PaymentHistory';
import ResidentLedger from './pages/resident/Ledger';
import ResidentMeetings from './pages/resident/Meetings';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminComplaints from './pages/admin/Complaints';
import AdminComplaintDetails from './pages/admin/ComplaintDetails';
import AdminNotices from './pages/admin/Notices';
import AdminUsers from './pages/admin/Users';
import AdminNotifications from './pages/admin/Notifications';
import AdminProfile from './pages/admin/Profile';
import AdminBills from './pages/admin/Bills';
import AdminPayments from './pages/admin/Payments';
import AdminMeetings from './pages/admin/Meetings';

// Technician Pages
import TechnicianDashboard from './pages/technician/TechnicianDashboard';
import TechnicianComplaints from './pages/technician/Complaints';
import TechnicianComplaintDetails from './pages/technician/ComplaintDetails';
import TechnicianNotifications from './pages/technician/Notifications';
import TechnicianProfile from './pages/technician/Profile';

import './App.css';

// Root redirect component
const RootRedirect = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Redirect based on user role
  switch (user?.role) {
    case UserRole.RESIDENT:
      return <Navigate to="/resident/dashboard" replace />;
    case UserRole.ADMIN:
      return <Navigate to="/admin/dashboard" replace />;
    case UserRole.TECHNICIAN:
      return <Navigate to="/technician/dashboard" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Root */}
          <Route path="/" element={<RootRedirect />} />
          
          {/* Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Resident Routes */}
          <Route
            path="/resident/*"
            element={
              <ProtectedRoute allowedRoles={[UserRole.RESIDENT]}>
                <ResidentLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<ResidentDashboard />} />
            <Route path="complaints" element={<MyComplaints />} />
            <Route path="complaints/new" element={<CreateComplaint />} />
            <Route path="complaints/:id" element={<ResidentComplaintDetails />} />
            <Route path="notices" element={<ResidentNotices />} />
            <Route path="notifications" element={<ResidentNotifications />} />
            <Route path="profile" element={<ResidentProfile />} />
            <Route path="bills" element={<ResidentBills />} />
            <Route path="pay" element={<ResidentPayOnline />} />
            <Route path="payments" element={<ResidentPaymentHistory />} />
            <Route path="ledger" element={<ResidentLedger />} />
            <Route path="meetings" element={<ResidentMeetings />} />
          </Route>
          
          {/* Admin Routes */}
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="complaints" element={<AdminComplaints />} />
            <Route path="complaints/:id" element={<AdminComplaintDetails />} />
            <Route path="notices" element={<AdminNotices />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="notifications" element={<AdminNotifications />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="bills" element={<AdminBills />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route path="meetings" element={<AdminMeetings />} />
          </Route>
          
          {/* Technician Routes */}
          <Route
            path="/technician/*"
            element={
              <ProtectedRoute allowedRoles={[UserRole.TECHNICIAN]}>
                <TechnicianLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<TechnicianDashboard />} />
            <Route path="complaints" element={<TechnicianComplaints />} />
            <Route path="complaints/:id" element={<TechnicianComplaintDetails />} />
            <Route path="notifications" element={<TechnicianNotifications />} />
            <Route path="profile" element={<TechnicianProfile />} />
          </Route>
          
          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes> 
      </AuthProvider>
    </Router>
  );
}

export default App;
