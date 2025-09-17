const bcrypt = require('bcrypt');

// Helper function to hash passwords
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

// Format date for display
const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Generate random string
const generateRandomString = (length = 10) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Calculate time difference in human readable format
const getTimeDifference = (startDate, endDate = new Date()) => {
  const diffMs = endDate - startDate;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (diffDays > 0) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else if (diffHours > 0) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffMinutes > 0) {
    return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
};

// Sanitize HTML content
const sanitizeHtml = (html) => {
  // Basic HTML sanitization - in production, use a library like DOMPurify
  return html
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/&/g, '&amp;');
};

// Generate ticket number
const generateTicketNumber = (id) => {
  return `TK-${String(id).padStart(6, '0')}`;
};

// Priority color mapping
const getPriorityColor = (priority) => {
  const colors = {
    low: '#28a745',
    medium: '#ffc107',
    high: '#fd7e14',
    critical: '#dc3545',
  };
  return colors[priority] || '#6c757d';
};

// Status color mapping
const getStatusColor = (status) => {
  const colors = {
    open: '#007bff',
    in_progress: '#ffc107',
    resolved: '#28a745',
    closed: '#6c757d',
  };
  return colors[status] || '#6c757d';
};

// Pagination helper
const getPaginationInfo = (page, limit, totalCount) => {
  const currentPage = parseInt(page);
  const pageSize = parseInt(limit);
  const totalPages = Math.ceil(totalCount / pageSize);
  const offset = (currentPage - 1) * pageSize;

  return {
    currentPage,
    pageSize,
    totalPages,
    totalCount,
    offset,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1,
  };
};

// Response helper
const createResponse = (success, message, data = null, errors = null) => {
  const response = { success, message };
  
  if (data !== null) {
    response.data = data;
  }
  
  if (errors !== null) {
    response.errors = errors;
  }
  
  return response;
};

// Async wrapper for route handlers
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = {
  hashPassword,
  formatDate,
  generateRandomString,
  isValidEmail,
  getTimeDifference,
  sanitizeHtml,
  generateTicketNumber,
  getPriorityColor,
  getStatusColor,
  getPaginationInfo,
  createResponse,
  asyncHandler,
};
