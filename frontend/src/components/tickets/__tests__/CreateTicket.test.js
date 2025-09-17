import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render, mockAuthContextValues, mockApiResponses } from '../../utils/testUtils';
import CreateTicket from '../CreateTicket';
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

describe('CreateTicket Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTicketService.createTicket.mockResolvedValue(mockApiResponses.tickets.createTicket);
  });

  it('renders create ticket form correctly', () => {
    render(<CreateTicket />, {
      authContextValue: mockAuthContextValues.endUser,
    });
    
    expect(screen.getByRole('heading', { name: /create new ticket/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/priority/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create ticket/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('displays priority guidelines', () => {
    render(<CreateTicket />, {
      authContextValue: mockAuthContextValues.endUser,
    });
    
    expect(screen.getByText(/priority guidelines/i)).toBeInTheDocument();
    expect(screen.getByText(/low.*minor issues/i)).toBeInTheDocument();
    expect(screen.getByText(/medium.*moderately affect/i)).toBeInTheDocument();
    expect(screen.getByText(/high.*significantly impact/i)).toBeInTheDocument();
    expect(screen.getByText(/critical.*system down/i)).toBeInTheDocument();
  });

  it('displays validation errors for empty required fields', async () => {
    const user = userEvent.setup();
    render(<CreateTicket />, {
      authContextValue: mockAuthContextValues.endUser,
    });
    
    const submitButton = screen.getByRole('button', { name: /create ticket/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/title is required/i)).toBeInTheDocument();
      expect(screen.getByText(/description is required/i)).toBeInTheDocument();
      expect(screen.getByText(/category is required/i)).toBeInTheDocument();
    });
  });

  it('displays validation error for short title', async () => {
    const user = userEvent.setup();
    render(<CreateTicket />, {
      authContextValue: mockAuthContextValues.endUser,
    });
    
    const titleInput = screen.getByLabelText(/title/i);
    await user.type(titleInput, 'Hi');
    
    const submitButton = screen.getByRole('button', { name: /create ticket/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/title must be at least 5 characters/i)).toBeInTheDocument();
    });
  });

  it('displays validation error for short description', async () => {
    const user = userEvent.setup();
    render(<CreateTicket />, {
      authContextValue: mockAuthContextValues.endUser,
    });
    
    const descriptionInput = screen.getByLabelText(/description/i);
    await user.type(descriptionInput, 'Short');
    
    const submitButton = screen.getByRole('button', { name: /create ticket/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/description must be at least 10 characters/i)).toBeInTheDocument();
    });
  });

  it('creates ticket with valid data', async () => {
    const user = userEvent.setup();
    render(<CreateTicket />, {
      authContextValue: mockAuthContextValues.endUser,
    });
    
    // Fill out the form
    await user.type(screen.getByLabelText(/title/i), 'Test Ticket Title');
    await user.type(screen.getByLabelText(/description/i), 'This is a detailed description of the issue.');
    
    // Select category
    const categorySelect = screen.getByLabelText(/category/i);
    await user.click(categorySelect);
    await user.click(screen.getByText('HARDWARE'));
    
    // Select priority
    const prioritySelect = screen.getByLabelText(/priority/i);
    await user.click(prioritySelect);
    await user.click(screen.getByText('HIGH'));
    
    const submitButton = screen.getByRole('button', { name: /create ticket/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(mockTicketService.createTicket).toHaveBeenCalledWith({
        title: 'Test Ticket Title',
        description: 'This is a detailed description of the issue.',
        category: 'hardware',
        priority: 'high',
      });
    });
    
    // Should navigate to the created ticket
    expect(mockNavigate).toHaveBeenCalledWith('/tickets/999');
  });

  it('displays error message on creation failure', async () => {
    const user = userEvent.setup();
    const errorMessage = 'Failed to create ticket';
    mockTicketService.createTicket.mockRejectedValue(new Error(errorMessage));
    
    render(<CreateTicket />, {
      authContextValue: mockAuthContextValues.endUser,
    });
    
    // Fill out the form
    await user.type(screen.getByLabelText(/title/i), 'Test Ticket Title');
    await user.type(screen.getByLabelText(/description/i), 'This is a detailed description of the issue.');
    
    const categorySelect = screen.getByLabelText(/category/i);
    await user.click(categorySelect);
    await user.click(screen.getByText('SOFTWARE'));
    
    const submitButton = screen.getByRole('button', { name: /create ticket/i });
    await user.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('shows loading state during creation', async () => {
    const user = userEvent.setup();
    mockTicketService.createTicket.mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 100))
    );
    
    render(<CreateTicket />, {
      authContextValue: mockAuthContextValues.endUser,
    });
    
    // Fill out the form
    await user.type(screen.getByLabelText(/title/i), 'Test Ticket Title');
    await user.type(screen.getByLabelText(/description/i), 'This is a detailed description of the issue.');
    
    const categorySelect = screen.getByLabelText(/category/i);
    await user.click(categorySelect);
    await user.click(screen.getByText('SOFTWARE'));
    
    const submitButton = screen.getByRole('button', { name: /create ticket/i });
    await user.click(submitButton);
    
    expect(screen.getByText(/creating/i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it('navigates back to tickets list when cancel button is clicked', async () => {
    const user = userEvent.setup();
    render(<CreateTicket />, {
      authContextValue: mockAuthContextValues.endUser,
    });
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await user.click(cancelButton);
    
    expect(mockNavigate).toHaveBeenCalledWith('/tickets');
  });

  it('has medium priority selected by default', () => {
    render(<CreateTicket />, {
      authContextValue: mockAuthContextValues.endUser,
    });
    
    const prioritySelect = screen.getByDisplayValue('MEDIUM');
    expect(prioritySelect).toBeInTheDocument();
  });

  it('displays all category options', async () => {
    const user = userEvent.setup();
    render(<CreateTicket />, {
      authContextValue: mockAuthContextValues.endUser,
    });
    
    const categorySelect = screen.getByLabelText(/category/i);
    await user.click(categorySelect);
    
    expect(screen.getByText('HARDWARE')).toBeInTheDocument();
    expect(screen.getByText('SOFTWARE')).toBeInTheDocument();
    expect(screen.getByText('NETWORK')).toBeInTheDocument();
    expect(screen.getByText('ACCESS')).toBeInTheDocument();
    expect(screen.getByText('OTHER')).toBeInTheDocument();
  });

  it('displays all priority options', async () => {
    const user = userEvent.setup();
    render(<CreateTicket />, {
      authContextValue: mockAuthContextValues.endUser,
    });
    
    const prioritySelect = screen.getByLabelText(/priority/i);
    await user.click(prioritySelect);
    
    expect(screen.getByText('LOW')).toBeInTheDocument();
    expect(screen.getByText('MEDIUM')).toBeInTheDocument();
    expect(screen.getByText('HIGH')).toBeInTheDocument();
    expect(screen.getByText('CRITICAL')).toBeInTheDocument();
  });
});
