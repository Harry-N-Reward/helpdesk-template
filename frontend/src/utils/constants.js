// User roles
export const USER_ROLES = {
  END_USER: 'end_user',
  IT_USER: 'it_user',
  IT_ADMIN: 'it_admin',
};

// Ticket statuses
export const TICKET_STATUSES = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
};

// Ticket categories
export const TICKET_CATEGORIES = {
  HARDWARE: 'hardware',
  SOFTWARE: 'software',
  NETWORK: 'network',
  ACCESS: 'access',
  OTHER: 'other',
};

// Ticket priorities
export const TICKET_PRIORITIES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

// Status options for dropdowns
export const STATUS_OPTIONS = [
  { value: TICKET_STATUSES.OPEN, label: 'Open' },
  { value: TICKET_STATUSES.IN_PROGRESS, label: 'In Progress' },
  { value: TICKET_STATUSES.RESOLVED, label: 'Resolved' },
  { value: TICKET_STATUSES.CLOSED, label: 'Closed' },
];

// Category options for dropdowns
export const CATEGORY_OPTIONS = [
  { value: TICKET_CATEGORIES.HARDWARE, label: 'Hardware' },
  { value: TICKET_CATEGORIES.SOFTWARE, label: 'Software' },
  { value: TICKET_CATEGORIES.NETWORK, label: 'Network' },
  { value: TICKET_CATEGORIES.ACCESS, label: 'Access' },
  { value: TICKET_CATEGORIES.OTHER, label: 'Other' },
];

// Priority options for dropdowns
export const PRIORITY_OPTIONS = [
  { value: TICKET_PRIORITIES.LOW, label: 'Low' },
  { value: TICKET_PRIORITIES.MEDIUM, label: 'Medium' },
  { value: TICKET_PRIORITIES.HIGH, label: 'High' },
  { value: TICKET_PRIORITIES.CRITICAL, label: 'Critical' },
];

// Role options for dropdowns
export const ROLE_OPTIONS = [
  { value: USER_ROLES.END_USER, label: 'End User' },
  { value: USER_ROLES.IT_USER, label: 'IT User' },
  { value: USER_ROLES.IT_ADMIN, label: 'IT Admin' },
];

// Default pagination settings
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [5, 10, 25, 50],
};

// Navigation menu items
export const MENU_ITEMS = {
  DASHBOARD: { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  TICKETS: { path: '/tickets', label: 'Tickets', icon: 'confirmation_number' },
  NEW_TICKET: { path: '/tickets/new', label: 'New Ticket', icon: 'add' },
  USERS: { path: '/users', label: 'Users', icon: 'people' },
  PROFILE: { path: '/profile', label: 'Profile', icon: 'person' },
};

// Theme colors
export const COLORS = {
  PRIMARY: '#1976d2',
  SECONDARY: '#dc004e',
  SUCCESS: '#4caf50',
  WARNING: '#ff9800',
  ERROR: '#f44336',
  INFO: '#2196f3',
  GREY: '#9e9e9e',
};

// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    PROFILE: '/auth/profile',
    LOGOUT: '/auth/logout',
  },
  TICKETS: {
    BASE: '/tickets',
    STATS: '/tickets/stats/overview',
  },
  USERS: {
    BASE: '/users',
    IT_USERS: '/users/it-users',
  },
};

// Form validation patterns
export const VALIDATION_PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[\+]?[\d\s\-\(\)]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/,
};

// Error messages
export const ERROR_MESSAGES = {
  REQUIRED_FIELD: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PHONE: 'Please enter a valid phone number',
  PASSWORD_TOO_SHORT: 'Password must be at least 6 characters',
  PASSWORD_REQUIREMENTS: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  PASSWORDS_DONT_MATCH: 'Passwords do not match',
  GENERIC_ERROR: 'An error occurred. Please try again.',
};

// Success messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Login successful!',
  LOGOUT: 'Logged out successfully',
  REGISTRATION: 'Registration successful!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  PASSWORD_CHANGED: 'Password changed successfully!',
  TICKET_CREATED: 'Ticket created successfully!',
  TICKET_UPDATED: 'Ticket updated successfully!',
  COMMENT_ADDED: 'Comment added successfully!',
};

// File upload settings
export const FILE_UPLOAD = {
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.txt'],
};

// Date formats
export const DATE_FORMATS = {
  DISPLAY: 'MMM dd, yyyy at HH:mm',
  SHORT: 'MMM dd, yyyy',
  TIME: 'HH:mm',
  ISO: 'yyyy-MM-dd',
};
