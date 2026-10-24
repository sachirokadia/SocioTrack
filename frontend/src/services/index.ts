// Export API instance and utilities
export { default as api } from './api';
export { setAuthToken, getAuthToken, clearAuthToken } from './api';

// Export service functions (will be added as we build features)
export * from './authService';
export * from './complaintService';
export * from './noticeService';
export * from './alertService';
export * from './userService';