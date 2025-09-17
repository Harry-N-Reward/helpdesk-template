import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  Chip,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Stack,
  Card,
  CardContent,
  Avatar,
  Divider,
  InputAdornment,
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Assignment as TicketIcon,
} from '@mui/icons-material';

import { useAuth } from '../../contexts/AuthContext';
import { ticketService } from '../../services/api';
import { TICKET_STATUSES, TICKET_PRIORITIES, USER_ROLES } from '../../utils/constants';
import { formatDateTime } from '../../utils/helpers';

const statusColors = {
  [TICKET_STATUSES.OPEN]: { 
    color: 'error', 
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    bgColor: 'rgba(244, 67, 54, 0.1)'
  },
  [TICKET_STATUSES.IN_PROGRESS]: { 
    color: 'warning', 
    gradient: 'linear-gradient(135deg, #ffc3a0 0%, #ffafbd 100%)',
    bgColor: 'rgba(255, 152, 0, 0.1)'
  },
  [TICKET_STATUSES.RESOLVED]: { 
    color: 'info', 
    gradient: 'linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)',
    bgColor: 'rgba(33, 150, 243, 0.1)'
  },
  [TICKET_STATUSES.CLOSED]: { 
    color: 'success', 
    gradient: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
    bgColor: 'rgba(76, 175, 80, 0.1)'
  },
};

const priorityColors = {
  [TICKET_PRIORITIES.LOW]: { 
    color: 'default', 
    gradient: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
    bgColor: 'rgba(158, 158, 158, 0.1)'
  },
  [TICKET_PRIORITIES.MEDIUM]: { 
    color: 'primary', 
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    bgColor: 'rgba(63, 81, 181, 0.1)'
  },
  [TICKET_PRIORITIES.HIGH]: { 
    color: 'warning', 
    gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
    bgColor: 'rgba(255, 152, 0, 0.1)'
  },
  [TICKET_PRIORITIES.CRITICAL]: { 
    color: 'error', 
    gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
    bgColor: 'rgba(244, 67, 54, 0.1)'
  },
};

