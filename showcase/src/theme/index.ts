import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2E7D32'
    },
    secondary: {
      main: '#1B5E20'
    },
    background: {
      default: '#F5F7FA',
      paper: '#FFFFFF'
    }
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      letterSpacing: '-0.02em'
    },
    h2: {
      fontWeight: 600,
      letterSpacing: '-0.01em'
    },
    body1: {
      lineHeight: 1.7
    }
  },
  shape: {
    borderRadius: 14
  }
});

export default theme;
