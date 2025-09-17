import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { AuthContext } from '../contexts/AuthContext';

// Create a default theme for testing
const theme = createTheme();

// Mock user data
export const mockUsers = {
  endUser: {
    id: 1,
    email: 'user@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'end_user',
    department: 'Sales',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  itUser: {
    id: 2,
    email: 'it@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    role: 'it_user',
    department: 'IT',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  itAdmin: {
    id: 3,
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'it_admin',
    department: 'IT',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
};

// Mock ticket data
export const mockTickets = [
  {
    id: 1,
    title: 'Login Issues',
    description: 'Cannot log into the system',
    status: 'open',
    priority: 'high',
    category: 'access',
    createdBy: 1,
    assignedTo: 2,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    User: mockUsers.endUser,
    AssignedUser: mockUsers.itUser,
  },
  {
    id: 2,
    title: 'Software Installation',
    description: 'Need to install new software',
    status: 'in_progress',
    priority: 'medium',
    category: 'software',
    createdBy: 1,
    assignedTo: 2,
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
    User: mockUsers.endUser,
    AssignedUser: mockUsers.itUser,
  },
];

// Mock auth context values
export const mockAuthContextValues = {
  default: {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    updateProfile: jest.fn(),
    changePassword: jest.fn(),
  },
  endUser: {
    user: mockUsers.endUser,
    token: 'mock-token',
    isAuthenticated: true,
    isLoading: false,
    error: null,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    updateProfile: jest.fn(),
    changePassword: jest.fn(),
  },
  itUser: {
    user: mockUsers.itUser,
    token: 'mock-token',
    isAuthenticated: true,
    isLoading: false,
    error: null,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    updateProfile: jest.fn(),
    changePassword: jest.fn(),
  },
  itAdmin: {
    user: mockUsers.itAdmin,
    token: 'mock-token',
    isAuthenticated: true,
    isLoading: false,
    error: null,
    login: jest.fn(),
    register: jest.fn(),
    logout: jest.fn(),
    updateProfile: jest.fn(),
    changePassword: jest.fn(),
  },
};

// Custom render function with providers
export function renderWithProviders(
  ui,
  {
    authContextValue = mockAuthContextValues.default,
    initialEntries = ['/'],
    ...renderOptions
  } = {}
) {
  function Wrapper({ children }) {
    return (
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <AuthContext.Provider value={authContextValue}>
            {children}
          </AuthContext.Provider>
        </ThemeProvider>
      </BrowserRouter>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Mock API responses
export const mockApiResponses = {
  tickets: {
    getTickets: {
      data: {
        tickets: mockTickets,
        totalCount: mockTickets.length,
        page: 1,
        totalPages: 1,
      },
    },
    getTicket: {
      data: mockTickets[0],
    },
    createTicket: {
      data: { ...mockTickets[0], id: 999 },
    },
    updateTicket: {
      data: { ...mockTickets[0], title: 'Updated Title' },
    },
    getTicketUpdates: {
      data: [
        {
          id: 1,
          ticketId: 1,
          comment: 'Working on this issue',
          createdBy: 2,
          createdAt: '2024-01-01T01:00:00Z',
          User: mockUsers.itUser,
        },
      ],
    },
    getStats: {
      data: {
        totalTickets: 10,
        openTickets: 3,
        inProgressTickets: 4,
        resolvedTickets: 2,
        closedTickets: 1,
      },
    },
  },
  users: {
    getUsers: {
      data: {
        users: Object.values(mockUsers),
        totalCount: Object.values(mockUsers).length,
        page: 1,
        totalPages: 1,
      },
    },
    getUser: {
      data: mockUsers.endUser,
    },
    getUserStats: {
      data: {
        totalTickets: 5,
        openTickets: 2,
        closedTickets: 3,
        assignedTickets: 0,
      },
    },
  },
  auth: {
    login: {
      data: {
        token: 'mock-token',
        user: mockUsers.endUser,
      },
    },
    register: {
      data: {
        token: 'mock-token',
        user: mockUsers.endUser,
      },
    },
    getProfile: {
      data: mockUsers.endUser,
    },
  },
};

// Utility to wait for loading states
export const waitForLoadingToFinish = () => {
  return new Promise(resolve => setTimeout(resolve, 0));
};

export * from '@testing-library/react';
export { renderWithProviders as render };
