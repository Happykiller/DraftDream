// src/components/athletes/AthleteLinkList.tsx
import * as React from 'react';
import { Search } from '@mui/icons-material';
import { Box, Grid, InputAdornment, Skeleton, Stack, TextField, Typography } from '@mui/material';

import { AthleteLinkCard } from './AthleteLinkCard';

import type { CoachAthleteLink } from '@types/coachAthletes';

export interface AthleteLinkListProps {
  links: CoachAthleteLink[];
  loading: boolean;
  searchQuery: string;
  searchPlaceholder: string;
  searchAriaLabel: string;
  emptyTitle: string;
  emptyDescription: string;
  onSearchChange: (value: string) => void;
}

/** Athlete list with search input and responsive card layout. */
export function AthleteLinkList({
  links,
  loading,
  searchQuery,
  searchPlaceholder,
  searchAriaLabel,
  emptyTitle,
  emptyDescription,
  onSearchChange,
}: AthleteLinkListProps): React.JSX.Element {
  const filteredLinks = React.useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return links;

    return links.filter((link) => {
      const tokens = [
        `${link.athlete?.first_name ?? ''} ${link.athlete?.last_name ?? ''}`,
        link.athlete?.email ?? '',
        link.note ?? '',
      ];
      return tokens.some((token) => token.trim().toLowerCase().includes(query));
    });
  }, [links, searchQuery]);

  const showEmpty = !loading && filteredLinks.length === 0;

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
              <Skeleton variant="rounded" height={220} />
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
          {filteredLinks.map((link) => (
            <Grid key={link.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <AthleteLinkCard link={link} />
            </Grid>
          ))}
        </Grid>
      )}
    </Stack>
  );
}
