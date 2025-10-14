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

export const createBackofficeTheme = (mode: PaletteMode = 'light'): Theme =>
  createTheme(buildThemeOptions(mode));

export const theme = createBackofficeTheme();

export const gradients = {
  logo: 'linear-gradient(135deg, #0D00FF 0%, #DC0023 100%)',
};
