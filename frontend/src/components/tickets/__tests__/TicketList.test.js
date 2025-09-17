import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render, mockAuthContextValues, mockApiResponses } from '../../utils/testUtils';
import TicketList from '../TicketList';
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

describe('TicketList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTicketService.getTickets.mockResolvedValue(mockApiResponses.tickets.getTickets);
  });

  it('renders ticket list correctly for end user', async () => {
    render(<TicketList />, {
      authContextValue: mockAuthContextValues.endUser,
    });
    
    expect(screen.getByRole('heading', { name: /tickets/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create ticket/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Login Issues')).toBeInTheDocument();
      expect(screen.getByText('Software Installation')).toBeInTheDocument();
    });
  });

  it('renders ticket list correctly for IT user with additional columns', async () => {
    render(<TicketList />, {
      authContextValue: mockAuthContextValues.itUser,
    });
    
    await waitFor(() => {
      expect(screen.getByText('Assigned To')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });
  });

  it('displays loading state initially', () => {
    mockTicketService.getTickets.mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );
    
    render(<TicketList />, {
      authContextValue: mockAuthContextValues.endUser,
    });
    
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays error message when API call fails', async () => {
    const errorMessage = 'Failed to fetch tickets';
    mockTicketService.getTickets.mockRejectedValue(new Error(errorMessage));
    
    render(<TicketList />, {
      authContextValue: mockAuthContextValues.endUser,
    });
    
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('filters tickets by search term', async () => {
    const user = userEvent.setup();
    render(<TicketList />, {
      authContextValue: mockAuthContextValues.endUser,
    });
    
    await waitFor(() => {
      expect(screen.getByText('Login Issues')).toBeInTheDocument();
    });
    
    const searchInput = screen.getByPlaceholderText(/search by title or description/i);
    await user.type(searchInput, 'login');
    
    await waitFor(() => {
      expect(mockTicketService.getTickets).toHaveBeenCalledWith(
        expect.objectContaining({
          search: 'login',
        })
      );
    });
  });

  it('filters tickets by status', async () => {
    const user = userEvent.setup();
    render(<TicketList />, {
      authContextValue: mockAuthContextValues.endUser,
    });
    
    await waitFor(() => {
      expect(screen.getByText('Login Issues')).toBeInTheDocument();
    });
    
    const statusSelect = screen.getByLabelText(/status/i);
    await user.click(statusSelect);
    
    const openOption = screen.getByText('OPEN');
    await user.click(openOption);
    
    await waitFor(() => {
      expect(mockTicketService.getTickets).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'open',
        })
      );
    });
  });

  it('filters tickets by priority', async () => {
    const user = userEvent.setup();
    render(<TicketList />, {
      authContextValue: mockAuthContextValues.endUser,
    });
    
    await waitFor(() => {
      expect(screen.getByText('Login Issues')).toBeInTheDocument();
    });
    
    const prioritySelect = screen.getByLabelText(/priority/i);
    await user.click(prioritySelect);
    
    const highOption = screen.getByText('HIGH');
    await user.click(highOption);
    
    await waitFor(() => {
      expect(mockTicketService.getTickets).toHaveBeenCalledWith(
        expect.objectContaining({
          priority: 'high',
        })
      );
    });
  });

  it('navigates to ticket detail when view button is clicked', async () => {
    const user = userEvent.setup();
    render(<TicketList />, {
      authContextValue: mockAuthContextValues.endUser,
    });
    
    await waitFor(() => {
      expect(screen.getByText('Login Issues')).toBeInTheDocument();
    });
    
    const viewButtons = screen.getAllByTitle('View Details');
    await user.click(viewButtons[0]);
    
    expect(mockNavigate).toHaveBeenCalledWith('/tickets/1');
  });

  it('navigates to create ticket when create button is clicked', async () => {
    const user = userEvent.setup();
    render(<TicketList />, {
      authContextValue: mockAuthContextValues.endUser,
    });
    
    const createButton = screen.getByRole('button', { name: /create ticket/i });
    await user.click(createButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/tickets/new');
  });

  it('refreshes tickets when refresh button is clicked', async () => {
    const user = userEvent.setup();
    render(<TicketList />, {
      authContextValue: mockAuthContextValues.endUser,
    });
    
    await waitFor(() => {
      expect(mockTicketService.getTickets).toHaveBeenCalledTimes(1);
    });
    
    const refreshButton = screen.getByRole('button', { name: /refresh/i });
    await user.click(refreshButton);
    
    expect(mockTicketService.getTickets).toHaveBeenCalledTimes(2);
  });

  it('handles pagination correctly', async () => {
    const user = userEvent.setup();
    render(<TicketList />, {
      authContextValue: mockAuthContextValues.endUser,
    });
    
    await waitFor(() => {
      expect(screen.getByText('Login Issues')).toBeInTheDocument();
    });
    
    // Mock pagination response
    mockTicketService.getTickets.mockResolvedValue({
      data: {
        tickets: [],
        totalCount: 50,
        page: 2,
        totalPages: 5,
      },
    });
    
    const rowsPerPageSelect = screen.getByRole('combobox', { name: /rows per page/i });
    await user.click(rowsPerPageSelect);
    
    const option25 = screen.getByText('25');
    await user.click(option25);
    
    await waitFor(() => {
      expect(mockTicketService.getTickets).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 1,
          limit: 25,
        })
      );
    });
  });

  it('displays "No tickets found" when no tickets are returned', async () => {
    mockTicketService.getTickets.mockResolvedValue({
      data: {
        tickets: [],
        totalCount: 0,
        page: 1,
        totalPages: 0,
      },
    });
    
    render(<TicketList />, {
      authContextValue: mockAuthContextValues.endUser,
    });
    
    await waitFor(() => {
      expect(screen.getByText('No tickets found')).toBeInTheDocument();
    });
  });
});
