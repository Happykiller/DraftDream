import * as React from 'react';
import { alpha, useTheme } from '@mui/material/styles';
import {
  CircularProgress,
  Grid,
  Paper,
  Stack,
  Typography,
} from '@mui/material';

import { ProgramCard } from '@src/components/programs/ProgramCard';

import type { Program } from '@src/hooks/usePrograms';

interface ProgramListProps {
  programs: Program[];
  loading: boolean;
  placeholderTitle: string;
  placeholderSubtitle: string;
  onDeleteProgram: (programId: string) => void;
  onEditProgram: (program: Program) => void;
}

export function ProgramList({
  programs,
  loading,
  placeholderTitle,
  placeholderSubtitle,
  onDeleteProgram,
  onEditProgram,
}: ProgramListProps): React.JSX.Element {
  const theme = useTheme();
  const showPlaceholder = !loading && programs.length === 0;

  return (
    <Stack spacing={3} sx={{ width: '100%' }}>
      {loading && (
        <Stack alignItems="center" py={6}>
          <CircularProgress color="primary" />
        </Stack>
      )}

      {!loading && programs.length > 0 && (
        <Grid container spacing={3}>
          {programs.map((program) => (
            <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={program.id}>
              <ProgramCard
                program={program}
                onDelete={onDeleteProgram}
                onEdit={onEditProgram}
              />
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
            {placeholderTitle}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {placeholderSubtitle}
          </Typography>
        </Paper>
      )}
    </Stack>
  );
}
