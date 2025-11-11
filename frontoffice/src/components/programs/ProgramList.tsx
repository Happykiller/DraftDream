import * as React from 'react';
import { alpha, useTheme } from '@mui/material/styles';
import { Grid, Paper, Stack, Typography } from '@mui/material';

import { ProgramCard, type ProgramActionKey } from '@components/programs/ProgramCard';

import type { Program } from '@hooks/programs/usePrograms';

interface ProgramListProps {
  programs: Program[];
  loading: boolean;
  placeholderTitle: string;
  placeholderSubtitle: string;
  placeholderHelper?: string;
  onDeleteProgram?: (programId: string) => Promise<void> | void;
  onEditProgram?: (program: Program) => void;
  onCloneProgram?: (
    program: Program,
    payload: { label: string; athleteId: string | null; openBuilder: boolean },
  ) => Promise<void>;
  onViewProgram?: (program: Program) => void;
  allowedActions?: ProgramActionKey[];
}

export function ProgramList({
  programs,
  loading,
  placeholderTitle,
  placeholderSubtitle,
  placeholderHelper,
  onDeleteProgram,
  onEditProgram,
  onCloneProgram,
  onViewProgram,
  allowedActions,
}: ProgramListProps): React.JSX.Element {
  const theme = useTheme();
  const showPlaceholder = !loading && programs.length === 0;
  const actionKeys = allowedActions ?? ['view', 'copy', 'edit', 'delete'];

  return (
    <Stack spacing={3} sx={{ width: '100%' }}>
      {/* Program grid */}
      {!loading && programs.length > 0 && (
        <Grid container spacing={3}>
          {programs.map((program) => (
            <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={program.id}>
              <ProgramCard
                program={program}
                allowedActions={actionKeys}
                onDelete={onDeleteProgram}
                onEdit={onEditProgram}
                onClone={onCloneProgram}
                onView={onViewProgram}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Empty state */}
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
          {placeholderHelper && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {placeholderHelper}
            </Typography>
          )}
        </Paper>
      )}
    </Stack>
  );
}
