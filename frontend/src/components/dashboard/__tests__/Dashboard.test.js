import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render, mockAuthContextValues, mockApiResponses } from '../../utils/testUtils';
import Dashboard from '../Dashboard';
import * as api from '../../../services/api';

// Mock the API
jest.mock('../../../services/api');
const mockTicketService = api.ticketService;

// Mock react-router-dom
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Dashboard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTicketService.getStats.mockResolvedValue(mockApiResponses.tickets.getStats);
    mockTicketService.getTickets.mockResolvedValue(mockApiResponses.tickets.getTickets);
  });

  it('renders dashboard correctly for end user', async () => {
    render(<Dashboard />, {
      authContextValue: mockAuthContextValues.endUser,
    });
    
    expect(screen.getByText(/welcome back, john/i)).toBeInTheDocument();
    expect(screen.getByText(/helpdesk dashboard/i)).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Recent Tickets')).toBeInTheDocument();
    });
  });

  it('renders dashboard correctly for IT user with statistics', async () => {
    render(<Dashboard />, {
      authContextValue: mockAuthContextValues.itUser,
    });
    
    expect(screen.getByText(/welcome back, jane/i)).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Ticket Statistics')).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument(); // Total tickets
      expect(screen.getByText('3')).toBeInTheDocument(); // Open tickets
      expect(screen.getByText('4')).toBeInTheDocument(); // In progress tickets
    });
  });

  it('displays loading state initially', () => {
    mockTicketService.getStats.mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );
    mockTicketService.getTickets.mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );
    
    render(<Dashboard />, {
      authContextValue: mockAuthContextValues.endUser,
    });
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays error message when API call fails', async () => {
    const errorMessage = 'Failed to fetch dashboard data';
    mockTicketService.getTickets.mockRejectedValue(new Error(errorMessage));
    
    render(<Dashboard />, {
      authContextValue: mockAuthContextValues.endUser,
    });
    
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('displays recent tickets correctly', async () => {
    render(<Dashboard />, {
      authContextValue: mockAuthContextValues.endUser,
    });
    
    await waitFor(() => {
      expect(screen.getByText('Login Issues')).toBeInTheDocument();
      expect(screen.getByText('Software Installation')).toBeInTheDocument();
    });
  });

  it('navigates to ticket detail when ticket is clicked', async () => {
    const user = userEvent.setup();
    render(<Dashboard />, {
      authContextValue: mockAuthContextValues.endUser,
    });
    
    await waitFor(() => {
      expect(screen.getByText('Login Issues')).toBeInTheDocument();
    });
    
    const ticketItem = screen.getByText('Login Issues');
    await user.click(ticketItem);
    
    expect(mockNavigate).toHaveBeenCalledWith('/tickets/1');
  });

  it('navigates to create ticket when create button is clicked', async () => {
    const user = userEvent.setup();
    render(<Dashboard />, {
      authContextValue: mockAuthContextValues.endUser,
    });
    
    const createButton = screen.getByRole('button', { name: /create new ticket/i });
    await user.click(createButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/tickets/new');
  });

  it('navigates to all tickets when view all button is clicked', async () => {
    const user = userEvent.setup();
    render(<Dashboard />, {
      authContextValue: mockAuthContextValues.endUser,
    });
    
    await waitFor(() => {
      expect(screen.getByText('Recent Tickets')).toBeInTheDocument();
    });
    
    const viewAllButton = screen.getByRole('button', { name: /view all tickets/i });
    await user.click(viewAllButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/tickets');
  });

  it('displays correct statistics for IT users', async () => {
    render(<Dashboard />, {
      authContextValue: mockAuthContextValues.itUser,
    });
    
    await waitFor(() => {
      // Check for statistic cards
      expect(screen.getByText('Total Tickets')).toBeInTheDocument();
      expect(screen.getByText('Open Tickets')).toBeInTheDocument();
      expect(screen.getByText('In Progress')).toBeInTheDocument();
      expect(screen.getByText('Resolved')).toBeInTheDocument();
      expect(screen.getByText('Closed')).toBeInTheDocument();
      
      // Check for statistic values
      expect(screen.getByText('10')).toBeInTheDocument(); // Total
      expect(screen.getByText('3')).toBeInTheDocument(); // Open
      expect(screen.getByText('4')).toBeInTheDocument(); // In progress
      expect(screen.getByText('2')).toBeInTheDocument(); // Resolved
      expect(screen.getByText('1')).toBeInTheDocument(); // Closed
    });
  });

  it('does not show statistics for end users', () => {
    render(<Dashboard />, {
      authContextValue: mockAuthContextValues.endUser,
    });
    
    expect(screen.queryByText('Ticket Statistics')).not.toBeInTheDocument();
    expect(screen.queryByText('Total Tickets')).not.toBeInTheDocument();
  });

  it('shows appropriate message when no recent tickets', async () => {
    mockTicketService.getTickets.mockResolvedValue({
      data: {
        tickets: [],
        totalCount: 0,
        page: 1,
        totalPages: 0,
      },
    });
    
    render(<Dashboard />, {
      authContextValue: mockAuthContextValues.endUser,
    });
    
    await waitFor(() => {
      expect(screen.getByText(/no recent tickets/i)).toBeInTheDocument();
    });
  });

  it('displays correct greeting based on time of day', () => {
    // Mock Date to return specific time
    const mockDate = new Date('2024-01-01T10:00:00Z');
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);
    
    render(<Dashboard />, {
      authContextValue: mockAuthContextValues.endUser,
    });
    
    expect(screen.getByText(/good morning, john/i)).toBeInTheDocument();
    
    global.Date.mockRestore();
  });

  it('refreshes data when refresh button is clicked', async () => {
    const user = userEvent.setup();
    render(<Dashboard />, {
      authContextValue: mockAuthContextValues.itUser,
    });
    
    await waitFor(() => {
      expect(mockTicketService.getStats).toHaveBeenCalledTimes(1);
      expect(mockTicketService.getTickets).toHaveBeenCalledTimes(1);
    });
    
    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    await user.click(refreshButton);
    
    expect(mockTicketService.getStats).toHaveBeenCalledTimes(2);
    expect(mockTicketService.getTickets).toHaveBeenCalledTimes(2);
  });

  it('displays quick actions section', () => {
    render(<Dashboard />, {
      authContextValue: mockAuthContextValues.endUser,
    });
    
    expect(screen.getByText('Quick Actions')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create new ticket/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /view all tickets/i })).toBeInTheDocument();
  });
});
