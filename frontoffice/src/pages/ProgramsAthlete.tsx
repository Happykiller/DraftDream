// src/pages/ProgramsAthlete.tsx
import * as React from 'react';
import { Grid, Paper, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

/** Athlete-facing list of assigned training programs. */
export function ProgramsAthlete(): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <Grid container spacing={3} sx={{ mt: 2 }}>
      {/* General information */}
      <Grid>
        <Stack spacing={1}>
          <Typography variant="h4">{t('programs-athlete.title')}</Typography>
          <Typography color="text.secondary">{t('programs-athlete.subtitle')}</Typography>
        </Stack>
      </Grid>

      <Grid>
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 2,
            border: (theme) => `1px solid ${theme.palette.divider}`,
            bgcolor: (theme) => theme.palette.background.paper,
          }}
        >
          <Stack spacing={1}>
            <Typography variant="h6">{t('programs-athlete.empty_state.title')}</Typography>
            <Typography color="text.secondary">
              {t('programs-athlete.empty_state.description')}
            </Typography>
            <Typography color="text.secondary" variant="body2">
              {t('programs-athlete.empty_state.helper')}
            </Typography>
          </Stack>
        </Paper>
      </Grid>
    </Grid>
  );
}
