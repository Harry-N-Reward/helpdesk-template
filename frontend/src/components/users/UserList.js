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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Card,
  CardContent,
  Avatar,
  Divider,
  InputAdornment,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  PersonAdd as PersonAddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  People as PeopleIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
  Support as SupportIcon,
} from '@mui/icons-material';

import { useAuth } from '../../contexts/AuthContext';
import { userService } from '../../services/api';
import { USER_ROLES } from '../../utils/constants';
import { formatDateTime } from '../../utils/helpers';

const roleColors = {
  [USER_ROLES.END_USER]: { 
    color: 'default', 
    gradient: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
    icon: PersonIcon,
    bgColor: 'rgba(158, 158, 158, 0.1)'
  },
  [USER_ROLES.IT_USER]: { 
    color: 'primary', 
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    icon: SupportIcon,
    bgColor: 'rgba(63, 81, 181, 0.1)'
  },
  [USER_ROLES.IT_ADMIN]: { 
    color: 'secondary', 
    gradient: 'linear-gradient(135deg, #ffc3a0 0%, #ffafbd 100%)',
    icon: AdminIcon,
    bgColor: 'rgba(156, 39, 176, 0.1)'
  },
};

const roleLabels = {
  [USER_ROLES.END_USER]: 'End User',
  [USER_ROLES.IT_USER]: 'IT Support',
  [USER_ROLES.IT_ADMIN]: 'IT Administrator',
};

