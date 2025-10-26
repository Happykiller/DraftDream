import * as React from 'react';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import {
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import {
  CalendarMonthOutlined,
  CenterFocusStrongOutlined,
  PersonOutline,
  ScheduleOutlined,
  VisibilityOutlined,
} from '@mui/icons-material';
import { alpha } from '@mui/material/styles';

import type { Program, ProgramSession, ProgramSessionExercise } from '@src/hooks/usePrograms';

import { ProgramDialogLayout } from './ProgramDialogLayout';
import { deriveProgramDifficulty, formatProgramDate } from './programFormatting';

export interface ProgramViewDialogProps {
  open: boolean;
  program: Program;
  onClose: () => void;
}

type ProgramViewTab = 'overview' | 'sessions';

function formatProgramDurationLabel(totalMinutes: number, t: TFunction<'translation'>): string {
  if (!Number.isFinite(totalMinutes) || totalMinutes <= 0) {
    return t('programs-coatch.view.durations.not_available');
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0 && minutes > 0) {
    return t('programs-coatch.view.durations.hours_minutes', { hours, minutes });
  }

  if (hours > 0) {
    return t('programs-coatch.view.durations.hours', { count: hours });
  }

  return t('programs-coatch.view.durations.minutes', { count: minutes });
}

function renderExerciseSummary(exercise: ProgramSessionExercise): React.JSX.Element {
  const hasSeries = Boolean(exercise.series);
  const hasRepetitions = Boolean(exercise.repetitions);

  if (!hasSeries && !hasRepetitions) {
    return <>{exercise.series || exercise.repetitions || ''}</>;
  }

  if (hasSeries && hasRepetitions) {
    return <>{`${exercise.series} × ${exercise.repetitions}`}</>;
  }

  return <>{exercise.series ?? exercise.repetitions ?? ''}</>;
}

export function ProgramViewDialog({ open, program, onClose }: ProgramViewDialogProps): React.JSX.Element {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = React.useState<ProgramViewTab>('overview');

  const sessionsCount = program.sessions.length;
  const exercisesCount = program.sessions.reduce((total, session) => total + session.exercises.length, 0);
  const totalDurationMinutes = program.sessions.reduce((total, session) => total + session.durationMin, 0);
  const averageDurationMinutes = sessionsCount > 0 ? Math.round(totalDurationMinutes / sessionsCount) : 0;
  const difficulty = deriveProgramDifficulty(program);

  const athleteLabel = React.useMemo(() => {
    if (!program.athlete) {
      return null;
    }

    const { first_name, last_name, email } = program.athlete;
    const displayName = [first_name, last_name]
      .filter((value): value is string => Boolean(value && value.trim()))
      .join(' ')
      .trim();

    return displayName || email;
  }, [program.athlete]);

  const createdOn = React.useMemo(
    () => formatProgramDate(program.createdAt, i18n.language),
    [i18n.language, program.createdAt],
  );

  const updatedOn = React.useMemo(
    () => formatProgramDate(program.updatedAt, i18n.language),
    [i18n.language, program.updatedAt],
  );

  const totalDurationLabel = React.useMemo<string>(() => formatProgramDurationLabel(totalDurationMinutes, t), [
    t,
    totalDurationMinutes,
  ]);
  const averageDurationLabel = React.useMemo<string>(
    () => formatProgramDurationLabel(averageDurationMinutes, t),
    [averageDurationMinutes, t],
  );

  const overviewInfoItems = React.useMemo(
    () => [
      {
        key: 'duration',
        label: t('programs-coatch.view.information.duration'),
        value: t('programs-coatch.list.duration_weeks', { count: program.duration }),
        fallback: '',
        Icon: CalendarMonthOutlined,
        isChip: false,
      },
      {
        key: 'frequency',
        label: t('programs-coatch.view.information.frequency'),
        value: t('programs-coatch.list.frequency_week', { count: program.frequency }),
        fallback: '',
        Icon: ScheduleOutlined,
        isChip: false,
      },
      {
        key: 'difficulty',
        label: t('programs-coatch.view.information.difficulty'),
        value: difficulty ? t(`programs-coatch.list.difficulty.${difficulty}`) : null,
        fallback: t('programs-coatch.view.information.no_difficulty'),
        Icon: CenterFocusStrongOutlined,
        isChip: Boolean(difficulty),
      },
      {
        key: 'athlete',
        label: t('programs-coatch.view.information.athlete'),
        value: athleteLabel,
        fallback: t('programs-coatch.view.information.no_athlete'),
        Icon: PersonOutline,
        isChip: false,
      },
    ],
    [athleteLabel, difficulty, program.duration, program.frequency, t],
  );

  const statsItems = React.useMemo(
    () => [
      {
        key: 'sessions',
        label: t('programs-coatch.view.stats.sessions'),
        value: t('programs-coatch.view.stats.sessions_value', { count: sessionsCount }),
      },
      {
        key: 'exercises',
        label: t('programs-coatch.view.stats.exercises'),
        value: t('programs-coatch.view.stats.exercises_value', { count: exercisesCount }),
      },
      {
        key: 'totalDuration',
        label: t('programs-coatch.view.stats.total_duration'),
        value: totalDurationLabel,
      },
      {
        key: 'averageDuration',
        label: t('programs-coatch.view.stats.average_duration'),
        value: averageDurationLabel,
      },
    ],
    [averageDurationLabel, exercisesCount, sessionsCount, t, totalDurationLabel],
  );

  React.useEffect(() => {
    if (open) {
      return;
    }

    setActiveTab('overview');
  }, [open]);

  const dialogDescription = athleteLabel
    ? t('programs-coatch.view.dialog.subtitle_with_athlete', { athlete: athleteLabel, date: createdOn })
    : t('programs-coatch.view.dialog.subtitle_without_athlete', { date: createdOn });

  const handleTabChange = React.useCallback((_event: React.SyntheticEvent, value: ProgramViewTab) => {
    setActiveTab(value);
  }, []);

  const renderSession = React.useCallback(
    (session: ProgramSession) => (
      <Paper
        key={session.id}
        variant="outlined"
        sx={{
          borderRadius: 2,
          p: 2,
          bgcolor: 'background.default',
        }}
      >
        <Stack spacing={1.5}>
          <Stack direction="row" justifyContent="space-between" alignItems="baseline">
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {session.label}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('programs-coatch.view.session_duration', { duration: session.durationMin })}
            </Typography>
          </Stack>
          {session.description ? (
            <Typography variant="body2" color="text.secondary">
              {session.description}
            </Typography>
          ) : null}
          <Divider flexItem />
          {session.exercises.length > 0 ? (
            <Stack spacing={1.25}>
              {session.exercises.map((exercise) => (
                <Box key={exercise.id}>
                  <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {exercise.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {renderExerciseSummary(exercise)}
                    </Typography>
                  </Stack>
                  {exercise.description ? (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      {exercise.description}
                    </Typography>
                  ) : null}
                </Box>
              ))}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">
              {t('programs-coatch.view.session_no_exercises')}
            </Typography>
          )}
        </Stack>
      </Paper>
    ),
    [t],
  );

  return (
    <ProgramDialogLayout
      open={open}
      onClose={onClose}
      title={athleteLabel ? `${program.label} - ${athleteLabel}` : program.label}
      description={dialogDescription}
      icon={<VisibilityOutlined fontSize="small" />}
      actions={
        <Button onClick={onClose} variant="contained" color="primary">
          {t('programs-coatch.view.actions.close')}
        </Button>
      }
      actionsProps={{
        sx: {
          justifyContent: 'flex-end',
        },
      }}
    >
      {/* General information */}
      <Stack spacing={3}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
        >
          <Tab value="overview" label={t('programs-coatch.view.tabs.overview')} />
          <Tab value="sessions" label={t('programs-coatch.view.tabs.sessions')} />
        </Tabs>

        {activeTab === 'overview' ? (
          <Stack spacing={3}>
            <Stack spacing={2}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {t('programs-coatch.view.sections.overview')}
              </Typography>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <Paper
                  variant="outlined"
                  sx={{
                    flex: 1,
                    borderRadius: 2,
                    p: 2.5,
                  }}
                >
                  <Stack spacing={2}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {t('programs-coatch.view.sections.information')}
                    </Typography>
                    <Stack spacing={1.5}>
                      {overviewInfoItems.map(({ key, label, value, fallback, Icon, isChip }) => (
                        <Stack key={key} spacing={1}>
                          <Typography variant="body2" color="text.secondary">
                            {label}
                          </Typography>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Icon fontSize="small" color="action" />
                            {isChip && value ? (
                              <Chip
                                size="small"
                                label={value}
                                sx={(theme) => ({
                                  bgcolor: alpha(theme.palette.success.main, 0.16),
                                  color: theme.palette.success.main,
                                  fontWeight: 600,
                                })}
                              />
                            ) : (
                              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                {value ?? fallback}
                              </Typography>
                            )}
                          </Stack>
                        </Stack>
                      ))}
                    </Stack>
                  </Stack>
                </Paper>
                <Paper
                  variant="outlined"
                  sx={{
                    flex: 1,
                    borderRadius: 2,
                    p: 2.5,
                  }}
                >
                  <Stack spacing={2}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {t('programs-coatch.view.sections.stats')}
                    </Typography>
                    <Stack spacing={1.5}>
                      {statsItems.map(({ key, label, value }) => (
                        <Stack key={key} spacing={1}>
                          <Typography variant="body2" color="text.secondary">
                            {label}
                          </Typography>
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {value}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </Stack>
                </Paper>
              </Stack>
            </Stack>

            <Paper
              variant="outlined"
              sx={{
                borderRadius: 2,
                p: 2.5,
              }}
            >
              <Stack spacing={2}>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {t('programs-coatch.view.sections.description')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {program.description?.trim() || t('programs-coatch.list.no_description')}
                </Typography>
              </Stack>
            </Paper>
          </Stack>
        ) : (
          <Stack spacing={2.5}>
            {program.sessions.length > 0 ? (
              program.sessions.map((session) => renderSession(session))
            ) : (
              <Typography variant="body2" color="text.secondary">
                {t('programs-coatch.list.no_sessions')}
              </Typography>
            )}
          </Stack>
        )}

        <Divider flexItem />

        <Typography variant="caption" color="text.secondary">
          {t('programs-coatch.list.updated_on', { date: updatedOn })}
        </Typography>
      </Stack>
    </ProgramDialogLayout>
  );
}
