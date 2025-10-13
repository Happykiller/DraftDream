// src/pages/theme-studio/components/TokenTypography.tsx
import { Paper, Stack, Typography } from '@mui/material';
import type { Theme, TypographyStyle } from '@mui/material/styles';

import { CopyTokenButton } from '@pages/theme-studio/components/CopyTokenButton';

type TokenTypographyProps = {
  theme: Theme;
  variant: keyof Theme['typography'];
};

const DEFAULT_HTML_FONT_SIZE = 16;

/** Display a typography variant sample with detailed metrics. */
export function TokenTypography({ theme, variant }: TokenTypographyProps) {
  const style = theme.typography[variant] as TypographyStyle;
  const htmlFontSize = theme.typography.htmlFontSize ?? DEFAULT_HTML_FONT_SIZE;
  const fontSizePx = resolveFontSizePx(style.fontSize, htmlFontSize);
  const lineHeightPx = resolveLineHeightPx(style.lineHeight, fontSizePx, htmlFontSize);
  const letterSpacingPx = resolveLetterSpacingPx(style.letterSpacing, fontSizePx, htmlFontSize);
  const fontWeight = style.fontWeight ?? theme.typography.fontWeightRegular ?? 400;

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
      <Stack spacing={1}>
        <Typography variant="subtitle2">typography.{variant}</Typography>
        <Typography variant={variant as any} component="p">
          The quick brown fox jumps over the lazy dog.
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Font size: {formatPx(fontSizePx)} ({theme.typography.pxToRem(fontSizePx)})
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Line height:{' '}
          {lineHeightPx !== null && fontSizePx
            ? `${formatPx(lineHeightPx)} (${(lineHeightPx / fontSizePx).toFixed(2)}x)`
            : 'auto'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Font weight: {fontWeight}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Letter spacing: {letterSpacingPx !== null ? `${formatPx(letterSpacingPx)} (${theme.typography.pxToRem(letterSpacingPx)})` : '—'}
        </Typography>
        <CopyTokenButton token={`theme.typography.${variant}`} />
      </Stack>
    </Paper>
  );
}

function resolveFontSizePx(value: TypographyStyle['fontSize'], htmlFontSize: number): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    if (value.endsWith('rem')) return parseFloat(value) * htmlFontSize;
    if (value.endsWith('px')) return parseFloat(value);
    const numeric = Number(value);
    if (!Number.isNaN(numeric)) return numeric;
  }
  return htmlFontSize;
}

function resolveLineHeightPx(
  value: TypographyStyle['lineHeight'],
  fontSizePx: number,
  htmlFontSize: number
): number | null {
  if (value == null) return null;
  if (typeof value === 'number') {
    return fontSizePx * value;
  }
  if (typeof value === 'string') {
    if (value.endsWith('rem')) return parseFloat(value) * htmlFontSize;
    if (value.endsWith('px')) return parseFloat(value);
    const numeric = Number(value);
    if (!Number.isNaN(numeric)) return fontSizePx * numeric;
  }
  return null;
}

function resolveLetterSpacingPx(
  value: TypographyStyle['letterSpacing'],
  fontSizePx: number,
  htmlFontSize: number
): number | null {
  if (value == null) return null;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    if (value.endsWith('em')) return parseFloat(value) * fontSizePx;
    if (value.endsWith('rem')) return parseFloat(value) * htmlFontSize;
    if (value.endsWith('px')) return parseFloat(value);
    const numeric = Number(value);
    if (!Number.isNaN(numeric)) return numeric;
  }
  return null;
}

function formatPx(value: number | null): string {
  if (value == null) return '—';
  return `${value.toFixed(2).replace(/\.00$/, '')} px`;
}
