import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  CircularProgress,
  Stack,
  Switch,
  FormControlLabel,
  Card,
  CardContent,
  Grid,
  Divider,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  ArrowBack as BackIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Work as WorkIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

import { useAuth } from '../../contexts/AuthContext';
import { userService, ticketService } from '../../services/api';
import { USER_ROLES } from '../../utils/constants';
import { formatDateTime } from '../../utils/helpers';

const validationSchema = Yup.object({
  firstName: Yup.string()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must not exceed 50 characters'),
  lastName: Yup.string()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must not exceed 50 characters'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  department: Yup.string()
    .max(100, 'Department must not exceed 100 characters'),
  role: Yup.string()
    .required('Role is required')
    .oneOf(Object.values(USER_ROLES), 'Invalid role'),
});

const passwordValidationSchema = Yup.object({
  currentPassword: Yup.string()
    .required('Current password is required'),
  newPassword: Yup.string()
    .required('New password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    ),
  confirmPassword: Yup.string()
    .required('Please confirm your password')
    .oneOf([Yup.ref('newPassword'), null], 'Passwords must match'),
});

const roleLabels = {
  [USER_ROLES.END_USER]: 'End User',
  [USER_ROLES.IT_USER]: 'IT User',
  [USER_ROLES.IT_ADMIN]: 'IT Admin',
};

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  
  const [user, setUser] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Determine if this is the current user's profile or another user's
  const isOwnProfile = !id || id === currentUser?.id?.toString();
  const userId = isOwnProfile ? currentUser?.id : parseInt(id);
  
  const isITAdmin = currentUser?.role === USER_ROLES.IT_ADMIN;
  const canEdit = isOwnProfile || isITAdmin;
  const canEditRole = isITAdmin && !isOwnProfile;

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError('');
      
      if (isOwnProfile) {
        // For own profile, user data is already in context
        setUser(currentUser);
      } else {
        // Fetch other user's data
        const response = await userService.getUser(userId);
        setUser(response.data);
      }
      
      // Fetch user statistics
      const statsResponse = await userService.getUserStats(userId);
      setUserStats(statsResponse.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch user data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [userId, isOwnProfile]);

  const handleProfileUpdate = async (values) => {
    try {
      setIsSubmitting(true);
      setSubmitError('');

      await userService.updateUser(userId, values);
      
      // Refresh user data
      await fetchUser();
      setIsEditing(false);
    } catch (error) {
      setSubmitError(
        error.response?.data?.message || 'Failed to update profile'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordChange = async (values) => {
    try {
      setIsSubmitting(true);
      setSubmitError('');

      await userService.changePassword(userId, {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      
      setIsChangingPassword(false);
      // Show success message or redirect
    } catch (error) {
      setSubmitError(
        error.response?.data?.message || 'Failed to change password'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="400px"
        className="gradient-bg"
      >
        <CircularProgress size={60} sx={{ color: 'primary.main' }} />
      </Box>
    );
  }

  if (error || !user) {
    return (
      <Box className="gradient-bg" sx={{ minHeight: '100vh', p: 3 }}>
        <Alert 
          severity="error" 
          sx={{ 
            mb: 2,
            background: 'linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(244, 67, 54, 0.05) 100%)',
            backdropFilter: 'blur(10px)',
            borderRadius: 2,
            border: '1px solid rgba(244, 67, 54, 0.2)'
          }}
        >
          {error || 'User not found'}
        </Alert>
        {!isOwnProfile && (
          <Button 
            variant="outlined" 
            startIcon={<BackIcon />} 
            onClick={() => navigate('/users')}
            className="glass-button"
          >
            Back to Users
          </Button>
        )}
      </Box>
    );
  }

  return (
    <Box className="gradient-bg" sx={{ minHeight: '100vh', p: 3 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Stack direction="row" alignItems="center" spacing={2}>
          {!isOwnProfile && (
            <IconButton 
              onClick={() => navigate('/users')}
              className="glass-button"
              sx={{ mr: 1 }}
            >
              <BackIcon />
            </IconButton>
          )}
          <Typography 
            variant="h4" 
            component="h1"
            sx={{ 
              fontWeight: 600,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            <PersonIcon sx={{ color: 'primary.main' }} />
            {isOwnProfile ? 'My Profile' : 'User Profile'}
          </Typography>
          <Chip
            label={roleLabels[user.role]}
            color={user.role === USER_ROLES.IT_ADMIN ? 'secondary' : user.role === USER_ROLES.IT_USER ? 'primary' : 'default'}
            icon={user.role === USER_ROLES.IT_ADMIN ? <AdminIcon /> : <PersonIcon />}
            className="glass-chip"
          />
        </Stack>
        
        {canEdit && (
          <Stack direction="row" spacing={1}>
            <Button
              variant={isEditing ? "outlined" : "contained"}
              startIcon={isEditing ? <CancelIcon /> : <EditIcon />}
              onClick={() => setIsEditing(!isEditing)}
              disabled={isSubmitting}
              className={isEditing ? "glass-button" : "gradient-button"}
              sx={{
                ...(isEditing && {
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.15)',
                  }
                })
              }}
            >
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Button>
            {isOwnProfile && !isChangingPassword && (
              <Button
                variant="outlined"
                onClick={() => setIsChangingPassword(true)}
                disabled={isEditing}
                className="glass-button"
                sx={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: 'white',
                  '&:hover': {
                    background: 'rgba(255, 255, 255, 0.15)',
                  }
                }}
              >
                Change Password
              </Button>
            )}
          </Stack>
        )}
      </Box>

      {submitError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {submitError}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Profile Information */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Profile Information
            </Typography>
            
            {isEditing ? (
              <Formik
                initialValues={{
                  firstName: user.firstName,
                  lastName: user.lastName,
                  email: user.email,
                  department: user.department || '',
                  role: user.role,
                  isActive: user.isActive,
                }}
                validationSchema={validationSchema}
                onSubmit={handleProfileUpdate}
              >
                {({ values, errors, touched, handleChange, handleBlur, isValid }) => (
                  <Form>
                    <Stack spacing={3}>
                      <Stack direction="row" spacing={2}>
                        <Field name="firstName">
                          {({ field }) => (
                            <TextField
                              {...field}
                              label="First Name"
                              fullWidth
                              required
                              error={touched.firstName && Boolean(errors.firstName)}
                              helperText={touched.firstName && errors.firstName}
                            />
                          )}
                        </Field>
                        
                        <Field name="lastName">
                          {({ field }) => (
                            <TextField
                              {...field}
                              label="Last Name"
                              fullWidth
                              required
                              error={touched.lastName && Boolean(errors.lastName)}
                              helperText={touched.lastName && errors.lastName}
                            />
                          )}
                        </Field>
                      </Stack>

                      <Field name="email">
                        {({ field }) => (
                          <TextField
                            {...field}
                            label="Email"
                            fullWidth
                            required
                            type="email"
                            error={touched.email && Boolean(errors.email)}
                            helperText={touched.email && errors.email}
                          />
                        )}
                      </Field>

                      <Field name="department">
                        {({ field }) => (
                          <TextField
                            {...field}
                            label="Department"
                            fullWidth
                            error={touched.department && Boolean(errors.department)}
                            helperText={touched.department && errors.department}
                          />
                        )}
                      </Field>

                      {canEditRole && (
                        <Stack direction="row" spacing={2}>
                          <FormControl fullWidth required>
                            <InputLabel>Role</InputLabel>
                            <Select
                              name="role"
                              value={values.role}
                              label="Role"
                              onChange={handleChange}
                              onBlur={handleBlur}
                              error={touched.role && Boolean(errors.role)}
                            >
                              {Object.entries(roleLabels).map(([value, label]) => (
                                <MenuItem key={value} value={value}>
                                  {label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>

                          <FormControlLabel
                            control={
                              <Switch
                                name="isActive"
                                checked={values.isActive}
                                onChange={handleChange}
                              />
                            }
                            label="Active"
                          />
                        </Stack>
                      )}

                      <Stack direction="row" spacing={2} justifyContent="flex-end">
                        <Button
                          variant="outlined"
                          onClick={() => setIsEditing(false)}
                          disabled={isSubmitting}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          variant="contained"
                          startIcon={
                            isSubmitting ? (
                              <CircularProgress size={20} color="inherit" />
                            ) : (
                              <SaveIcon />
                            )
                          }
                          disabled={!isValid || isSubmitting}
                        >
                          {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </Stack>
                    </Stack>
                  </Form>
                )}
              </Formik>
            ) : (
              <Stack spacing={3}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <PersonIcon color="action" />
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Full Name
                        </Typography>
                        <Typography variant="body1">
                          {user.firstName} {user.lastName}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <EmailIcon color="action" />
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Email
                        </Typography>
                        <Typography variant="body1">
                          {user.email}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box display="flex" alignItems="center" gap={1}>
                      <WorkIcon color="action" />
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          Department
                        </Typography>
                        <Typography variant="body1">
                          {user.department || '-'}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Status
                      </Typography>
                      <Chip
                        label={user.isActive ? 'Active' : 'Inactive'}
                        color={user.isActive ? 'success' : 'default'}
                        size="small"
                        variant="outlined"
                      />
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Member Since
                      </Typography>
                      <Typography variant="body1">
                        {formatDateTime(user.createdAt)}
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <Box>
                      <Typography variant="subtitle2" color="text.secondary">
                        Last Updated
                      </Typography>
                      <Typography variant="body1">
                        {formatDateTime(user.updatedAt)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Stack>
            )}
          </Paper>

          {/* Change Password Form */}
          {isOwnProfile && isChangingPassword && (
            <Paper sx={{ p: 3, mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Change Password
              </Typography>
              
              <Formik
                initialValues={{
                  currentPassword: '',
                  newPassword: '',
                  confirmPassword: '',
                }}
                validationSchema={passwordValidationSchema}
                onSubmit={handlePasswordChange}
              >
                {({ values, errors, touched, isValid, resetForm }) => (
                  <Form>
                    <Stack spacing={3}>
                      <Field name="currentPassword">
                        {({ field }) => (
                          <TextField
                            {...field}
                            label="Current Password"
                            type="password"
                            fullWidth
                            required
                            error={touched.currentPassword && Boolean(errors.currentPassword)}
                            helperText={touched.currentPassword && errors.currentPassword}
                          />
                        )}
                      </Field>

                      <Field name="newPassword">
                        {({ field }) => (
                          <TextField
                            {...field}
                            label="New Password"
                            type="password"
                            fullWidth
                            required
                            error={touched.newPassword && Boolean(errors.newPassword)}
                            helperText={touched.newPassword && errors.newPassword}
                          />
                        )}
                      </Field>

                      <Field name="confirmPassword">
                        {({ field }) => (
                          <TextField
                            {...field}
                            label="Confirm New Password"
                            type="password"
                            fullWidth
                            required
                            error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                            helperText={touched.confirmPassword && errors.confirmPassword}
                          />
                        )}
                      </Field>

                      <Stack direction="row" spacing={2} justifyContent="flex-end">
                        <Button
                          variant="outlined"
                          onClick={() => {
                            setIsChangingPassword(false);
                            resetForm();
                          }}
                          disabled={isSubmitting}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          variant="contained"
                          startIcon={
                            isSubmitting ? (
                              <CircularProgress size={20} color="inherit" />
                            ) : (
                              <SaveIcon />
                            )
                          }
                          disabled={!isValid || isSubmitting}
                        >
                          {isSubmitting ? 'Changing...' : 'Change Password'}
                        </Button>
                      </Stack>
                    </Stack>
                  </Form>
                )}
              </Formik>
            </Paper>
          )}
        </Grid>

        {/* Statistics */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Statistics
            </Typography>
            
            {userStats ? (
              <Stack spacing={2}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h4" color="primary">
                      {userStats.totalTickets}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Tickets Created
                    </Typography>
                  </CardContent>
                </Card>

                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h4" color="warning.main">
                      {userStats.openTickets}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Open Tickets
                    </Typography>
                  </CardContent>
                </Card>

                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h4" color="success.main">
                      {userStats.closedTickets}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Closed Tickets
                    </Typography>
                  </CardContent>
                </Card>

                {(user.role === USER_ROLES.IT_USER || user.role === USER_ROLES.IT_ADMIN) && (
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h4" color="info.main">
                        {userStats.assignedTickets}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Assigned Tickets
                      </Typography>
                    </CardContent>
                  </Card>
                )}
              </Stack>
            ) : (
              <CircularProgress />
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default UserProfile;
