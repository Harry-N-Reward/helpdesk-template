import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
import * as api from '../../services/api';

// Mock the API
jest.mock('../../services/api');
const mockAuthService = api.authService;

// Mock react-toastify
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
global.localStorage = mockLocalStorage;

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

  it('initializes with default state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('loads user from localStorage on mount', async () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
    };
    const mockToken = 'mock-token';
    
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'authToken') return mockToken;
      if (key === 'user') return JSON.stringify(mockUser);
      return null;
    });
    
    mockAuthService.getProfile.mockResolvedValue({ data: mockUser });
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.token).toBe(mockToken);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('handles login successfully', async () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
    };
    const mockToken = 'mock-token';
    
    mockAuthService.login.mockResolvedValue({
      data: {
        token: mockToken,
        user: mockUser,
      },
    });
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    await act(async () => {
      await result.current.login({
        email: 'test@example.com',
        password: 'password123',
      });
    });
    
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.token).toBe(mockToken);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.error).toBeNull();
    
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('authToken', mockToken);
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(mockUser));
  });

  it('handles login failure', async () => {
    const errorMessage = 'Invalid credentials';
    mockAuthService.login.mockRejectedValue(new Error(errorMessage));
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    await act(async () => {
      try {
        await result.current.login({
          email: 'test@example.com',
          password: 'wrongpassword',
        });
      } catch (error) {
        // Expected to throw
      }
    });
    
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.error).toBe(errorMessage);
  });

  it('handles register successfully', async () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
    };
    const mockToken = 'mock-token';
    
    mockAuthService.register.mockResolvedValue({
      data: {
        token: mockToken,
        user: mockUser,
      },
    });
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    await act(async () => {
      await result.current.register({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'password123',
      });
    });
    
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.token).toBe(mockToken);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('handles register failure', async () => {
    const errorMessage = 'Email already exists';
    mockAuthService.register.mockRejectedValue(new Error(errorMessage));
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    await act(async () => {
      try {
        await result.current.register({
          firstName: 'Test',
          lastName: 'User',
          email: 'existing@example.com',
          password: 'password123',
        });
      } catch (error) {
        // Expected to throw
      }
    });
    
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.error).toBe(errorMessage);
  });

  it('handles logout', async () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
    };
    const mockToken = 'mock-token';
    
    // Set up authenticated state
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'authToken') return mockToken;
      if (key === 'user') return JSON.stringify(mockUser);
      return null;
    });
    
    mockAuthService.getProfile.mockResolvedValue({ data: mockUser });
    mockAuthService.logout.mockResolvedValue({});
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });
    
    await act(async () => {
      await result.current.logout();
    });
    
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.error).toBeNull();
    
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('authToken');
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user');
  });

  it('handles profile update', async () => {
    const initialUser = {
      id: 1,
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
    };
    const updatedUser = {
      ...initialUser,
      firstName: 'Updated',
      lastName: 'Name',
    };
    
    // Set up authenticated state
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'authToken') return 'mock-token';
      if (key === 'user') return JSON.stringify(initialUser);
      return null;
    });
    
    mockAuthService.getProfile.mockResolvedValue({ data: initialUser });
    mockAuthService.updateProfile.mockResolvedValue({ data: updatedUser });
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });
    
    await act(async () => {
      await result.current.updateProfile({
        firstName: 'Updated',
        lastName: 'Name',
      });
    });
    
    expect(result.current.user).toEqual(updatedUser);
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('user', JSON.stringify(updatedUser));
  });

  it('handles password change', async () => {
    const mockUser = {
      id: 1,
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
    };
    
    // Set up authenticated state
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'authToken') return 'mock-token';
      if (key === 'user') return JSON.stringify(mockUser);
      return null;
    });
    
    mockAuthService.getProfile.mockResolvedValue({ data: mockUser });
    mockAuthService.changePassword.mockResolvedValue({});
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    await waitFor(() => {
      expect(result.current.isAuthenticated).toBe(true);
    });
    
    await act(async () => {
      await result.current.changePassword({
        currentPassword: 'oldpassword',
        newPassword: 'newpassword',
      });
    });
    
    expect(mockAuthService.changePassword).toHaveBeenCalledWith({
      currentPassword: 'oldpassword',
      newPassword: 'newpassword',
    });
  });

  it('clears auth state when token is invalid', async () => {
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'authToken') return 'invalid-token';
      return null;
    });
    
    mockAuthService.getProfile.mockRejectedValue(new Error('Token expired'));
    
    const { result } = renderHook(() => useAuth(), { wrapper });
    
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
    
    expect(result.current.user).toBeNull();
    expect(result.current.token).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('authToken');
    expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('user');
  });
});
