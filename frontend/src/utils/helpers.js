import { format, formatDistanceToNow } from 'date-fns';

// Format date for display
export const formatDate = (date) => {
  if (!date) return '';
  return format(new Date(date), 'MMM dd, yyyy at HH:mm');
};

// Format relative time (e.g., "2 hours ago")
export const formatRelativeTime = (date) => {
  if (!date) return '';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

// Get priority color
export const getPriorityColor = (priority) => {
  const colors = {
    low: '#4caf50',
    medium: '#ff9800',
    high: '#f44336',
    critical: '#d32f2f',
  };
  return colors[priority] || '#9e9e9e';
};

// Get status color
export const getStatusColor = (status) => {
  const colors = {
    open: '#2196f3',
    in_progress: '#ff9800',
    resolved: '#4caf50',
    closed: '#9e9e9e',
  };
  return colors[status] || '#9e9e9e';
};

// Capitalize first letter
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Format status for display
export const formatStatus = (status) => {
  return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
};

// Validate email format
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Truncate text
export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

// Get user's full name
export const getFullName = (user) => {
  if (!user) return '';
  return `${user.firstName || ''} ${user.lastName || ''}`.trim();
};

// Get user's initials for avatar
export const getUserInitials = (user) => {
  if (!user) return '';
  const firstName = user.firstName || '';
  const lastName = user.lastName || '';
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

// Handle API errors
export const getErrorMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.response?.data?.errors) {
    return error.response.data.errors.map(err => err.msg).join(', ');
  }
  if (error.message) {
    return error.message;
  }
  return 'An unexpected error occurred';
};

// Debounce function for search
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Generate random ID
export const generateId = () => {
  return Math.random().toString(36).substr(2, 9);
};

// Sort array by key
export const sortBy = (array, key, direction = 'asc') => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
};

// Group array by key
export const groupBy = (array, key) => {
  return array.reduce((groups, item) => {
    const group = item[key];
    groups[group] = groups[group] || [];
    groups[group].push(item);
    return groups;
  }, {});
};

// Check if user can edit ticket
export const canEditTicket = (ticket, user) => {
  if (!ticket || !user) return false;
  
  // IT staff can edit any ticket
  if (['it_user', 'it_admin'].includes(user.role)) {
    return true;
  }
  
  // End users can only edit their own open tickets
  return ticket.requesterId === user.id && ticket.status === 'open';
};

// Check if user can delete ticket
export const canDeleteTicket = (ticket, user) => {
  if (!ticket || !user) return false;
  return user.role === 'it_admin';
};

// Check if user can assign ticket
export const canAssignTicket = (user) => {
  if (!user) return false;
  return ['it_user', 'it_admin'].includes(user.role);
};
