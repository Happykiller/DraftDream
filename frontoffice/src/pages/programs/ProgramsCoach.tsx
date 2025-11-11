// src/pages/ProgramsCoach.tsx
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Add, Refresh } from '@mui/icons-material';
import { Button, IconButton, Stack, Tooltip, Typography } from '@mui/material';

import { ProgramList } from '@components/programs/ProgramList';
import { type BuilderCopy } from '@components/programs/ProgramBuilderPanel';

import { usePrograms, type Program } from '@hooks/programs/usePrograms';
import { slugify } from '@src/utils/slugify';

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

  const { items: programs, loading, reload, remove, create } = usePrograms({
    page: 1,
    limit: 12,
    q: searchQuery,
  });

  const searchPlaceholder = t('programs-coatch.list.search_placeholder');
  const searchAriaLabel = t('programs-coatch.list.search_aria_label');

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
          level: exercise.level ?? undefined,
        })),
      }));

      const cloned = await create({
        slug: slugify(payload.label, String(Date.now()).slice(-5)),
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
            <Tooltip title={t('programs-coatch.actions.refresh')}>
              <IconButton
                aria-label={t('programs-coatch.actions.refresh')}
                color="primary"
                onClick={handleRefresh}
                size="small"
              >
                <Refresh fontSize="small" />
              </IconButton>
            </Tooltip>
            <Button
              color="warning"
              onClick={handleCreateProgram}
              startIcon={<Add />}
              variant="contained"
            >
              {t('programs-coatch.actions.open_builder')}
            </Button>
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
        onSearchChange={handleSearchChange}
        searchPlaceholder={searchPlaceholder}
        searchAriaLabel={searchAriaLabel}
        searchQuery={searchQuery}
      />
    </Stack>
  );
}
