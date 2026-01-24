// src/theme/index.ts
import { type PaletteMode, type Theme, type ThemeOptions, createTheme } from '@mui/material/styles';

declare module '@mui/material/Paper' {
  interface PaperPropsVariantOverrides {
    dashboardSection: true;
  }
}

declare module '@mui/material/styles' {
  interface BreakpointOverrides {
    xs: true;
    sm: true;
    md: true;
    lg: true;
    xl: true;
    xxl: true;
  }

  interface Palette {
    backgroundColor: string;
  }

  interface PaletteOptions {
    backgroundColor?: string;
  }
}

const baseThemeOptions: ThemeOptions = {
  palette: {
    primary: {
      main: '#1976d2',
    },
    backgroundColor: '#F9FAFB',
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
      xxl: 2000,
    },
  },
  components: {
    MuiPaper: {
      variants: [
        {
          props: { variant: 'dashboardSection' },
          style: ({ theme }: { theme: Theme }) => ({
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
            padding: theme.spacing(3),
            backgroundColor: theme.palette.background.paper,
          }),
        },
      ],
    },
  },
};

const buildThemeOptions = (mode: PaletteMode): ThemeOptions => ({
  ...baseThemeOptions,
  palette: {
    ...(baseThemeOptions.palette ?? {}),
    mode,
  },
});

export const createFrontofficeTheme = (mode: PaletteMode = 'light'): Theme =>
  createTheme(buildThemeOptions(mode));

export const theme = createFrontofficeTheme();

export const gradients = {
  logo: 'linear-gradient(135deg, #DC0023 0%, #0D00FF 100%)',
};
