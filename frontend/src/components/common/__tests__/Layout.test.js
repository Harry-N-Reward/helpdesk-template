import React from 'react';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render, mockAuthContextValues } from '../../utils/testUtils';
import Layout from '../Layout';

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  Outlet: () => <div data-testid="outlet">Page Content</div>,
}));

describe('Layout Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders layout correctly for end user', () => {
    render(<Layout />, {
      authContextValue: mockAuthContextValues.endUser,
    });
    
    expect(screen.getByText('Helpdesk System')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('My Tickets')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByTestId('outlet')).toBeInTheDocument();
    
    // Should not show admin-only items
    expect(screen.queryByText('User Management')).not.toBeInTheDocument();
  });

  it('renders layout correctly for IT user', () => {
    render(<Layout />, {
      authContextValue: mockAuthContextValues.itUser,
    });
    
    expect(screen.getByText('Helpdesk System')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('All Tickets')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    
    // Should not show admin-only items
    expect(screen.queryByText('User Management')).not.toBeInTheDocument();
  });

  it('renders layout correctly for IT admin', () => {
    render(<Layout />, {
      authContextValue: mockAuthContextValues.itAdmin,
    });
    
    expect(screen.getByText('Helpdesk System')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('All Tickets')).toBeInTheDocument();
    expect(screen.getByText('User Management')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });

  it('displays user information correctly', () => {
    render(<Layout />, {
      authContextValue: mockAuthContextValues.endUser,
    });
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('user@example.com')).toBeInTheDocument();
  });

  it('navigates to dashboard when dashboard link is clicked', async () => {
    const user = userEvent.setup();
    render(<Layout />, {
      authContextValue: mockAuthContextValues.endUser,
    });
    
    const dashboardLink = screen.getByText('Dashboard');
    await user.click(dashboardLink);
    
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('navigates to tickets when tickets link is clicked', async () => {
    const user = userEvent.setup();
    render(<Layout />, {
      authContextValue: mockAuthContextValues.endUser,
    });
    
    const ticketsLink = screen.getByText('My Tickets');
    await user.click(ticketsLink);
    
    expect(mockNavigate).toHaveBeenCalledWith('/tickets');
  });

  it('navigates to profile when profile link is clicked', async () => {
    const user = userEvent.setup();
    render(<Layout />, {
      authContextValue: mockAuthContextValues.endUser,
    });
    
    const profileLink = screen.getByText('Profile');
    await user.click(profileLink);
    
    expect(mockNavigate).toHaveBeenCalledWith('/profile');
  });

  it('navigates to user management when user management link is clicked (IT admin)', async () => {
    const user = userEvent.setup();
    render(<Layout />, {
      authContextValue: mockAuthContextValues.itAdmin,
    });
    
    const userManagementLink = screen.getByText('User Management');
    await user.click(userManagementLink);
    
    expect(mockNavigate).toHaveBeenCalledWith('/users');
  });

  it('calls logout when logout button is clicked', async () => {
    const user = userEvent.setup();
    const mockLogout = jest.fn();
    
    render(<Layout />, {
      authContextValue: {
        ...mockAuthContextValues.endUser,
        logout: mockLogout,
      },
    });
    
    const logoutButton = screen.getByRole('button', { name: /logout/i });
    await user.click(logoutButton);
    
    expect(mockLogout).toHaveBeenCalled();
  });

  it('shows mobile menu when menu button is clicked', async () => {
    const user = userEvent.setup();
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 600,
    });
    
    render(<Layout />, {
      authContextValue: mockAuthContextValues.endUser,
    });
    
    const menuButton = screen.getByRole('button', { name: /open drawer/i });
    await user.click(menuButton);
    
    // Mobile menu should be visible
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('highlights active navigation item', () => {
    // Mock location pathname
    delete window.location;
    window.location = { pathname: '/dashboard' };
    
    render(<Layout />, {
      authContextValue: mockAuthContextValues.endUser,
    });
    
    const dashboardLink = screen.getByText('Dashboard');
    expect(dashboardLink.closest('li')).toHaveClass('Mui-selected');
  });

  it('displays role-appropriate ticket text', () => {
    // End user should see "My Tickets"
    const { rerender } = render(<Layout />, {
      authContextValue: mockAuthContextValues.endUser,
    });
    
    expect(screen.getByText('My Tickets')).toBeInTheDocument();
    
    // IT user should see "All Tickets"
    rerender(<Layout />, {
      authContextValue: mockAuthContextValues.itUser,
    });
    
    expect(screen.getByText('All Tickets')).toBeInTheDocument();
  });

  it('renders theme toggle button', () => {
    render(<Layout />, {
      authContextValue: mockAuthContextValues.endUser,
    });
    
    const themeToggle = screen.getByRole('button', { name: /toggle theme/i });
    expect(themeToggle).toBeInTheDocument();
  });
});
