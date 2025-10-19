// src/pages/ProgramsCoach.tsx
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { alpha, useTheme } from '@mui/material/styles';
import {
  Button,
  CircularProgress,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { Add } from '@mui/icons-material';

import { ProgramBuilderPanel, type BuilderCopy } from '@src/components/programs/ProgramBuilderPanel';
import { ProgramCard } from '@src/components/programs/ProgramCard';

import { usePrograms } from '@src/hooks/usePrograms';

export function ProgramsCoach(): React.JSX.Element {
  const { t } = useTranslation();
  const theme = useTheme();

  const [builderOpen, setBuilderOpen] = React.useState<boolean>(false);

  const builderCopy = t('programs-coatch.builder', {
    returnObjects: true,
  }) as unknown as BuilderCopy;

  const { items: programs, loading } = usePrograms({
    page: 1,
    limit: 12,
    q: '',
  });

  const showPlaceholder = !builderOpen && !loading && programs.length === 0;

  return (
    <Stack spacing={2} sx={{ mt: 2 }}>
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'flex-start', md: 'center' }}
        justifyContent="space-between"
        spacing={2}
      >
        <Stack direction="row" spacing={1.5}>
          {!builderOpen && (
            <Button
              variant="contained"
              color="success"
              startIcon={<Add fontSize="small" />}
              onClick={() => setBuilderOpen(true)}
            >
              {t('programs-coatch.actions.open_builder')}
            </Button>
          )}
        </Stack>
      </Stack>

      {builderOpen ? (
        <ProgramBuilderPanel
          builderCopy={builderCopy}
          onCancel={() => setBuilderOpen(false)}
        />
      ) : (
        <Stack spacing={3}>
          {loading && (
            <Stack alignItems="center" py={6}>
              <CircularProgress color="primary" />
            </Stack>
          )}

          {!loading && programs.length > 0 && (
            <Grid container spacing={3}>
              {programs.map((program) => (
                <Grid item xs={12} sm={6} lg={4} key={program.id}>
                  <ProgramCard program={program} />
                </Grid>
              ))}
            </Grid>
          )}

          {showPlaceholder && (
            <Paper
              sx={{
                borderRadius: 3,
                p: { xs: 3, md: 5 },
                textAlign: 'center',
                bgcolor: alpha(theme.palette.primary.light, 0.08),
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                {t('programs-coatch.placeholder')}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {builderCopy.subtitle}
              </Typography>
            </Paper>
          )}
        </Stack>
      )}
    </Stack>
  );
}
