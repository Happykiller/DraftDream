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

  const emptyStateCopy = t('programs-athlete.empty_state', {
    returnObjects: true,
  }) as AthleteEmptyStateCopy;

  const { items: programs, loading: listLoading } = usePrograms({
    page: 1,
    limit: 12,
    q: '',
    userId: athleteId ?? undefined,
  });

  const handleNavigateToProgram = React.useCallback(
    (nextProgram: Program) => {
      navigate(`/programs-athlete/view/${nextProgram.id}`);
    },
    [navigate],
  );

  return (
    <Stack spacing={3} sx={{ width: '100%', mt: 2, px: { xs: 1, sm: 2 } }}>
      {/* General information */}
      <Stack spacing={3}>
        <Stack spacing={1}>
          <Typography color="text.secondary">{t('programs-athlete.subtitle')}</Typography>
        </Stack>

        <ProgramList
          programs={programs}
          loading={listLoading}
          placeholderTitle={emptyStateCopy.title}
          placeholderSubtitle={emptyStateCopy.description}
          placeholderHelper={emptyStateCopy.helper}
          allowedActions={['view']}
          onViewProgram={handleNavigateToProgram}
        />
      </Stack>
    </Stack>
  );
}
