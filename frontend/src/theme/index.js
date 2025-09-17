import { createTheme } from '@mui/material/styles';

// Define color palette
const colors = {
  primary: {
    50: '#e3f2fd',
    100: '#bbdefb',
    200: '#90caf9',
    300: '#64b5f6',
    400: '#42a5f5',
    500: '#2196f3',
    600: '#1e88e5',
    700: '#1976d2',
    800: '#1565c0',
    900: '#0d47a1',
  },
  secondary: {
    50: '#f3e5f5',
    100: '#e1bee7',
    200: '#ce93d8',
    300: '#ba68c8',
    400: '#ab47bc',
    500: '#9c27b0',
    600: '#8e24aa',
    700: '#7b1fa2',
    800: '#6a1b9a',
    900: '#4a148c',
  },
  success: {
    50: '#e8f5e8',
    100: '#c8e6c9',
    200: '#a5d6a7',
    300: '#81c784',
    400: '#66bb6a',
    500: '#4caf50',
    600: '#43a047',
    700: '#388e3c',
    800: '#2e7d32',
    900: '#1b5e20',
  },
  warning: {
    50: '#fff8e1',
    100: '#ffecb3',
    200: '#ffe082',
    300: '#ffd54f',
    400: '#ffca28',
    500: '#ffc107',
    600: '#ffb300',
    700: '#ffa000',
    800: '#ff8f00',
    900: '#ff6f00',
  },
  error: {
    50: '#ffebee',
    100: '#ffcdd2',
    200: '#ef9a9a',
    300: '#e57373',
    400: '#ef5350',
    500: '#f44336',
    600: '#e53935',
    700: '#d32f2f',
    800: '#c62828',
    900: '#b71c1c',
  },
  grey: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  background: {
    default: '#f8fafc',
    paper: '#ffffff',
    surface: '#f1f5f9',
    elevated: '#ffffff',
  },
  text: {
    primary: '#1e293b',
    secondary: '#64748b',
    disabled: '#94a3b8',
  },
};

