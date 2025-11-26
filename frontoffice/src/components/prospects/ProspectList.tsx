// src/components/prospects/ProspectList.tsx
import * as React from 'react';
import { Search } from '@mui/icons-material';
import { Box, Grid, InputAdornment, Skeleton, Stack, TextField, Typography } from '@mui/material';

import { ProspectCard } from './ProspectCard';

import type { Prospect } from '@app-types/prospects';

export interface ProspectListProps {
  prospects: Prospect[];
  loading: boolean;
  searchQuery: string;
  searchPlaceholder: string;
  searchAriaLabel: string;
  emptyTitle: string;
  emptyDescription: string;
  onSearchChange: (value: string) => void;
  onEditProspect: (prospect: Prospect) => void;
  onDeleteProspect: (prospect: Prospect) => void;
}

/** List wrapper exposing search and responsive card layout for prospects. */
export function ProspectList({
  prospects,
  loading,
  searchQuery,
  searchPlaceholder,
  searchAriaLabel,
  emptyTitle,
  emptyDescription,
  onSearchChange,
  onEditProspect,
  onDeleteProspect,
}: ProspectListProps): React.JSX.Element {
  const showEmpty = !loading && prospects.length === 0;

  return (
    <Stack spacing={2} sx={{ width: '100%' }}>
      {/* General information */}
      <TextField
        value={searchQuery}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder={searchPlaceholder}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search fontSize="small" color="disabled" />
            </InputAdornment>
          ),
          'aria-label': searchAriaLabel,
        }}
        size="small"
      />

      {loading ? (
        <Grid container spacing={2}>
          {Array.from({ length: 6 }).map((_, index) => (
            <Grid key={index} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <Skeleton variant="rounded" height={280} />
            </Grid>
          ))}
        </Grid>
      ) : showEmpty ? (
        <Box
          sx={{
            border: '1px dashed',
            borderColor: 'divider',
            borderRadius: 2,
            p: 4,
            textAlign: 'center',
            bgcolor: 'background.default',
          }}
        >
          <Typography variant="h6">{emptyTitle}</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            {emptyDescription}
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {prospects.map((prospect) => (
            <Grid key={prospect.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <ProspectCard
                prospect={prospect}
                onEdit={onEditProspect}
                onDelete={onDeleteProspect}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Stack>
  );
}
