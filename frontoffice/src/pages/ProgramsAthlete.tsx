// src/pages/ProgramsAthlete.tsx
import * as React from 'react';
import { Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

import { ProgramList } from '@src/components/programs/ProgramList';
import { usePrograms } from '@src/hooks/usePrograms';
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

  const emptyStateCopy = t('programs-athlete.empty_state', {
    returnObjects: true,
  }) as AthleteEmptyStateCopy;

  const { items: programs, loading } = usePrograms({
    page: 1,
    limit: 12,
    q: '',
    userId: athleteId ?? undefined,
  });

  return (
    <Stack spacing={3} sx={{ width: '100%', mt: 2, px: { xs: 1, sm: 2 } }}>
      {/* General information */}
      <Stack spacing={1}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          {t('programs-athlete.title')}
        </Typography>
        <Typography color="text.secondary">{t('programs-athlete.subtitle')}</Typography>
      </Stack>

      <ProgramList
        programs={programs}
        loading={loading}
        placeholderTitle={emptyStateCopy.title}
        placeholderSubtitle={emptyStateCopy.description}
        placeholderHelper={emptyStateCopy.helper}
        allowedActions={['view']}
      />
    </Stack>
  );
}
