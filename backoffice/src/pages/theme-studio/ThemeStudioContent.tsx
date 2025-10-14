// src/pages/theme-studio/ThemeStudioContent.tsx
import * as React from 'react';
import {
  Alert,
  Autocomplete,
  Avatar,
  Badge,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  GlobalStyles,
  IconButton,
  InputAdornment,
  LinearProgress,
  Link,
  MenuItem,
  Pagination,
  Paper,
  Radio,
  RadioGroup,
  Select,
  Skeleton,
  Slider,
  Snackbar,
  Stack,
  Switch,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import type { ButtonProps } from '@mui/material/Button';
import type { ChipProps } from '@mui/material/Chip';
import type { SelectProps } from '@mui/material/Select';
import type { TextFieldProps } from '@mui/material/TextField';
import Checkbox from '@mui/material/Checkbox';
import { Palette, PaletteOutlined, Refresh, Upload } from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import { ThemeProvider, useTheme, type Theme } from '@mui/material/styles';
import type { PaletteMode } from '@mui/material';

import { createBackofficeTheme } from '@theme/index';

import { LoadingButton } from '@pages/theme-studio/components/LoadingButton';
import { SectionCard } from '@pages/theme-studio/components/SectionCard';
import { SectionNavigation } from '@pages/theme-studio/components/SectionNavigation';
import { TokenBreakpoint } from '@pages/theme-studio/components/TokenBreakpoint';
import { TokenShadow } from '@pages/theme-studio/components/TokenShadow';
import { TokenSpacing } from '@pages/theme-studio/components/TokenSpacing';
import { TokenSwatch } from '@pages/theme-studio/components/TokenSwatch';
import { TokenTypography } from '@pages/theme-studio/components/TokenTypography';
import { useSectionObserver } from '@pages/theme-studio/hooks/useSectionObserver';

const COMPONENT_SECTION_IDS = [
  'buttons',
  'text-fields',
  'selects',
  'autocomplete',
  'choice-controls',
  'slider',
  'chip',
  'avatar-icon',
  'alerts',
  'snackbar',
  'dialog',
  'card',
  'tabs',
  'table',
  'pagination',
  'breadcrumbs',
  'avatar-badge',
  'tooltip',
  'progress',
  'skeleton',
] as const;

type ComponentSectionId = (typeof COMPONENT_SECTION_IDS)[number];

type ComponentSection = {
  id: ComponentSectionId;
  title: string;
  description: string;
  tokens: string[];
  render: (theme: Theme) => React.ReactNode;
};

const COMPONENT_SECTIONS: ComponentSection[] = [
  {
    id: 'buttons',
    title: 'Button',
    description:
      'Contained, outlined and text buttons across semantic colors with interactive states including loading.',
    tokens: [
      'theme.palette.<color>.main',
      'theme.palette.<color>.contrastText',
      'theme.typography.button',
      'theme.shape.borderRadius',
      'theme.spacing()',
      'theme.shadows[1..4]',
    ],
    render: (theme) => <ButtonsShowcase theme={theme} />,
  },
  {
    id: 'text-fields',
    title: 'TextField',
    description:
      'Outlined, filled and standard fields with focus, error, disabled and helper text states, including adornments.',
    tokens: [
      'theme.palette.primary.main',
      'theme.palette.error.main',
      'theme.typography.body1',
      'theme.shape.borderRadius',
      'theme.spacing()',
    ],
    render: () => <TextFieldShowcase />,
  },
  {
    id: 'selects',
    title: 'Select',
    description: 'Outlined and filled selects with multiple selection and menu density variants.',
    tokens: [
      'theme.palette.action.hover',
      'theme.palette.text.primary',
      'theme.typography.body1',
      'theme.spacing()',
    ],
    render: () => <SelectShowcase />,
  },
  {
    id: 'autocomplete',
    title: 'Autocomplete',
    description: 'Single and multiple autocompletes with disabled and error states, including chips.',
    tokens: ['theme.palette', 'theme.spacing()', 'theme.typography.body1'],
    render: () => <AutocompleteShowcase />,
  },
  {
    id: 'choice-controls',
    title: 'Checkbox / Radio / Switch',
    description: 'Selection controls across checked, unchecked and disabled states.',
    tokens: ['theme.palette.primary.main', 'theme.palette.secondary.main', 'theme.palette.action.active'],
    render: () => <ChoiceControlsShowcase />,
  },
  {
    id: 'slider',
    title: 'Slider',
    description: 'Continuous, discrete and disabled sliders.',
    tokens: ['theme.palette.primary.main', 'theme.spacing()'],
    render: () => <SliderShowcase />,
  },
  {
    id: 'chip',
    title: 'Chip',
    description: 'Filled and outlined chips with semantic colors.',
    tokens: ['theme.palette', 'theme.spacing()', 'theme.typography.caption'],
    render: () => <ChipShowcase />,
  },
  {
    id: 'avatar-icon',
    title: 'Avatars & Icons',
    description: 'Avatars with initials or icons demonstrating radius and typographic scale.',
    tokens: ['theme.palette.background.default', 'theme.palette.text.primary', 'theme.typography.caption'],
    render: () => <AvatarShowcase />,
  },
  {
    id: 'alerts',
    title: 'Alert',
    description: 'Standard, filled and outlined alerts across severities.',
    tokens: ['theme.palette', 'theme.spacing()'],
    render: () => <AlertShowcase />,
  },
  {
    id: 'snackbar',
    title: 'Snackbar',
    description: 'Snackbars anchored to bottom corners with auto hide duration.',
    tokens: ['theme.palette.background.paper', 'theme.shadows[6]', 'theme.spacing()'],
    render: () => <SnackbarShowcase />,
  },
  {
    id: 'dialog',
    title: 'Dialog',
    description: 'Dialog layout with title, content, actions and responsive widths.',
    tokens: ['theme.typography.h6', 'theme.spacing()', 'theme.shape.borderRadius', 'theme.shadows[24]'],
    render: () => <DialogShowcase />,
  },
  {
    id: 'card',
    title: 'Card',
    description: 'Outlined and elevated cards with header, content and actions.',
    tokens: ['theme.shadows', 'theme.shape.borderRadius', 'theme.spacing()'],
    render: () => <CardShowcase />,
  },
  {
    id: 'tabs',
    title: 'Tabs',
    description: 'Text and icon tabs with horizontal orientation.',
    tokens: ['theme.palette.primary.main', 'theme.typography.button', 'theme.spacing()'],
    render: () => <TabsShowcase />,
  },
  {
    id: 'table',
    title: 'Table',
    description: 'Table headers and rows with normal and dense density options.',
    tokens: ['theme.typography.body2', 'theme.palette.divider', 'theme.spacing()'],
    render: () => <TableShowcase />,
  },
  {
    id: 'pagination',
    title: 'Pagination',
    description: 'Pagination component using text variant and spacing tokens.',
    tokens: ['theme.palette.primary.main', 'theme.spacing()'],
    render: () => <PaginationShowcase />,
  },
  {
    id: 'breadcrumbs',
    title: 'Breadcrumbs',
    description: 'Breadcrumb navigation with separators.',
    tokens: ['theme.typography.body2', 'theme.palette.text.secondary'],
    render: () => <BreadcrumbsShowcase />,
  },
  {
    id: 'avatar-badge',
    title: 'Avatar + Badge',
    description: 'Badge overlay on avatars demonstrating overlap tokens.',
    tokens: ['theme.palette', 'theme.shape.borderRadius'],
    render: () => <AvatarBadgeShowcase />,
  },
  {
    id: 'tooltip',
    title: 'Tooltip',
    description: 'Tooltip with arrow showcasing grey palette and caption typography.',
    tokens: ['theme.palette.grey', 'theme.typography.caption'],
    render: () => <TooltipShowcase />,
  },
  {
    id: 'progress',
    title: 'Progress',
    description: 'Linear and circular progress indicators in determinate and indeterminate modes.',
    tokens: ['theme.palette.primary.main'],
    render: () => <ProgressShowcase />,
  },
  {
    id: 'skeleton',
    title: 'Skeleton',
    description: 'Skeleton placeholders for text, rectangles and circles.',
    tokens: ['theme.palette.action.hover'],
    render: () => <SkeletonShowcase />,
  },
];

const SECTION_LIST = [
  { id: 'global-tokens', label: 'Global tokens' },
  ...COMPONENT_SECTIONS.map((section) => ({ id: section.id, label: section.title })),
];

export function ThemeStudioContent(): React.ReactElement {
  const rootTheme = useTheme();
  const [mode, setMode] = React.useState<PaletteMode>(rootTheme.palette.mode ?? 'light');
  const derivedTheme = React.useMemo<Theme>(() => {
    if (rootTheme.palette.mode === mode) {
      return rootTheme;
    }
    return createBackofficeTheme(mode);
  }, [rootTheme, mode]);

  const sectionIds = React.useMemo(() => SECTION_LIST.map((section) => section.id), []);
  const activeSection = useSectionObserver(sectionIds);

  const handleModeToggle = React.useCallback(() => {
    setMode((current) => (current === 'light' ? 'dark' : 'light'));
  }, []);

  return (
    <ThemeProvider theme={derivedTheme}>
      <GlobalStyles
        styles={{
          'html, body, #root': {
            scrollBehavior: 'smooth',
          },
          '[data-force-outline="true"]:focus-visible': {
            outline: '2px solid',
            outlineOffset: '4px',
            outlineColor: derivedTheme.palette.primary.main,
          },
        }}
      />
      <Box component="section" aria-labelledby="theme-studio-heading" sx={{ py: 4, colorScheme: mode }}>
        <Container maxWidth="lg">
          <Stack spacing={3}>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }}>
              <Palette fontSize="large" color="primary" />
              <Box>
                <Typography id="theme-studio-heading" variant="h4" component="h1" gutterBottom>
                  Theme Studio
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Inspect live rendering, tokens and accessibility guidance for high-usage components.
                </Typography>
              </Box>
              <Box sx={{ flexGrow: 1 }} />
              <Button
                onClick={handleModeToggle}
                startIcon={mode === 'light' ? <PaletteOutlined /> : <Palette />}
                variant="contained"
                color="primary"
                aria-pressed={mode === 'dark'}
              >
                {mode === 'light' ? 'Switch to dark' : 'Switch to light'}
              </Button>
            </Stack>

            <SectionNavigation sections={SECTION_LIST} activeSection={activeSection} />

            <Box id="global-tokens">
              <Typography variant="h5" gutterBottom>
                Global tokens
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Values exported by the active theme. Click any token to copy the raw reference. Measurements display
                pixel and rem values when relevant.
              </Typography>
              <GlobalTokens theme={derivedTheme} />
            </Box>

            {COMPONENT_SECTIONS.map((section) => (
              <Box key={section.id} id={section.id}>
                <SectionCard title={section.title} subtitle={section.description} tokens={section.tokens}>
                  {section.render(derivedTheme)}
                </SectionCard>
              </Box>
            ))}

            <Box textAlign="right">
              <Button
                href="#theme-studio-heading"
                variant="text"
                color="primary"
                startIcon={<Refresh />}
                aria-label="Back to top"
              >
                Back to top
              </Button>
            </Box>
          </Stack>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

type GlobalTokensProps = {
  theme: Theme;
};

function GlobalTokens({ theme }: GlobalTokensProps): React.ReactElement {
  const spacingBase = parseFloat(theme.spacing(1));
  const spacingSamples = [0.5, 1, 2, 3, 4, 6, 8];
  const typographyVariants: Array<keyof Theme['typography']> = [
    'h1',
    'h2',
    'h3',
    'h4',
    'h5',
    'h6',
    'subtitle1',
    'subtitle2',
    'body1',
    'body2',
    'button',
    'caption',
    'overline',
  ];

  return (
    <Stack spacing={4}>
      <SectionCard title="Palette" subtitle="Semantic colors with contrast pairs." tokens={['theme.palette']}>
        <Grid container spacing={2} role="grid" aria-label="Palette tokens">
          {['primary', 'secondary', 'success', 'warning', 'error', 'info'].map((colorKey) => {
            const paletteEntry = theme.palette[colorKey as keyof Theme['palette']];
            if (!paletteEntry || typeof paletteEntry !== 'object' || !('main' in paletteEntry)) {
              return null;
            }
            const main = String((paletteEntry as { main: string }).main);
            const contrastText = 'contrastText' in paletteEntry ? (paletteEntry as { contrastText?: string }).contrastText : undefined;
            return (
              <Grid key={colorKey} role="row" size={{ xs: 12, sm: 6, md: 4 }}>
                <TokenSwatch
                  label={`theme.palette.${colorKey}.main`}
                  value={main}
                  contrastText={contrastText}
                />
              </Grid>
            );
          })}

          <Grid role="row" size={{ xs: 12, sm: 6, md: 4 }}>
            <TokenSwatch label="theme.palette.text.primary" value={theme.palette.text.primary} inverted />
          </Grid>
          <Grid role="row" size={{ xs: 12, sm: 6, md: 4 }}>
            <TokenSwatch label="theme.palette.text.secondary" value={theme.palette.text.secondary} inverted />
          </Grid>
          <Grid role="row" size={{ xs: 12, sm: 6, md: 4 }}>
            <TokenSwatch label="theme.palette.divider" value={theme.palette.divider} inverted />
          </Grid>
          <Grid role="row" size={{ xs: 12, sm: 6, md: 4 }}>
            <TokenSwatch label="theme.palette.background.default" value={theme.palette.background.default} />
          </Grid>
          <Grid role="row" size={{ xs: 12, sm: 6, md: 4 }}>
            <TokenSwatch label="theme.palette.background.paper" value={theme.palette.background.paper} />
          </Grid>
        </Grid>
      </SectionCard>

      <SectionCard title="Typography" subtitle="Type ramp with metrics." tokens={['theme.typography']}>
        <Stack spacing={3} role="list" aria-label="Typography tokens">
          {typographyVariants.map((variant) => (
            <TokenTypography key={variant} theme={theme} variant={variant} />
          ))}
        </Stack>
      </SectionCard>

      <SectionCard title="Spacing" subtitle="Base spacing unit and samples." tokens={['theme.spacing']}>
        <Stack spacing={2} role="list" aria-label="Spacing tokens">
          <TokenSpacing label="theme.spacing(1)" pxValue={spacingBase} pxToRem={theme.typography.pxToRem} />
          {spacingSamples.map((sample) => {
            const px = parseFloat(theme.spacing(sample));
            return (
              <TokenSpacing
                key={sample}
                label={`theme.spacing(${sample})`}
                pxValue={px}
                pxToRem={theme.typography.pxToRem}
              />
            );
          })}
        </Stack>
      </SectionCard>

      <SectionCard title="Radius" subtitle="Shape border radius." tokens={['theme.shape.borderRadius']}>
        <TokenSpacing
          label="theme.shape.borderRadius"
          pxValue={Number(theme.shape.borderRadius)}
          pxToRem={theme.typography.pxToRem}
          visualRadius
        />
      </SectionCard>

      <SectionCard title="Shadows" subtitle="Depth scale used across surfaces." tokens={['theme.shadows[0..12]']}>
        <Grid container spacing={2} role="grid" aria-label="Shadow tokens">
          {theme.shadows.slice(0, 13).map((shadow, index) => (
            <Grid key={shadow} role="row" size={{ xs: 12, sm: 6, md: 4 }}>
              <TokenShadow label={`theme.shadows[${index}]`} shadow={shadow} />
            </Grid>
          ))}
        </Grid>
      </SectionCard>

      <SectionCard title="Breakpoints" subtitle="Responsive breakpoints in px." tokens={['theme.breakpoints.values']}>
        <Stack spacing={1} role="list" aria-label="Breakpoint tokens">
          {Object.entries(theme.breakpoints.values).map(([key, value]) => (
            <TokenBreakpoint
              key={key}
              label={`theme.breakpoints.values.${key}`}
              value={value}
              pxToRem={theme.typography.pxToRem}
            />
          ))}
        </Stack>
      </SectionCard>
    </Stack>
  );
}

type ShowcaseProps = {
  theme: Theme;
};

function ButtonsShowcase({ theme }: ShowcaseProps): React.ReactElement {
  const colors = ['primary', 'secondary', 'success', 'warning', 'error', 'info'] as const;
  const sizes: Array<'small' | 'medium' | 'large'> = ['small', 'medium', 'large'];
  const variants: Array<'contained' | 'outlined' | 'text'> = ['contained', 'outlined', 'text'];
  const states: ButtonState[] = ['default', 'hover', 'focus', 'active', 'disabled', 'loading'];

  return (
    <Stack spacing={2}>
      <Typography variant="subtitle2" color="text.secondary">
        Hover cards to inspect transitions. Focus state is automatically triggered on click. Tokens shown below each
        grid.
      </Typography>
      <Box role="table" aria-label="Button variants by state and size" sx={{ overflowX: 'auto' }}>
        <Stack spacing={2}>
          {variants.map((variant) => (
            <Paper key={variant} elevation={0} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                {variant.charAt(0).toUpperCase() + variant.slice(1)}
              </Typography>
              <Grid container spacing={2} role="rowgroup">
                {sizes.map((size) => (
                  <Grid key={size} role="row" size={{ xs: 12, md: 4 }}>
                    <Stack spacing={1}>
                      <Typography variant="caption" color="text.secondary">
                        Size: {size}
                      </Typography>
                      <Grid container spacing={1} role="presentation">
                        {colors.map((color) => (
                          <Grid key={color} size={{ xs: 12, sm: 6, md: 4 }}>
                            <ButtonStateMatrix
                              color={color}
                              variant={variant}
                              size={size}
                              states={states}
                              theme={theme}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    </Stack>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          ))}
        </Stack>
      </Box>
    </Stack>
  );
}

type ButtonState = 'default' | 'hover' | 'focus' | 'active' | 'disabled' | 'loading';

type ButtonStateMatrixProps = {
  color: ButtonProps['color'];
  variant: ButtonProps['variant'];
  size: ButtonProps['size'];
  states: ButtonState[];
  theme: Theme;
};

function ButtonStateMatrix({ color, variant, size, states, theme }: ButtonStateMatrixProps): React.ReactElement {
  return (
    <Stack spacing={1} role="group" aria-label={`${color} button states`}>
      {states.map((state) => (
        <StatePreview key={state} label={state}>
          {state === 'loading' ? (
            <LoadingButton color={color} variant={variant} size={size} loading>
              Loading
            </LoadingButton>
          ) : (
            <StyledButton color={color} variant={variant} size={size} state={state} theme={theme}>
              Action
            </StyledButton>
          )}
        </StatePreview>
      ))}
    </Stack>
  );
}

type StyledButtonProps = {
  color: ButtonProps['color'];
  variant: ButtonProps['variant'];
  size: ButtonProps['size'];
  state: Exclude<ButtonState, 'loading'>;
  theme: Theme;
  children: React.ReactNode;
};

function StyledButton({ color, variant, size, state, theme, children }: StyledButtonProps): React.ReactElement {
  const buttonRef = React.useRef<HTMLButtonElement | null>(null);

  React.useEffect(() => {
    if (state === 'focus') {
      buttonRef.current?.focus();
    } else {
      buttonRef.current?.blur();
    }
  }, [state]);

  const pseudoProps = React.useMemo(() => computeButtonStyles(theme, color, variant, state), [
    theme,
    color,
    variant,
    state,
  ]);

  return (
    <Button
      ref={buttonRef}
      color={color}
      variant={variant}
      size={size}
      disabled={state === 'disabled'}
      tabIndex={-1}
      data-force-outline={state === 'focus'}
      sx={{
        pointerEvents: 'none',
        ...pseudoProps,
      }}
    >
      {children}
    </Button>
  );
}

function computeButtonStyles(
  theme: Theme,
  color: ButtonProps['color'],
  variant: ButtonProps['variant'],
  state: Exclude<ButtonState, 'loading'>
): Record<string, unknown> {
  type ButtonPaletteKey = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
  const paletteKey: ButtonPaletteKey = (color && color !== 'inherit' ? color : 'primary') as ButtonPaletteKey;
  const paletteEntry = theme.palette[paletteKey];
  const main = paletteEntry && typeof paletteEntry === 'object' && 'main' in paletteEntry ? paletteEntry.main : undefined;
  const dark = (paletteEntry && typeof paletteEntry === 'object' && 'dark' in paletteEntry
    ? (paletteEntry as { dark?: string }).dark
    : undefined) ?? main;
  switch (variant) {
    case 'contained':
      if (state === 'hover') {
        return { backgroundColor: dark };
      }
      if (state === 'active') {
        return { backgroundColor: dark, boxShadow: theme.shadows[4] };
      }
      if (state === 'focus') {
        return { boxShadow: theme.shadows[3] };
      }
      if (state === 'disabled') {
        return {
          backgroundColor: theme.palette.action.disabledBackground,
          color: theme.palette.action.disabled,
          boxShadow: 'none',
        };
      }
      return { boxShadow: theme.shadows[2] };
    case 'outlined':
      if (state === 'hover') {
        return {
          borderColor: main,
          backgroundColor: theme.palette.action.hover,
        };
      }
      if (state === 'active') {
        return {
          borderColor: dark,
          backgroundColor: theme.palette.action.selected,
        };
      }
      if (state === 'focus') {
        return {
          borderColor: main,
          boxShadow: `0 0 0 3px ${theme.palette.action.focus}`,
        };
      }
      if (state === 'disabled') {
        return {
          borderColor: theme.palette.action.disabled,
          color: theme.palette.action.disabled,
        };
      }
      return {};
    case 'text':
      if (state === 'hover') {
        return { backgroundColor: theme.palette.action.hover };
      }
      if (state === 'active') {
        return { backgroundColor: theme.palette.action.selected };
      }
      if (state === 'focus') {
        return { backgroundColor: theme.palette.action.focus };
      }
      if (state === 'disabled') {
        return {
          color: theme.palette.action.disabled,
        };
      }
      return {};
    default:
      return {};
  }
}

function StatePreview({ label, children }: { label: string; children: React.ReactNode }): React.ReactElement {
  return (
    <Box role="figure" sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 1,
          borderRadius: 1,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

function TextFieldShowcase(): React.ReactElement {
  return (
    <Grid container spacing={2} aria-label="Text field variants" role="grid">
      {['outlined', 'filled', 'standard'].map((variant) => (
        <Grid key={variant} role="row" size={{ xs: 12, md: 4 }}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              {variant}
            </Typography>
            <Stack spacing={2}>
              <TextField label="Default" variant={variant as TextFieldProps['variant']} fullWidth />
              <TextField label="Focus" variant={variant as TextFieldProps['variant']} focused fullWidth />
              <TextField
                label="Error"
                variant={variant as TextFieldProps['variant']}
                error
                helperText="Helper text"
                fullWidth
              />
              <TextField label="Disabled" variant={variant as TextFieldProps['variant']} disabled fullWidth />
              <TextField
                label="With adornments"
                variant={variant as TextFieldProps['variant']}
                InputProps={{
                  startAdornment: <InputAdornment position="start">kg</InputAdornment>,
                  endAdornment: <InputAdornment position="end">/m²</InputAdornment>,
                }}
                fullWidth
              />
            </Stack>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}

function SelectShowcase(): React.ReactElement {
  return (
    <Grid container spacing={2} aria-label="Select variants" role="grid">
      {['outlined', 'filled'].map((variant) => (
        <Grid key={variant} role="row" size={{ xs: 12, md: 6 }}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              {variant}
            </Typography>
            <Stack spacing={2}>
              <Select defaultValue="option-1" variant={variant as SelectProps['variant']} fullWidth>
                <MenuItem value="option-1">Option 1</MenuItem>
                <MenuItem value="option-2">Option 2</MenuItem>
                <MenuItem value="option-3">Option 3</MenuItem>
              </Select>
              <Select
                multiple
                value={['option-1', 'option-3']}
                variant={variant as SelectProps['variant']}
                renderValue={(selected) => (selected as string[]).join(', ')}
                fullWidth
              >
                <MenuItem value="option-1">Option 1</MenuItem>
                <MenuItem value="option-2">Option 2</MenuItem>
                <MenuItem value="option-3">Option 3</MenuItem>
              </Select>
              <Select
                defaultValue="option-1"
                variant={variant as SelectProps['variant']}
                size="small"
                MenuProps={{
                  PaperProps: {
                    sx: {
                      '& .MuiMenuItem-root': {
                        py: 0.5,
                      },
                    },
                  },
                }}
                fullWidth
              >
                <MenuItem value="option-1">Dense item</MenuItem>
                <MenuItem value="option-2">Another option</MenuItem>
              </Select>
            </Stack>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}

function AutocompleteShowcase(): React.ReactElement {
  const options = ['Alpha', 'Beta', 'Gamma', 'Delta'];
  return (
    <Grid container spacing={2} aria-label="Autocomplete states" role="grid">
      <Grid role="row" size={{ xs: 12, md: 6 }}>
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Single
          </Typography>
          <Autocomplete options={options} renderInput={(params) => <TextField {...params} label="Option" />} />
          <Autocomplete
            options={options}
            defaultValue="Beta"
            renderInput={(params) => <TextField {...params} label="Focused" focused />}
            sx={{ mt: 2 }}
          />
        </Paper>
      </Grid>
      <Grid role="row" size={{ xs: 12, md: 6 }}>
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Multiple
          </Typography>
          <Autocomplete
            multiple
            options={options}
            defaultValue={['Alpha', 'Gamma']}
            renderInput={(params) => <TextField {...params} label="Selected" />}
          />
          <Autocomplete
            multiple
            options={options}
            disabled
            renderInput={(params) => <TextField {...params} label="Disabled" />}
            sx={{ mt: 2 }}
          />
          <Autocomplete
            multiple
            options={options}
            renderInput={(params) => <TextField {...params} label="Error" error helperText="Issue" />}
            sx={{ mt: 2 }}
          />
        </Paper>
      </Grid>
    </Grid>
  );
}

function ChoiceControlsShowcase(): React.ReactElement {
  return (
    <Grid container spacing={2} role="grid" aria-label="Choice controls">
      <Grid role="row" size={{ xs: 12, md: 4 }}>
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Checkbox
          </Typography>
          <Stack direction="row" spacing={3}>
            <FormControlLabel control={<Checkbox defaultChecked />} label="Checked" />
            <FormControlLabel control={<Checkbox />} label="Unchecked" />
            <FormControlLabel control={<Checkbox disabled />} label="Disabled" />
          </Stack>
        </Paper>
      </Grid>
      <Grid role="row" size={{ xs: 12, md: 4 }}>
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Radio
          </Typography>
          <RadioGroup row value="a">
            <FormControlLabel value="a" control={<Radio />} label="A" />
            <FormControlLabel value="b" control={<Radio />} label="B" />
            <FormControlLabel value="c" control={<Radio disabled />} label="Disabled" />
          </RadioGroup>
        </Paper>
      </Grid>
      <Grid role="row" size={{ xs: 12, md: 4 }}>
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Switch
          </Typography>
          <Stack direction="row" spacing={3}>
            <FormControlLabel control={<Switch defaultChecked />} label="On" />
            <FormControlLabel control={<Switch />} label="Off" />
            <FormControlLabel control={<Switch disabled />} label="Disabled" />
          </Stack>
        </Paper>
      </Grid>
    </Grid>
  );
}

function SliderShowcase(): React.ReactElement {
  return (
    <Grid container spacing={2} role="grid" aria-label="Slider states">
      <Grid role="row" size={{ xs: 12, md: 4 }}>
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Default
          </Typography>
          <Slider defaultValue={30} aria-label="Default slider" />
        </Paper>
      </Grid>
      <Grid role="row" size={{ xs: 12, md: 4 }}>
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Disabled
          </Typography>
          <Slider disabled defaultValue={30} aria-label="Disabled slider" />
        </Paper>
      </Grid>
      <Grid role="row" size={{ xs: 12, md: 4 }}>
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Discrete marks
          </Typography>
          <Slider defaultValue={40} step={10} marks min={0} max={100} valueLabelDisplay="on" aria-label="Discrete" />
        </Paper>
      </Grid>
    </Grid>
  );
}

function ChipShowcase(): React.ReactElement {
  const colors: Array<'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'> = [
    'default',
    'primary',
    'secondary',
    'success',
    'warning',
    'error',
    'info',
  ];
  return (
    <Grid container spacing={2} role="grid" aria-label="Chip variants">
      {['filled', 'outlined'].map((variant) => (
        <Grid key={variant} role="row" size={{ xs: 12, md: 6 }}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              {variant}
            </Typography>
            <Stack direction="row" flexWrap="wrap" spacing={1}>
              {colors.map((color) => (
                <Chip key={color} variant={variant as ChipProps['variant']} color={color} label={`${color}`} />
              ))}
            </Stack>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}

function AvatarShowcase(): React.ReactElement {
  return (
    <Stack direction="row" spacing={2} alignItems="center" role="group" aria-label="Avatar showcase">
      <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>JD</Avatar>
      <Avatar sx={{ bgcolor: 'secondary.main', width: 64, height: 64 }}>
        <Upload />
      </Avatar>
      <Avatar variant="rounded" sx={{ bgcolor: 'info.main', width: 56, height: 56 }}>
        <Typography variant="caption">Rounded</Typography>
      </Avatar>
    </Stack>
  );
}

function AlertShowcase(): React.ReactElement {
  const severities: Array<'info' | 'success' | 'warning' | 'error'> = ['info', 'success', 'warning', 'error'];
  const variants: Array<'standard' | 'filled' | 'outlined'> = ['standard', 'filled', 'outlined'];
  return (
    <Grid container spacing={2} role="grid" aria-label="Alert variants">
      {variants.map((variant) => (
        <Grid key={variant} role="row" size={{ xs: 12, md: 4 }}>
          <Stack spacing={2}>
            {severities.map((severity) => (
              <Alert key={severity} severity={severity} variant={variant}>
                {variant} {severity}
              </Alert>
            ))}
          </Stack>
        </Grid>
      ))}
    </Grid>
  );
}

function SnackbarShowcase(): React.ReactElement {
  const [openLeft, setOpenLeft] = React.useState(true);
  const [openRight, setOpenRight] = React.useState(true);

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      setOpenLeft(false);
      setOpenRight(false);
    }, 4000);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <Box sx={{ position: 'relative', minHeight: 120 }}>
      <Snackbar
        open={openLeft}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        message="Bottom-left"
        autoHideDuration={4000}
      />
      <Snackbar
        open={openRight}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        message="Bottom-right"
        autoHideDuration={4000}
      />
      <Typography variant="caption" color="text.secondary" sx={{ position: 'absolute', bottom: 8, right: 8 }}>
        Auto hides after 4s
      </Typography>
    </Box>
  );
}

function DialogShowcase(): React.ReactElement {
  const [isDialogOpen, setDialogOpen] = React.useState(false);

  const handleOpen = React.useCallback(() => {
    setDialogOpen(true);
  }, []);

  const handleClose = React.useCallback(() => {
    setDialogOpen(false);
  }, []);

  return (
    <Stack spacing={2}>
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Stack direction="row" justifyContent="flex-end">
          <Button variant="contained" onClick={handleOpen}>
            Open dialog
          </Button>
        </Stack>
        <Dialog open={isDialogOpen} onClose={handleClose} maxWidth="sm" fullWidth>
          <DialogTitle>Dialog title</DialogTitle>
          <DialogContent dividers>
            <Typography gutterBottom>
              Dialog content uses typography.body1. Padding is controlled by theme.spacing tokens.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try resizing the viewport to inspect maxWidth behaviour.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button color="secondary" onClick={handleClose}>
              Cancel
            </Button>
            <Button variant="contained">Primary action</Button>
          </DialogActions>
        </Dialog>
      </Paper>
      <Typography variant="caption" color="text.secondary">
        Radius inherits from theme.shape.borderRadius, elevation from theme.shadows.
      </Typography>
    </Stack>
  );
}

function CardShowcase(): React.ReactElement {
  return (
    <Grid container spacing={2} role="grid" aria-label="Card variants">
      <Grid role="row" size={{ xs: 12, md: 6 }}>
        <Card variant="outlined">
          <CardHeader title="Outlined" subheader="Card header" />
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              Card content uses theme spacing tokens for padding. Outlined variant references palette.divider.
            </Typography>
          </CardContent>
          <CardActions>
            <Button size="small">Action</Button>
          </CardActions>
        </Card>
      </Grid>
      <Grid role="row" size={{ xs: 12, md: 6 }}>
        <Card elevation={6}>
          <CardHeader title="Elevated" subheader="Shadow level 6" />
          <CardContent>
            <Typography variant="body2">
              Elevation relies on theme.shadows entries. Inspect them in the tokens section.
            </Typography>
          </CardContent>
          <CardActions>
            <Button size="small">Primary</Button>
            <Button size="small" color="secondary">
              Secondary
            </Button>
          </CardActions>
        </Card>
      </Grid>
    </Grid>
  );
}

function TabsShowcase(): React.ReactElement {
  const [value, setValue] = React.useState(0);
  const handleChange = (_: React.SyntheticEvent, newValue: number) => setValue(newValue);
  return (
    <Stack spacing={3}>
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Tabs value={value} onChange={handleChange} aria-label="Text tabs">
          <Tab label="Item One" />
          <Tab label="Item Two" />
          <Tab label="Item Three" />
        </Tabs>
      </Paper>
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Tabs value={value} onChange={handleChange} aria-label="Icon tabs">
          <Tab icon={<Palette />} iconPosition="start" label="Palette" />
          <Tab icon={<PaletteOutlined />} iconPosition="start" label="Outline" />
        </Tabs>
      </Paper>
    </Stack>
  );
}

function TableShowcase(): React.ReactElement {
  const rows = [
    { id: 1, name: 'Item 1', calories: 120 },
    { id: 2, name: 'Item 2', calories: 98 },
    { id: 3, name: 'Item 3', calories: 145 },
  ];
  const columns = [
    { field: 'name', headerName: 'Dessert', flex: 1 },
    { field: 'calories', headerName: 'Calories', flex: 1 },
  ];
  return (
    <Stack spacing={2}>
      <Paper variant="outlined" sx={{ height: 280, p: 1 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          hideFooter
          density="standard"
          aria-label="Normal density data grid"
        />
      </Paper>
      <Paper variant="outlined" sx={{ height: 280, p: 1 }}>
        <DataGrid rows={rows} columns={columns} hideFooter density="compact" aria-label="Dense data grid" />
      </Paper>
    </Stack>
  );
}

function PaginationShowcase(): React.ReactElement {
  return (
    <Stack spacing={2} alignItems="center">
      <Pagination count={10} variant="text" color="primary" />
    </Stack>
  );
}

function BreadcrumbsShowcase(): React.ReactElement {
  return (
    <Breadcrumbs aria-label="Breadcrumb">
      <Link color="inherit" href="#">
        Home
      </Link>
      <Link color="inherit" href="#">
        Catalog
      </Link>
      <Typography color="text.primary">Product</Typography>
    </Breadcrumbs>
  );
}

function AvatarBadgeShowcase(): React.ReactElement {
  return (
    <Stack direction="row" spacing={4} alignItems="center">
      <Badge color="primary" badgeContent={4} overlap="circular">
        <Avatar alt="Jane Doe" src="https://i.pravatar.cc/64" />
      </Badge>
      <Badge color="secondary" overlap="circular" variant="dot">
        <Avatar sx={{ bgcolor: 'primary.main' }}>LS</Avatar>
      </Badge>
    </Stack>
  );
}

function TooltipShowcase(): React.ReactElement {
  return (
    <Stack direction="row" spacing={3}>
      <Tooltip title="Tooltip with arrow" arrow>
        <Button variant="outlined">Hover me</Button>
      </Tooltip>
      <Tooltip title="High contrast" arrow placement="top">
        <IconButton aria-label="Info tooltip">
          <Palette />
        </IconButton>
      </Tooltip>
    </Stack>
  );
}

function ProgressShowcase(): React.ReactElement {
  return (
    <Stack direction="row" spacing={4} alignItems="center">
      <CircularProgress color="primary" />
      <CircularProgress variant="determinate" value={75} color="primary" />
      <Box sx={{ width: 160 }}>
        <Typography variant="caption">Linear</Typography>
        <LinearProgress value={50} variant="determinate" color="primary" />
      </Box>
      <Box sx={{ width: 160 }}>
        <Typography variant="caption">Indeterminate</Typography>
        <LinearProgress color="primary" />
      </Box>
    </Stack>
  );
}

function SkeletonShowcase(): React.ReactElement {
  return (
    <Stack spacing={2}>
      <Skeleton variant="text" width="80%" />
      <Skeleton variant="rectangular" width="100%" height={80} />
      <Skeleton variant="circular" width={40} height={40} />
    </Stack>
  );
}
