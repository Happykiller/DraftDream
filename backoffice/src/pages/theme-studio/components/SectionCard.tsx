// src/pages/theme-studio/components/SectionCard.tsx
import * as React from 'react';
import { Card, CardContent, CardHeader, Divider, Stack, Typography } from '@mui/material';

import { CopyTokenButton } from '@pages/theme-studio/components/CopyTokenButton';

type SectionCardProps = {
  title: string;
  subtitle: string;
  tokens: string[];
  children: React.ReactNode;
};

/** Shared layout for component sections with token copy helpers. */
export function SectionCard({ title, subtitle, tokens, children }: SectionCardProps): React.ReactElement {
  const headingId = React.useId();
  return (
    <Card component="article" variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }} aria-labelledby={headingId}>
      <CardHeader
        title={
          <Typography id={headingId} variant="h6" component="h2">
            {title}
          </Typography>
        }
        subheader={
          <Typography variant="body2" color="text.secondary">
            {subtitle}
          </Typography>
        }
      />
      {tokens.length > 0 && (
        <>
          <Divider aria-hidden />
          <CardContent sx={{ pt: 2, pb: 1 }}>
            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" aria-label="Token references">
              {tokens.map((token) => (
                <CopyTokenButton key={token} token={token} />
              ))}
            </Stack>
          </CardContent>
        </>
      )}
      <Divider aria-hidden />
      <CardContent>{children}</CardContent>
    </Card>
  );
}
