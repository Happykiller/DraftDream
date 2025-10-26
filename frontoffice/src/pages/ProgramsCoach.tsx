// src/pages/ProgramsCoach.tsx
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { Visibility } from '@mui/icons-material';

import { ProgramBuilderPanel, type BuilderCopy } from '@src/components/programs/ProgramBuilderPanel';
import { ProgramList } from '@src/components/programs/ProgramList';
import { ProgramViewContent } from '@src/components/programs/ProgramViewContent';
import { formatProgramDate } from '@src/components/programs/programFormatting';
import { getProgramAthleteLabel, type ProgramViewTab } from '@src/components/programs/programViewUtils';

import { usePrograms, type Program } from '@src/hooks/usePrograms';
import { useProgram } from '@src/hooks/useProgram';
import { slugify } from '@src/utils/slugify';

/** Coach-facing program management dashboard. */
export function ProgramsCoach(): React.JSX.Element {
  const { t, i18n } = useTranslation();
  const theme = useTheme();

  const [builderOpen, setBuilderOpen] = React.useState<boolean>(false);
  const [editingProgram, setEditingProgram] = React.useState<Program | null>(null);
  const [viewingProgram, setViewingProgram] = React.useState<Program | null>(null);
  const [viewingTab, setViewingTab] = React.useState<ProgramViewTab>('overview');

  const builderCopy = t('programs-coatch.builder', {
    returnObjects: true,
  }) as unknown as BuilderCopy;

  const { items: programs, loading, reload, remove, create } = usePrograms({
    page: 1,
    limit: 12,
    q: '',
  });

  const viewingProgramId = viewingProgram?.id ?? null;

  const { program: detailedProgram, loading: detailLoading, error: detailError, reload: reloadDetailedProgram } =
    useProgram({
      programId: viewingProgramId,
      initialProgram: viewingProgram ?? null,
    });

  const handleProgramSaved = React.useCallback(() => {
    void reload();
    if (viewingProgramId) {
      void reloadDetailedProgram();
    }
  }, [reload, reloadDetailedProgram, viewingProgramId]);

  const handleDeleteProgram = React.useCallback(
    (programId: string) => {
      void remove(programId);
      setViewingProgram((current) => {
        if (!current || current.id !== programId) {
          return current;
        }

        return null;
      });
    },
    [remove],
  );

  const handleOpenBuilderForCreate = React.useCallback(() => {
    setEditingProgram(null);
    setBuilderOpen(true);
    setViewingProgram(null);
  }, []);

  const handleEditProgram = React.useCallback((program: Program) => {
    setEditingProgram(program);
    setBuilderOpen(true);
    setViewingProgram(null);
  }, []);

  const handleViewProgram = React.useCallback((program: Program) => {
    setViewingProgram(program);
    setBuilderOpen(false);
    setEditingProgram(null);
    setViewingTab('overview');
  }, []);

  const handleCloseViewer = React.useCallback(() => {
    setViewingProgram(null);
    setViewingTab('overview');
  }, []);

  const handleViewingTabChange = React.useCallback((tab: ProgramViewTab) => {
    setViewingTab(tab);
  }, []);

  const viewingProgramSubtitle = React.useMemo(() => {
    if (!detailedProgram) {
      return '';
    }

    const athleteLabel = getProgramAthleteLabel(detailedProgram);
    const createdOn = formatProgramDate(detailedProgram.createdAt, i18n.language);

    return athleteLabel
      ? t('programs-coatch.view.dialog.subtitle_with_athlete', { athlete: athleteLabel, date: createdOn })
      : t('programs-coatch.view.dialog.subtitle_without_athlete', { date: createdOn });
  }, [detailedProgram, i18n.language, t]);

  const viewingProgramUpdatedOn = React.useMemo(() => {
    if (!detailedProgram) {
      return '';
    }

    return t('programs-coatch.list.updated_on', {
      date: formatProgramDate(detailedProgram.updatedAt, i18n.language),
    });
  }, [detailedProgram, i18n.language, t]);

  const handleCloneProgram = React.useCallback(
    async (baseProgram: Program, payload: { label: string; athleteId: string | null }) => {
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

      setEditingProgram(cloned);
      setBuilderOpen(true);
    },
    [create, i18n.language],
  );

  const handleCloseBuilder = React.useCallback(() => {
    setBuilderOpen(false);
    setEditingProgram(null);
  }, []);

  if (builderOpen) {
    return (
      <>
        {/* General information */}
        <ProgramBuilderPanel
          builderCopy={builderCopy}
          onCancel={handleCloseBuilder}
          onCreated={handleProgramSaved}
          onUpdated={handleProgramSaved}
          program={editingProgram ?? undefined}
        />
      </>
    );
  }

  if (viewingProgram) {
    return (
      <>
        {/* General information */}
        <Stack
          sx={{
            minHeight: { xs: 'calc(100dvh - 56px)', sm: 'calc(100dvh - 64px)' },
            maxHeight: { xs: 'calc(100dvh - 56px)', sm: 'calc(100dvh - 64px)' },
            height: '100%',
            flex: 1,
            overflow: 'hidden',
            backgroundColor: theme.palette.background.paper,
          }}
        >
          {/* Header */}
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            sx={{
              px: { xs: 2, sm: 3, md: 4 },
              py: { xs: 2, sm: 2.5 },
              backgroundColor: alpha(theme.palette.primary.main, 0.1),
            }}
          >
            <Box
              aria-hidden
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 10px 20px rgba(25, 118, 210, 0.24)',
              }}
            >
              <Visibility fontSize="medium" />
            </Box>
            <Stack spacing={0.5} sx={{ minWidth: 0 }}>
              <Typography
                variant="h5"
                sx={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis' }}
                noWrap
              >
                {detailedProgram ? detailedProgram.label : viewingProgram.label}
              </Typography>
              {viewingProgramSubtitle ? (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  noWrap
                  sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}
                >
                  {viewingProgramSubtitle}
                </Typography>
              ) : null}
            </Stack>
          </Stack>

          <Divider />

          {/* Content */}
          <Box sx={{ flexGrow: 1, overflow: 'auto', minHeight: 0 }}>
            <Box sx={{ px: { xs: 2, sm: 3, md: 4 }, py: { xs: 2, sm: 3, md: 3.5 } }}>
              {detailLoading ? (
                <Stack alignItems="center" justifyContent="center" py={6}>
                  <CircularProgress color="primary" />
                </Stack>
              ) : (
                <Stack spacing={3}>
                  {detailError ? <Alert severity="error">{detailError}</Alert> : null}

                  {detailedProgram ? (
                    <ProgramViewContent
                      program={detailedProgram}
                      activeTab={viewingTab}
                      onTabChange={handleViewingTabChange}
                      updatedOnLabel={viewingProgramUpdatedOn}
                    />
                  ) : null}
                </Stack>
              )}
            </Box>
          </Box>

          <Divider />

          {/* Footer */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems={{ xs: 'stretch', sm: 'center' }}
            justifyContent="space-between"
            sx={{
              px: { xs: 2, sm: 3, md: 4 },
              py: { xs: 2, sm: 2.5 },
              backgroundColor: alpha(theme.palette.grey[500], 0.08),
            }}
          >
            {viewingProgramUpdatedOn ? (
              <Typography variant="caption" color="text.secondary">
                {viewingProgramUpdatedOn}
              </Typography>
            ) : (
              <Box sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }} />
            )}

            <Button
              variant="contained"
              color="primary"
              onClick={handleCloseViewer}
              sx={{ alignSelf: { xs: 'stretch', sm: 'center' } }}
            >
              {t('programs-coatch.view.actions.back_to_list')}
            </Button>
          </Stack>
        </Stack>
      </>
    );
  }

  return (
    <>
      {/* General information */}
      <ProgramList
        programs={programs}
        loading={loading}
        placeholderTitle={t('programs-coatch.placeholder')}
        placeholderSubtitle={builderCopy.subtitle}
        openBuilderLabel={t('programs-coatch.actions.open_builder')}
        onOpenBuilder={handleOpenBuilderForCreate}
        onDeleteProgram={handleDeleteProgram}
        onEditProgram={handleEditProgram}
        onCloneProgram={handleCloneProgram}
        onViewProgram={handleViewProgram}
      />
    </>
  );
}
