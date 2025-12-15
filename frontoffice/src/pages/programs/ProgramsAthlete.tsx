// src/pages/ProgramsAthlete.tsx
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import { ProgramList } from '@components/programs/ProgramList';
import { type Program, usePrograms } from '@hooks/programs/usePrograms';
import { session } from '@stores/session';

type AthleteEmptyStateCopy = {
  title: string;
  description: string;
  helper: string;
};

/** Athlete-facing list of assigned training programs. */
export function ProgramsAthlete(): React.JSX.Element {
  const { t } = useTranslation();
  const athleteId = session((state) => state.id);
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = React.useState('');

  const emptyStateCopy = t('programs-athlete.empty_state', {
    returnObjects: true,
  }) as AthleteEmptyStateCopy;

  const { items: programs, total: totalPrograms, loading: listLoading } = usePrograms({
    page: 1,
    limit: 12,
    q: searchQuery,
    userId: athleteId ?? undefined,
  });

  const searchPlaceholder = t('programs-athlete.list.search_placeholder');
  const searchAriaLabel = t('programs-athlete.list.search_aria_label');

  const resultCountLabel = React.useMemo(
    () =>
      listLoading
        ? undefined
        : t('programs-athlete.list.result_count', {
            count: programs.length,
            total: totalPrograms,
          }),
    [listLoading, programs.length, t, totalPrograms],
  );

  const handleNavigateToProgram = React.useCallback(
    (nextProgram: Program) => {
      navigate(`/programs-athlete/view/${nextProgram.id}`);
    },
    [navigate],
  );

  const handleSearchChange = React.useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  return (
    <Stack spacing={3} sx={{ width: '100%', mt: 2, px: { xs: 1, sm: 2 } }}>
      {/* General information */}
      <Stack spacing={3}>
        <Stack spacing={1}>
          <Typography variant="h5">{t('nutrition-athlete.subtitle')}</Typography>
          <Typography color="text.secondary">{t('nutrition-athlete.subtitle')}</Typography>
        </Stack>

        <ProgramList
          programs={programs}
          loading={listLoading}
          placeholderTitle={emptyStateCopy.title}
          placeholderSubtitle={emptyStateCopy.description}
          placeholderHelper={emptyStateCopy.helper}
          allowedActions={['view']}
          onViewProgram={handleNavigateToProgram}
          onSearchChange={handleSearchChange}
          searchPlaceholder={searchPlaceholder}
          searchAriaLabel={searchAriaLabel}
          searchQuery={searchQuery}
          resultCountLabel={resultCountLabel}
        />
      </Stack>
    </Stack>
  );
}
