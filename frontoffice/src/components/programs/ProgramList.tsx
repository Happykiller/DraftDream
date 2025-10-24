import * as React from 'react';
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

import { ProgramCard } from '@src/components/programs/ProgramCard';

import type { Program } from '@src/hooks/usePrograms';

interface ProgramListProps {
  programs: Program[];
  loading: boolean;
  placeholderTitle: string;
  placeholderSubtitle: string;
  openBuilderLabel: string;
  onOpenBuilder: () => void;
  onDeleteProgram: (programId: string) => void;
  onEditProgram: (program: Program) => void;
  onCloneProgram: (program: Program, payload: { label: string; athleteId: string | null }) => Promise<void>;
}

export function ProgramList({
  programs,
  loading,
  placeholderTitle,
  placeholderSubtitle,
  openBuilderLabel,
  onOpenBuilder,
  onDeleteProgram,
  onEditProgram,
  onCloneProgram,
}: ProgramListProps): React.JSX.Element {
  const theme = useTheme();
  const showPlaceholder = !loading && programs.length === 0;

  return (
    <Stack spacing={3} sx={{ width: '100%', mt: 2, px: { xs: 1, sm: 2 } }}>
      {/* Toolbar */}
      <Stack direction="row" justifyContent="flex-end" sx={{ width: '100%' }}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add fontSize="small" />}
          onClick={onOpenBuilder}
        >
          {openBuilderLabel}
        </Button>
      </Stack>

      {/* Loading state */}
      {loading && (
        <Stack alignItems="center" py={6}>
          <CircularProgress color="primary" />
        </Stack>
      )}

      {/* Program grid */}
      {!loading && programs.length > 0 && (
        <Grid container spacing={3}>
          {programs.map((program) => (
            <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={program.id}>
              <ProgramCard
                program={program}
                onDelete={onDeleteProgram}
                onEdit={onEditProgram}
                onClone={(item, payload) => onCloneProgram(item, payload)}
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
        </Paper>
      )}
    </Stack>
  );
}
