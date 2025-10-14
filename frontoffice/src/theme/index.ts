// src/theme/index.ts
import { PaletteMode, Theme, ThemeOptions, createTheme } from '@mui/material/styles';

const baseThemeOptions: ThemeOptions = {
  palette: {
    primary: {
      main: '#1976d2',
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
