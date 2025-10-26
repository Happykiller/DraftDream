// src/pages/ProgramsAthlete.tsx
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowBack } from '@mui/icons-material';
import { Button, Stack, Typography } from '@mui/material';

import { ProgramList } from '@src/components/programs/ProgramList';
import { ProgramViewContent } from '@src/components/programs/ProgramViewContent';
import { formatProgramDate } from '@src/components/programs/programFormatting';
import { getProgramAthleteLabel, type ProgramViewTab } from '@src/components/programs/programViewUtils';
import { type Program, usePrograms } from '@src/hooks/usePrograms';
import { session } from '@stores/session';

type AthleteEmptyStateCopy = {
  title: string;
  description: string;
  helper: string;
};

/** Athlete-facing list of assigned training programs. */
export function ProgramsAthlete(): React.JSX.Element {
  const { t, i18n } = useTranslation();
  const athleteId = session((state) => state.id);
  const [selectedProgram, setSelectedProgram] = React.useState<Program | null>(null);
  const [activeTab, setActiveTab] = React.useState<ProgramViewTab>('overview');

  const emptyStateCopy = t('programs-athlete.empty_state', {
    returnObjects: true,
  }) as AthleteEmptyStateCopy;

  const { items: programs, loading } = usePrograms({
    page: 1,
    limit: 12,
    q: '',
    userId: athleteId ?? undefined,
  });

  const handleViewProgram = React.useCallback((program: Program) => {
    setSelectedProgram(program);
    setActiveTab('overview');
  }, []);

  const handleCloseProgram = React.useCallback(() => {
    setSelectedProgram(null);
    setActiveTab('overview');
  }, []);

  const handleTabChange = React.useCallback((tab: ProgramViewTab) => {
    setActiveTab(tab);
  }, []);

  const programCreatedOn = React.useMemo(() => {
    if (!selectedProgram) {
      return '';
    }

    return formatProgramDate(selectedProgram.createdAt, i18n.language);
  }, [i18n.language, selectedProgram]);

  const programUpdatedOn = React.useMemo(() => {
    if (!selectedProgram) {
      return '';
    }

    return t('programs-coatch.list.updated_on', {
      date: formatProgramDate(selectedProgram.updatedAt, i18n.language),
    });
  }, [i18n.language, selectedProgram, t]);

  const programSubtitle = React.useMemo(() => {
    if (!selectedProgram) {
      return t('programs-athlete.subtitle');
    }

    const athleteLabel = getProgramAthleteLabel(selectedProgram);

    return athleteLabel
      ? t('programs-coatch.view.dialog.subtitle_with_athlete', {
          athlete: athleteLabel,
          date: programCreatedOn,
        })
      : t('programs-coatch.view.dialog.subtitle_without_athlete', {
          date: programCreatedOn,
        });
  }, [programCreatedOn, selectedProgram, t]);

  return (
    <Stack spacing={3} sx={{ width: '100%', mt: 2, px: { xs: 1, sm: 2 } }}>
      {/* General information */}
      <Stack spacing={1}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          {selectedProgram ? selectedProgram.label : t('programs-athlete.title')}
        </Typography>
        <Typography color="text.secondary">{programSubtitle}</Typography>
      </Stack>

      {selectedProgram ? (
        <Stack spacing={2.5}>
          <Button
            variant="text"
            color="primary"
            startIcon={<ArrowBack fontSize="small" />}
            onClick={handleCloseProgram}
            sx={{ alignSelf: 'flex-start' }}
          >
            {t('programs-athlete.actions.back_to_list')}
          </Button>

          <ProgramViewContent
            program={selectedProgram}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            updatedOnLabel={programUpdatedOn}
          />
        </Stack>
      ) : (
        <ProgramList
          programs={programs}
          loading={loading}
          placeholderTitle={emptyStateCopy.title}
          placeholderSubtitle={emptyStateCopy.description}
          placeholderHelper={emptyStateCopy.helper}
          allowedActions={['view']}
          onViewProgram={handleViewProgram}
        />
      )}
    </Stack>
  );
}
