// src/pages/ProgramsCoach.tsx
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Add, Refresh } from '@mui/icons-material';
import { Button, IconButton, Stack, Tooltip, Typography } from '@mui/material';

import { ProgramList } from '@components/programs/ProgramList';
import { type BuilderCopy } from '@components/programs/ProgramBuilderPanel';

import { usePrograms, type Program } from '@hooks/programs/usePrograms';


/** Coach-facing program management dashboard. */
export function ProgramsCoach(): React.JSX.Element {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState('');

  const builderCopy = React.useMemo(
    () =>
      t('programs-coatch.builder', {
        returnObjects: true,
      }) as unknown as BuilderCopy,
    [t],
  );

  const {
    items: programs,
    total: totalPrograms,
    loading,
    reload,
    remove,
    create,
  } = usePrograms({
    page: 1,
    limit: 12,
    q: searchQuery,
  });

  const searchPlaceholder = t('programs-coatch.list.search_placeholder');
  const searchAriaLabel = t('programs-coatch.list.search_aria_label');

  const resultCountLabel = React.useMemo(
    () =>
      loading
        ? undefined
        : t('programs-coatch.list.result_count', {
          count: programs.length,
          total: totalPrograms,
        }),
    [loading, programs.length, t, totalPrograms],
  );

  const handleRefresh = React.useCallback(() => {
    void reload();
  }, [reload]);

  const handleProgramSaved = React.useCallback(() => {
    void reload();
  }, [reload]);

  const handleDeleteProgram = React.useCallback(
    async (programId: string) => {
      await remove(programId);
    },
    [remove],
  );

  const handleCreateProgram = React.useCallback(() => {
    navigate('/programs-coach/create');
  }, [navigate]);

  const handleEditProgram = React.useCallback(
    (program: Program) => {
      navigate(`/programs-coach/edit/${program.id}`);
    },
    [navigate],
  );

  const handleViewProgram = React.useCallback(
    (program: Program) => {
      navigate(`/programs-coach/view/${program.id}`);
    },
    [navigate],
  );

  const handleCloneProgram = React.useCallback(
    async (
      baseProgram: Program,
      payload: { label: string; athleteId: string | null; openBuilder: boolean },
    ) => {
      const sessionSnapshots = baseProgram.sessions.map((session) => ({
        id: session.id,
        templateSessionId: session.templateSessionId ?? undefined,
        label: session.label,
        durationMin: session.durationMin,
        description: session.description ?? undefined,
        exercises: session.exercises.map((exercise) => ({
          id: exercise.id,
          templateExerciseId: exercise.templateExerciseId ?? undefined,
          label: exercise.label,
          series: exercise.series ?? undefined,
          repetitions: exercise.repetitions ?? undefined,
          restSeconds: exercise.restSeconds ?? undefined,
          description: exercise.description ?? undefined,
          instructions: exercise.instructions ?? undefined,
          charge: exercise.charge ?? undefined,
          videoUrl: exercise.videoUrl ?? undefined,
        })),
      }));

      const cloned = await create({

        locale: baseProgram.locale || i18n.language,
        label: payload.label,
        duration: baseProgram.duration,
        frequency: baseProgram.frequency,
        description: baseProgram.description ?? '',
        sessions: sessionSnapshots,
        sessionIds: baseProgram.sessions.map((session) => session.id),
        userId: payload.athleteId,
      });

      if (payload.openBuilder) {
        navigate(`/programs-coach/edit/${cloned.id}`);
        return;
      }

      handleProgramSaved();
    },
    [create, handleProgramSaved, i18n.language, navigate],
  );

  const handleSearchChange = React.useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  const handlePrefetch = React.useCallback((action: 'view' | 'edit') => {
    if (action === 'edit') {
      void import('@src/pages/programs/ProgramCoachEdit');
      void import('@src/pages/programs/ProgramCoachEdit.loader');
    } else if (action === 'view') {
      void import('@src/pages/programs/ProgramDetails');
      void import('@src/pages/programs/ProgramDetails.loader');
    }
  }, []);

  return (
    <Stack spacing={3} sx={{ width: '100%', mt: 2, px: { xs: 1, sm: 2 } }}>
      {/* General information */}
      <Stack spacing={1}>
        <Stack
          alignItems="center"
          direction="row"
          flexWrap="wrap"
          justifyContent="space-between"
          spacing={2}
        >
          <Typography variant="h5">{t('programs-coatch.subtitle')}</Typography>

          <Stack alignItems="center" direction="row" spacing={1} sx={{ ml: 'auto' }}>
            <Tooltip title={t('programs-coatch.actions.open_builder')} arrow>
              <Button
                aria-label={t('programs-coatch.actions.open_builder')}
                color="success"
                onClick={handleCreateProgram}
                size="small"
                startIcon={<Add />}
                variant="contained"
              >
                {t('common.actions.create')}
              </Button>
            </Tooltip>
            <Tooltip title={t('programs-coatch.actions.refresh')} arrow>
              <IconButton
                aria-label={t('programs-coatch.actions.refresh')}
                color="success"
                onClick={handleRefresh}
              >
                <Refresh />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
        <Typography color="text.secondary" variant="body2">
          {t('programs-coatch.helper')}
        </Typography>
      </Stack>

      <ProgramList
        programs={programs}
        loading={loading}
        placeholderTitle={t('programs-coatch.placeholder')}
        placeholderSubtitle={builderCopy.subtitle}
        onDeleteProgram={handleDeleteProgram}
        onEditProgram={handleEditProgram}
        onCloneProgram={handleCloneProgram}
        onViewProgram={handleViewProgram}
        onPrefetch={handlePrefetch}
        onSearchChange={handleSearchChange}
        searchPlaceholder={searchPlaceholder}
        searchAriaLabel={searchAriaLabel}
        searchQuery={searchQuery}
        resultCountLabel={resultCountLabel}
      />
    </Stack>
  );
}