// Create the theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: colors.primary[600],
      light: colors.primary[400],
      dark: colors.primary[800],
      contrastText: '#ffffff',
    },
    secondary: {
      main: colors.secondary[600],
      light: colors.secondary[400],
      dark: colors.secondary[800],
      contrastText: '#ffffff',
    },
    success: {
      main: colors.success[600],
      light: colors.success[400],
      dark: colors.success[800],
      contrastText: '#ffffff',
    },
    warning: {
      main: colors.warning[600],
      light: colors.warning[400],
      dark: colors.warning[800],
      contrastText: '#000000',
    },
    error: {
      main: colors.error[600],
      light: colors.error[400],
      dark: colors.error[800],
      contrastText: '#ffffff',
    },
    grey: colors.grey,
    background: colors.background,
    text: colors.text,
    divider: colors.grey[200],
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
      letterSpacing: '-0.01em',
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.125rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.6,
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.4,
      textTransform: 'none',
      letterSpacing: '0.02em',
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: 1.4,
    },
    overline: {
      fontSize: '0.75rem',
      fontWeight: 600,
      lineHeight: 1.4,
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0px 1px 3px rgba(0, 0, 0, 0.08), 0px 1px 2px rgba(0, 0, 0, 0.12)',
    '0px 1px 5px rgba(0, 0, 0, 0.08), 0px 2px 4px rgba(0, 0, 0, 0.12)',
    '0px 1px 8px rgba(0, 0, 0, 0.08), 0px 3px 6px rgba(0, 0, 0, 0.12)',
    '0px 2px 12px rgba(0, 0, 0, 0.08), 0px 4px 8px rgba(0, 0, 0, 0.12)',
    '0px 3px 16px rgba(0, 0, 0, 0.08), 0px 6px 12px rgba(0, 0, 0, 0.12)',
    '0px 4px 20px rgba(0, 0, 0, 0.08), 0px 8px 16px rgba(0, 0, 0, 0.12)',
    '0px 6px 24px rgba(0, 0, 0, 0.08), 0px 12px 20px rgba(0, 0, 0, 0.12)',
    '0px 8px 28px rgba(0, 0, 0, 0.08), 0px 16px 24px rgba(0, 0, 0, 0.12)',
    '0px 10px 32px rgba(0, 0, 0, 0.08), 0px 20px 28px rgba(0, 0, 0, 0.12)',
    '0px 12px 36px rgba(0, 0, 0, 0.08), 0px 24px 32px rgba(0, 0, 0, 0.12)',
    '0px 14px 40px rgba(0, 0, 0, 0.08), 0px 28px 36px rgba(0, 0, 0, 0.12)',
    '0px 16px 44px rgba(0, 0, 0, 0.08), 0px 32px 40px rgba(0, 0, 0, 0.12)',
    '0px 18px 48px rgba(0, 0, 0, 0.08), 0px 36px 44px rgba(0, 0, 0, 0.12)',
    '0px 20px 52px rgba(0, 0, 0, 0.08), 0px 40px 48px rgba(0, 0, 0, 0.12)',
    '0px 22px 56px rgba(0, 0, 0, 0.08), 0px 44px 52px rgba(0, 0, 0, 0.12)',
    '0px 24px 60px rgba(0, 0, 0, 0.08), 0px 48px 56px rgba(0, 0, 0, 0.12)',
    '0px 26px 64px rgba(0, 0, 0, 0.08), 0px 52px 60px rgba(0, 0, 0, 0.12)',
    '0px 28px 68px rgba(0, 0, 0, 0.08), 0px 56px 64px rgba(0, 0, 0, 0.12)',
    '0px 30px 72px rgba(0, 0, 0, 0.08), 0px 60px 68px rgba(0, 0, 0, 0.12)',
    '0px 32px 76px rgba(0, 0, 0, 0.08), 0px 64px 72px rgba(0, 0, 0, 0.12)',
    '0px 34px 80px rgba(0, 0, 0, 0.08), 0px 68px 76px rgba(0, 0, 0, 0.12)',
    '0px 36px 84px rgba(0, 0, 0, 0.08), 0px 72px 80px rgba(0, 0, 0, 0.12)',
    '0px 38px 88px rgba(0, 0, 0, 0.08), 0px 76px 84px rgba(0, 0, 0, 0.12)',
    '0px 40px 92px rgba(0, 0, 0, 0.08), 0px 80px 88px rgba(0, 0, 0, 0.12)',
  ],
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*': {
          boxSizing: 'border-box',
        },
        html: {
          MozOsxFontSmoothing: 'grayscale',
          WebkitFontSmoothing: 'antialiased',
          height: '100%',
          width: '100%',
        },
        body: {
          height: '100%',
          width: '100%',
          backgroundColor: colors.background.default,
        },
        '#root': {
          height: '100%',
          width: '100%',
        },
        '.scrollbar-thin': {
          scrollbarWidth: 'thin',
          scrollbarColor: `${colors.grey[400]} ${colors.grey[100]}`,
          '&::-webkit-scrollbar': {
            width: '6px',
            height: '6px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: colors.grey[100],
            borderRadius: '3px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: colors.grey[400],
            borderRadius: '3px',
            '&:hover': {
              backgroundColor: colors.grey[500],
            },
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '8px',
          fontWeight: 500,
          fontSize: '0.875rem',
          padding: '8px 16px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
          },
        },
        outlined: {
          borderWidth: '1.5px',
          '&:hover': {
            borderWidth: '1.5px',
          },
        },
        sizeSmall: {
          padding: '6px 12px',
          fontSize: '0.8125rem',
        },
        sizeLarge: {
          padding: '12px 24px',
          fontSize: '0.9375rem',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.08), 0px 1px 2px rgba(0, 0, 0, 0.12)',
          borderRadius: '16px',
          border: `1px solid ${colors.grey[200]}`,
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08), 0px 2px 4px rgba(0, 0, 0, 0.12)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.08), 0px 1px 2px rgba(0, 0, 0, 0.12)',
        },
        elevation2: {
          boxShadow: '0px 1px 5px rgba(0, 0, 0, 0.08), 0px 2px 4px rgba(0, 0, 0, 0.12)',
        },
        elevation3: {
          boxShadow: '0px 1px 8px rgba(0, 0, 0, 0.08), 0px 3px 6px rgba(0, 0, 0, 0.12)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '8px',
            backgroundColor: colors.background.paper,
            '& fieldset': {
              borderColor: colors.grey[300],
              borderWidth: '1.5px',
            },
            '&:hover fieldset': {
              borderColor: colors.grey[400],
            },
            '&.Mui-focused fieldset': {
              borderWidth: '2px',
            },
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        outlined: {
          borderRadius: '8px',
          backgroundColor: colors.background.paper,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '6px',
          fontWeight: 500,
          fontSize: '0.8125rem',
        },
        filled: {
          '&.MuiChip-colorPrimary': {
            backgroundColor: colors.primary[100],
            color: colors.primary[800],
          },
          '&.MuiChip-colorSecondary': {
            backgroundColor: colors.secondary[100],
            color: colors.secondary[800],
          },
          '&.MuiChip-colorSuccess': {
            backgroundColor: colors.success[100],
            color: colors.success[800],
          },
          '&.MuiChip-colorWarning': {
            backgroundColor: colors.warning[100],
            color: colors.warning[800],
          },
          '&.MuiChip-colorError': {
            backgroundColor: colors.error[100],
            color: colors.error[800],
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.08), 0px 1px 2px rgba(0, 0, 0, 0.12)',
          backgroundColor: colors.background.paper,
          color: colors.text.primary,
          borderBottom: `1px solid ${colors.grey[200]}`,
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: colors.background.paper,
          borderRight: `1px solid ${colors.grey[200]}`,
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          margin: '2px 8px',
          '&.Mui-selected': {
            backgroundColor: colors.primary[50],
            color: colors.primary[700],
            '&:hover': {
              backgroundColor: colors.primary[100],
            },
            '& .MuiListItemIcon-root': {
              color: colors.primary[600],
            },
          },
          '&:hover': {
            backgroundColor: colors.grey[50],
            borderRadius: '8px',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${colors.grey[200]}`,
        },
        head: {
          backgroundColor: colors.grey[50],
          fontWeight: 600,
          color: colors.text.primary,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: colors.grey[50],
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: '16px',
          boxShadow: '0px 20px 52px rgba(0, 0, 0, 0.08), 0px 40px 48px rgba(0, 0, 0, 0.12)',
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          backgroundColor: colors.grey[800],
          fontSize: '0.75rem',
          borderRadius: '6px',
          padding: '8px 12px',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: '4px',
          backgroundColor: colors.grey[200],
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.08)',
        },
        standardSuccess: {
          backgroundColor: colors.success[50],
          color: colors.success[800],
          border: `1px solid ${colors.success[200]}`,
        },
        standardError: {
          backgroundColor: colors.error[50],
          color: colors.error[800],
          border: `1px solid ${colors.error[200]}`,
        },
        standardWarning: {
          backgroundColor: colors.warning[50],
          color: colors.warning[800],
          border: `1px solid ${colors.warning[200]}`,
        },
        standardInfo: {
          backgroundColor: colors.primary[50],
          color: colors.primary[800],
          border: `1px solid ${colors.primary[200]}`,
        },
      },
    },
  },
});

// Add custom theme properties
theme.custom = {
  gradients: {
    primary: `linear-gradient(135deg, ${colors.primary[500]} 0%, ${colors.primary[700]} 100%)`,
    secondary: `linear-gradient(135deg, ${colors.secondary[500]} 0%, ${colors.secondary[700]} 100%)`,
    success: `linear-gradient(135deg, ${colors.success[500]} 0%, ${colors.success[700]} 100%)`,
    warning: `linear-gradient(135deg, ${colors.warning[500]} 0%, ${colors.warning[700]} 100%)`,
    error: `linear-gradient(135deg, ${colors.error[500]} 0%, ${colors.error[700]} 100%)`,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  transitions: {
    fast: '0.15s ease-in-out',
    medium: '0.25s ease-in-out',
    slow: '0.35s ease-in-out',
  },
};

export default theme;