const UserList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: '',
  });

  const isITAdmin = user?.role === USER_ROLES.IT_ADMIN;

  const fetchUsers = async () => {
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

      const response = await userService.getUsers(queryParams);
      setUsers(response.data.users);
      setTotalCount(response.data.totalCount);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
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

  const handleViewUser = (userId) => {
    navigate(`/users/${userId}`);
  };

  const handleEditUser = (userId) => {
    navigate(`/users/${userId}/edit`);
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      setIsDeleting(true);
      await userService.deleteUser(userToDelete.id);
      
      // Refresh the user list
      await fetchUsers();
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeleteDialog = (userData) => {
    setUserToDelete(userData);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const columns = [
    { id: 'id', label: 'ID', minWidth: 80 },
    { id: 'name', label: 'Name', minWidth: 200 },
    { id: 'email', label: 'Email', minWidth: 250 },
    { id: 'role', label: 'Role', minWidth: 120 },
    { id: 'department', label: 'Department', minWidth: 150 },
    { id: 'isActive', label: 'Status', minWidth: 100 },
    { id: 'createdAt', label: 'Created', minWidth: 180 },
    { id: 'actions', label: 'Actions', minWidth: 150, align: 'center' },
  ];

  const renderUserRow = (userData) => {
    const RoleIcon = roleColors[userData.role].icon;
    
    return (
      <TableRow 
        hover 
        key={userData.id}
        sx={{
          '&:hover': {
            background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
            transform: 'scale(1.01)',
            transition: 'all 0.2s ease',
          },
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        onClick={() => handleViewUser(userData.id)}
      >
        <TableCell>
          <Avatar
            sx={{
              width: 32,
              height: 32,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              fontSize: '0.875rem',
              fontWeight: 600,
            }}
          >
            #{userData.id}
          </Avatar>
        </TableCell>
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ width: 40, height: 40, fontSize: '0.875rem' }}>
              {userData.firstName?.charAt(0)}{userData.lastName?.charAt(0)}
            </Avatar>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {userData.firstName} {userData.lastName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {userData.department || 'No department'}
              </Typography>
            </Box>
          </Box>
        </TableCell>
        <TableCell>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {userData.email}
          </Typography>
        </TableCell>
        <TableCell>
          <Chip
            icon={<RoleIcon fontSize="small" />}
            label={roleLabels[userData.role]}
            sx={{
              background: roleColors[userData.role].gradient,
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
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {userData.department || '-'}
          </Typography>
        </TableCell>
        <TableCell>
          <Chip
            label={userData.isActive ? 'Active' : 'Inactive'}
            sx={{
              background: userData.isActive 
                ? 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)'
                : 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
              color: 'white',
              fontWeight: 600,
              fontSize: '0.75rem',
            }}
            size="small"
          />
        </TableCell>
        <TableCell>
          <Typography variant="body2" sx={{ fontWeight: 500 }}>
            {formatDateTime(userData.createdAt)}
          </Typography>
        </TableCell>
        <TableCell align="center" onClick={(e) => e.stopPropagation()}>
          <Stack direction="row" spacing={1} justifyContent="center">
            <Tooltip title="View Details">
              <IconButton
                size="small"
                onClick={() => handleViewUser(userData.id)}
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
            {isITAdmin && (
              <>
                <Tooltip title="Edit User">
                  <IconButton
                    size="small"
                    onClick={() => handleEditUser(userData.id)}
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
                {userData.id !== user?.id && (
                  <Tooltip title="Delete User">
                    <IconButton
                      size="small"
                      onClick={() => openDeleteDialog(userData)}
                      sx={{
                        color: 'error.main',
                        '&:hover': {
                          background: 'rgba(244, 67, 54, 0.1)',
                          transform: 'scale(1.1)',
                        },
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                )}
              </>
            )}
          </Stack>
        </TableCell>
      </TableRow>
    );
  };

  // Only IT Admins can access user management
  if (!isITAdmin) {
    return (
      <Box sx={{ p: 3 }}>
        <Card sx={{ borderRadius: '16px', textAlign: 'center', py: 4 }}>
          <CardContent>
            <AdminIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h5" sx={{ mb: 1, fontWeight: 600 }}>
              Access Restricted
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Only IT Administrators can access user management.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Card
        sx={{
          mb: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: '16px',
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
                <PeopleIcon sx={{ fontSize: 28 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 700, mb: 0.5 }}>
                  User Management
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Manage system users and permissions
                </Typography>
              </Box>
            </Box>
            
            <Stack direction="row" spacing={2}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={fetchUsers}
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
                startIcon={<PersonAddIcon />}
                onClick={() => navigate('/users/new')}
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
                Add User
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
              label="Search users"
              variant="outlined"
              size="small"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search by name or email..."
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
              <InputLabel>Role</InputLabel>
              <Select
                value={filters.role}
                label="Role"
                onChange={(e) => handleFilterChange('role', e.target.value)}
                sx={{
                  borderRadius: '12px',
                }}
              >
                <MenuItem value="">All Roles</MenuItem>
                {Object.entries(roleLabels).map(([value, label]) => (
                  <MenuItem key={value} value={value}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Box
                        sx={{
                          width: 12,
                          height: 12,
                          borderRadius: '50%',
                          background: roleColors[value].gradient,
                        }}
                      />
                      {label}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={filters.status}
                label="Status"
                onChange={(e) => handleFilterChange('status', e.target.value)}
                sx={{
                  borderRadius: '12px',
                }}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="active">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
                      }}
                    />
                    Active
                  </Box>
                </MenuItem>
                <MenuItem value="inactive">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)',
                      }}
                    />
                    Inactive
                  </Box>
                </MenuItem>
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
                        Loading users...
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} align="center" sx={{ py: 6 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <PeopleIcon sx={{ fontSize: 48, color: 'text.disabled' }} />
                      <Typography variant="h6" color="text.secondary">
                        No users found
                      </Typography>
                      <Typography variant="body2" color="text.disabled">
                        {filters.search || filters.role || filters.status 
                          ? 'Try adjusting your filters or search terms'
                          : 'No users have been created yet'
                        }
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                users.map(renderUserRow)
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

      {/* Delete Confirmation Dialog */}
      <Dialog 
        open={deleteDialogOpen} 
        onClose={closeDeleteDialog}
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: '16px',
            minWidth: 400,
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DeleteIcon color="error" />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Delete User
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Are you sure you want to delete the following user?
          </Typography>
          <Card sx={{ background: 'rgba(244, 67, 54, 0.05)', border: '1px solid rgba(244, 67, 54, 0.2)', borderRadius: '8px' }}>
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar>
                  {userToDelete?.firstName?.charAt(0)}{userToDelete?.lastName?.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {userToDelete?.firstName} {userToDelete?.lastName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {userToDelete?.email}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button 
            onClick={closeDeleteDialog} 
            disabled={isDeleting}
            sx={{ borderRadius: '8px' }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteUser}
            color="error"
            variant="contained"
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={20} sx={{ color: 'white' }} /> : <DeleteIcon />}
            sx={{ 
              borderRadius: '8px',
              '&:hover': {
                transform: 'translateY(-1px)',
              },
              transition: 'transform 0.2s ease',
            }}
          >
            {isDeleting ? 'Deleting...' : 'Delete User'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserList;
