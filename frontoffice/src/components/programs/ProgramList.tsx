import * as React from 'react';
import { Search } from '@mui/icons-material';
import {
  Grid,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

import { ProgramCard, type ProgramActionKey } from '@components/programs/ProgramCard';

import type { Program } from '@hooks/programs/usePrograms';

export interface ProgramListProps {
  programs: Program[];
  loading: boolean;
  placeholderTitle: string;
  placeholderSubtitle: string;
  placeholderHelper?: string;
  actionSlot?: React.ReactNode;
  onDeleteProgram?: (programId: string) => Promise<void> | void;
  onEditProgram?: (program: Program) => void;
  onCloneProgram?: (
    program: Program,
    payload: { label: string; athleteId: string | null; openBuilder: boolean },
  ) => Promise<void>;
  onViewProgram?: (program: Program) => void;
  onPrefetch?: (action: 'view' | 'edit') => void;
  allowedActions?: ProgramActionKey[];
  onSearchChange?: (query: string) => void;
  searchPlaceholder?: string;
  searchAriaLabel?: string;
  searchQuery?: string;
  searchDebounceMs?: number;
  resultCountLabel?: string;
}

export const ProgramList = React.memo(function ProgramList({
  programs,
  loading,
  placeholderTitle,
  placeholderSubtitle,
  placeholderHelper,
  actionSlot,
  onDeleteProgram,
  onEditProgram,
  onCloneProgram,
  onViewProgram,
  onPrefetch,
  allowedActions,
  onSearchChange,
  searchPlaceholder,
  searchAriaLabel,
  searchQuery,
  searchDebounceMs = 400,
  resultCountLabel,
}: ProgramListProps): React.JSX.Element {
  const theme = useTheme();
  const showPlaceholder = !loading && programs.length === 0;
  const actionKeys = allowedActions ?? ['view', 'copy', 'edit', 'delete'];
  const [searchValue, setSearchValue] = React.useState(searchQuery ?? '');

  React.useEffect(() => {
    setSearchValue(searchQuery ?? '');
  }, [searchQuery]);

  React.useEffect(() => {
    if (!onSearchChange) {
      return undefined;
    }

    const normalizedNext = searchValue.trim();
    const normalizedPrevious = (searchQuery ?? '').trim();

    if (normalizedNext === normalizedPrevious) {
      return undefined;
    }

    const handler = window.setTimeout(() => {
      onSearchChange(normalizedNext);
    }, searchDebounceMs);

    return () => {
      window.clearTimeout(handler);
    };
  }, [onSearchChange, searchDebounceMs, searchQuery, searchValue]);

  return (
    <Stack spacing={3} sx={{ width: '100%' }}>
      {/* General information */}
      {onSearchChange || actionSlot ? (
        <Stack
          alignItems="stretch"
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          sx={{ width: '100%' }}
        >
          {onSearchChange ? (
            <Stack
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              direction={{ xs: 'column', sm: 'row' }}
              spacing={0.5}
              sx={{ flex: 1, minWidth: 0 }}
            >
              <TextField
                fullWidth
                inputProps={{ 'aria-label': searchAriaLabel ?? searchPlaceholder }}
                onChange={(event) => {
                  setSearchValue(event.target.value);
                }}
                placeholder={searchPlaceholder}
                size="small"
                value={searchValue}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search color="action" fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{ bgcolor: 'common.white' }}
              />
              {resultCountLabel ? (
                <Typography color="text.secondary" variant="body2">
                  {resultCountLabel}
                </Typography>
              ) : null}
            </Stack>
          ) : null}

          {actionSlot ? (
            <Stack
              alignItems="center"
              direction="row"
              justifyContent="flex-end"
              spacing={1}
              sx={{ ml: { xs: 0, sm: 'auto' } }}
            >
              {actionSlot}
            </Stack>
          ) : null}
        </Stack>
      ) : null}

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
                onPrefetch={onPrefetch}
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
});