const TicketList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    priority: '',
    assignedTo: '',
  });

  const isITUser = user?.role === USER_ROLES.IT_USER || user?.role === USER_ROLES.IT_ADMIN;

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError('');
      
      const queryParams = {
        page: page + 1,
        limit: rowsPerPage,
        ...filters,
      };

      // Remove empty filters
      Object.keys(queryParams).forEach(key => {
        if (queryParams[key] === '') {
          delete queryParams[key];
        }
      });

      const response = await ticketService.getTickets(queryParams);
      setTickets(response.data.tickets);
      setTotalCount(response.data.totalCount);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [page, rowsPerPage, filters]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
    }));
    setPage(0);
  };

  const handleViewTicket = (ticketId) => {
    navigate(`/tickets/${ticketId}`);
  };

  const handleCreateTicket = () => {
    navigate('/tickets/new');
  };

  const columns = [
    { id: 'id', label: 'ID', minWidth: 80 },
    { id: 'title', label: 'Title', minWidth: 200 },
    { id: 'status', label: 'Status', minWidth: 120 },
    { id: 'priority', label: 'Priority', minWidth: 120 },
    { id: 'category', label: 'Category', minWidth: 120 },
    { id: 'createdBy', label: 'Created By', minWidth: 150 },
    ...(isITUser ? [{ id: 'assignedTo', label: 'Assigned To', minWidth: 150 }] : []),
    { id: 'createdAt', label: 'Created', minWidth: 180 },
    { id: 'actions', label: 'Actions', minWidth: 120, align: 'center' },
  ];

  const renderTicketRow = (ticket) => (
    <TableRow 
      hover 
      key={ticket.id}
      sx={{
        '&:hover': {
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
          transform: 'scale(1.01)',
          transition: 'all 0.2s ease',
        },
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
      onClick={() => handleViewTicket(ticket.id)}
    >
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar
            sx={{
              width: 32,
              height: 32,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            #{ticket.id}
          </Avatar>
        </Box>
      </TableCell>
      <TableCell>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
            {ticket.title}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            {ticket.description?.substring(0, 80)}
            {ticket.description?.length > 80 ? '...' : ''}
          </Typography>
        </Box>
      </TableCell>
      <TableCell>
        <Chip
          label={ticket.status.replace('_', ' ').toUpperCase()}
          sx={{
            background: statusColors[ticket.status].gradient,
            color: 'white',
            fontWeight: 600,
            fontSize: '0.75rem',
            '&:hover': {
              transform: 'scale(1.05)',
              transition: 'transform 0.2s ease',
            },
          }}
          size="small"
        />
      </TableCell>
      <TableCell>
        <Chip
          label={ticket.priority.toUpperCase()}
          sx={{
            background: priorityColors[ticket.priority].gradient,
            color: 'white',
            fontWeight: 600,
            fontSize: '0.75rem',
            '&:hover': {
              transform: 'scale(1.05)',
              transition: 'transform 0.2s ease',
            },
          }}
          size="small"
          variant="filled"
        />
      </TableCell>
      <TableCell>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {ticket.category.replace('_', ' ').toUpperCase()}
        </Typography>
      </TableCell>
      <TableCell>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
            {ticket.User?.firstName?.charAt(0)}{ticket.User?.lastName?.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {ticket.User?.firstName} {ticket.User?.lastName}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {ticket.User?.email}
            </Typography>
          </Box>
        </Box>
      </TableCell>
      {isITUser && (
        <TableCell>
          {ticket.AssignedUser ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ width: 32, height: 32, fontSize: '0.875rem' }}>
                {ticket.AssignedUser.firstName?.charAt(0)}{ticket.AssignedUser.lastName?.charAt(0)}
              </Avatar>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {ticket.AssignedUser.firstName} {ticket.AssignedUser.lastName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {ticket.AssignedUser.email}
                </Typography>
              </Box>
            </Box>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
              Unassigned
            </Typography>
          )}
        </TableCell>
      )}
      <TableCell>
        <Typography variant="body2" sx={{ fontWeight: 500 }}>
          {formatDateTime(ticket.createdAt)}
        </Typography>
      </TableCell>
      <TableCell align="center" onClick={(e) => e.stopPropagation()}>
        <Stack direction="row" spacing={1} justifyContent="center">
          <Tooltip title="View Details">
            <IconButton
              size="small"
              onClick={() => handleViewTicket(ticket.id)}
              sx={{
                color: 'primary.main',
                '&:hover': {
                  background: 'rgba(102, 126, 234, 0.1)',
                  transform: 'scale(1.1)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {(isITUser || ticket.createdBy === user?.id) && (
            <Tooltip title="Edit Ticket">
              <IconButton
                size="small"
                onClick={() => navigate(`/tickets/${ticket.id}?edit=true`)}
                sx={{
                  color: 'secondary.main',
                  '&:hover': {
                    background: 'rgba(118, 75, 162, 0.1)',
                    transform: 'scale(1.1)',
                  },
                  transition: 'all 0.2s ease',
                }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Stack>
      </TableCell>
    </TableRow>
  );

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Card
        sx={{
          mb: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: '16px',
          overflow: 'visible',
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                sx={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  width: 56,
                  height: 56,
                }}
              >
                <TicketIcon sx={{ fontSize: 28 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Tickets
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Manage and track support tickets
                </Typography>
              </Box>
            </Box>
            
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchTickets}
                disabled={loading}
                sx={{
                  borderColor: 'rgba(255, 255, 255, 0.3)',
                  color: 'white',
                  '&:hover': {
                    borderColor: 'rgba(255, 255, 255, 0.5)',
                    background: 'rgba(255, 255, 255, 0.1)',
                  },
                }}
              >
                Refresh
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateTicket}
                sx={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(10px)',
                  color: 'white',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.3)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s ease',
                }}
              >
                Create Ticket
              </Button>
            </Stack>
          </Box>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card sx={{ mb: 3, borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <FilterIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Filters
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <TextField
              label="Search tickets"
              variant="outlined"
              size="small"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search by title or description..."
              sx={{ 
                minWidth: 250,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="primary" />
                  </InputAdornment>
                ),
              }}
            />
            
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => handleFilterChange('status', e.target.value)}
                sx={{
                  borderRadius: '12px',
                }}
              >
                <MenuItem value="">All Statuses</MenuItem>
                {Object.values(TICKET_STATUSES).map((status) => (
                  <MenuItem key={status} value={status}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          background: statusColors[status].gradient,
                        }}
                      />
                      {status.replace('_', ' ').toUpperCase()}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel>Priority</InputLabel>
              <Select
                value={filters.priority}
                label="Priority"
                onChange={(e) => handleFilterChange('priority', e.target.value)}
                sx={{
                  borderRadius: '12px',
                }}
              >
                <MenuItem value="">All Priorities</MenuItem>
                {Object.values(TICKET_PRIORITIES).map((priority) => (
                  <MenuItem key={priority} value={priority}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          background: priorityColors[priority].gradient,
                        }}
                      />
                      {priority.toUpperCase()}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>
        </CardContent>
      </Card>

      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3, 
            borderRadius: '12px',
            '& .MuiAlert-icon': {
              fontSize: '1.2rem',
            },
          }}
        >
          {error}
        </Alert>
      )}

      <Card sx={{ borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
        <TableContainer>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    style={{ minWidth: column.minWidth }}
                    sx={{
                      background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                      fontWeight: 600,
                      fontSize: '0.875rem',
                      color: 'text.primary',
                    }}
                  >
                    {column.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} align="center" sx={{ py: 6 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <CircularProgress size={40} />
                      <Typography variant="body1" color="text.secondary">
                        Loading tickets...
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : tickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} align="center" sx={{ py: 6 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <TicketIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
                      <Typography variant="h6" color="text.secondary">
                        No tickets found
                      </Typography>
                      <Typography variant="body2" color="text.disabled">
                        {filters.search || filters.status || filters.priority 
                          ? 'Try adjusting your filters or search terms'
                          : 'Create your first ticket to get started'
                        }
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                tickets.map(renderTicketRow)
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <Divider />
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={totalCount}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{
            '& .MuiTablePagination-toolbar': {
              px: 3,
            },
          }}
        />
      </Card>
    </Box>
  );
};

export default TicketList;
