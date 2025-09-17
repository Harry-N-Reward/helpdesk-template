import React from 'react';
import { screen } from '@testing-library/react';
import { render, mockAuthContextValues } from '../../utils/testUtils';
import PrivateRoute from '../PrivateRoute';

// Mock react-router-dom Navigate component
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  Navigate: ({ to, replace }) => {
    mockNavigate(to, replace);
    return <div data-testid="navigate">Redirecting to {to}</div>;
  },
}));

describe('PrivateRoute Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders children when user is authenticated', () => {
    render(
      <PrivateRoute>
        <div data-testid="protected-content">Protected Content</div>
      </PrivateRoute>,
      {
        authContextValue: mockAuthContextValues.endUser,
      }
    );
    
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
  });

  it('redirects to login when user is not authenticated', () => {
    render(
      <PrivateRoute>
        <div data-testid="protected-content">Protected Content</div>
      </PrivateRoute>,
      {
        authContextValue: mockAuthContextValues.default,
      }
    );
    
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    expect(screen.getByTestId('navigate')).toBeInTheDocument();
    expect(screen.getByText('Redirecting to /login')).toBeInTheDocument();
    expect(mockNavigate).toHaveBeenCalledWith('/login', true);
  });

  it('shows loading spinner when authentication is loading', () => {
    render(
      <PrivateRoute>
        <div data-testid="protected-content">Protected Content</div>
      </PrivateRoute>,
      {
        authContextValue: {
          ...mockAuthContextValues.default,
          isLoading: true,
        },
      }
    );
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
  });

  it('renders children when authentication loading is complete and user is authenticated', () => {
    render(
      <PrivateRoute>
        <div data-testid="protected-content">Protected Content</div>
      </PrivateRoute>,
      {
        authContextValue: {
          ...mockAuthContextValues.endUser,
          isLoading: false,
        },
      }
    );
    
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    expect(screen.queryByTestId('navigate')).not.toBeInTheDocument();
  });

  it('handles role-based access (if implemented)', () => {
    // This test assumes role-based access might be added in the future
    render(
      <PrivateRoute requiredRole="it_admin">
        <div data-testid="admin-content">Admin Content</div>
      </PrivateRoute>,
      {
        authContextValue: mockAuthContextValues.endUser, // Regular user
      }
    );
    
    // If role-based access is implemented, this should redirect or show access denied
    // For now, it should render the content since role-based access isn't implemented
    expect(screen.getByTestId('admin-content')).toBeInTheDocument();
  });
});
