import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#6200EE', // Example deep purple from logo/branding feel
      light: '#9c4dcc',
      dark: '#3700b3',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#03DAC6', // Teal/Green accent often pairs well, or maybe the gradient pink?
      // Let's stick to a safe secondary for now, or maybe the red/pink from the 'F' logo?
      // Re-reading mockup images (mentally): Logo is Gradient F.
      // Let's use a dark slate for text.
      contrastText: '#000000',
    },
    background: {
      default: '#FFFFFF',
      paper: '#F5F7FA'
    },
    text: {
      primary: '#1b1d21',
      secondary: '#6b7280'
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 800,
      letterSpacing: '-0.02em',
      fontSize: '3.5rem',
      '@media (max-width:600px)': {
        fontSize: '2.5rem',
      },
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
      fontSize: '2.5rem',
    },
    h3: {
      fontWeight: 700,
      fontSize: '2rem',
    },
    h6: {
      fontWeight: 700,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
      borderRadius: 8,
    },
    body1: {
      lineHeight: 1.7,
      fontSize: '1.05rem',
    }
  },
  shape: {
    borderRadius: 8
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          padding: '10px 24px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        containedPrimary: {
          // Gradient for primary buttons if we want that "wow" factor?
          // background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
          // Actually let's keep it simple clean purple/blue for now, maybe add gradient later if requested.
          // The logo is red/purple gradient.
          background: 'linear-gradient(to right, #D500F9, #651FFF)',
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)',
          border: '1px solid #E5E7EB',
        }
      }
    }
  }
});

export default theme;
