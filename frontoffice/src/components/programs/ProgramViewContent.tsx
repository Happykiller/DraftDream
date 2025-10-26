import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Chip,
  Divider,
  Grid,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  CalendarMonthOutlined,
  CenterFocusStrongOutlined,
  PersonOutline,
  ScheduleOutlined,
} from '@mui/icons-material';

import type { Program, ProgramSession, ProgramSessionExercise } from '@src/hooks/usePrograms';

import { deriveProgramDifficulty } from './programFormatting';
import {
  formatProgramDurationLabel,
  getProgramAthleteLabel,
  summarizeExerciseEffort,
  type ProgramViewTab,
} from './programViewUtils';

interface OverviewInfoItem {
  key: string;
  label: string;
  value: string | null;
  fallback: string;
  Icon: React.ElementType;
  isChip: boolean;
}

interface ProgramStatItem {
  key: string;
  label: string;
  value: string;
}

interface ProgramExerciseBadgeGroupProps {
  title: string;
  items?: ReadonlyArray<{ id: string; label: string }> | null;
  paletteKey: 'primary' | 'secondary' | 'success' | 'warning';
}

interface ProgramViewContentProps {
  program: Program;
  activeTab: ProgramViewTab;
  onTabChange: (tab: ProgramViewTab) => void;
  updatedOnLabel: string;
  showUpdatedOnLabel?: boolean;
}

/**
 * Shared rendering surface for the Program View feature.
 */
export function ProgramViewContent({
  program,
  activeTab,
  onTabChange,
  updatedOnLabel,
  showUpdatedOnLabel = true,
}: ProgramViewContentProps): React.JSX.Element {
  const { t } = useTranslation();

  const sessionsCount = program.sessions.length;
  const exercisesCount = program.sessions.reduce(
    (total, session) => total + session.exercises.length,
    0,
  );
  const totalDurationMinutes = program.sessions.reduce(
    (total, session) => total + session.durationMin,
    0,
  );
  const averageDurationMinutes = sessionsCount > 0 ? Math.round(totalDurationMinutes / sessionsCount) : 0;
  const difficulty = deriveProgramDifficulty(program);

  const athleteLabel = React.useMemo(() => getProgramAthleteLabel(program), [program]);

  const totalDurationLabel = React.useMemo(
    () => formatProgramDurationLabel(totalDurationMinutes, t),
    [t, totalDurationMinutes],
  );
  const averageDurationLabel = React.useMemo(
    () => formatProgramDurationLabel(averageDurationMinutes, t),
    [averageDurationMinutes, t],
  );

  const overviewInfoItems = React.useMemo<OverviewInfoItem[]>(
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

  const statsItems = React.useMemo<ProgramStatItem[]>(
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

  const handleTabsChange = React.useCallback(
    (_event: React.SyntheticEvent, value: ProgramViewTab) => {
      onTabChange(value);
    },
    [onTabChange],
  );

  return (
    <Stack spacing={3}>
      {/* General information */}
      <Tabs
        value={activeTab}
        onChange={handleTabsChange}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
      >
        <Tab value="overview" label={t('programs-coatch.view.tabs.overview')} />
        <Tab value="sessions" label={t('programs-coatch.view.tabs.sessions')} />
      </Tabs>

      {activeTab === 'overview' ? (
        <ProgramOverviewTab
          overviewInfoItems={overviewInfoItems}
          statsItems={statsItems}
          description={program.description?.trim() || t('programs-coatch.list.no_description')}
        />
      ) : (
        <ProgramSessionsTab sessions={program.sessions} />
      )}

      <Divider flexItem />

      <Typography variant="caption" color="text.secondary">
        {updatedOnLabel}
      </Typography>
    </Stack>
  );
}

interface ProgramOverviewTabProps {
  overviewInfoItems: OverviewInfoItem[];
  statsItems: ProgramStatItem[];
  description: string;
}

function ProgramOverviewTab({
  overviewInfoItems,
  statsItems,
  description,
}: ProgramOverviewTabProps): React.JSX.Element {
  const { t } = useTranslation();

  return (
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
            {description}
          </Typography>
        </Stack>
      </Paper>
    </Stack>
  );
}

interface ProgramSessionsTabProps {
  sessions: ProgramSession[];
}

function ProgramSessionsTab({ sessions }: ProgramSessionsTabProps): React.JSX.Element {
  const { t } = useTranslation();

  const formatRestDuration = React.useCallback(
    (restSeconds?: number | null) => {
      if (!restSeconds || restSeconds <= 0) {
        return null;
      }

      const minutes = Math.floor(restSeconds / 60);
      const seconds = restSeconds % 60;

      if (minutes > 0 && seconds > 0) {
        return t('programs-coatch.view.exercises.rest_duration.minutes_seconds', { minutes, seconds });
      }

      if (minutes > 0) {
        return t('programs-coatch.view.exercises.rest_duration.minutes', { count: minutes });
      }

      return t('programs-coatch.view.exercises.rest_duration.seconds', { count: seconds });
    },
    [t],
  );

  if (sessions.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        {t('programs-coatch.list.no_sessions')}
      </Typography>
    );
  }

  return (
    <Stack spacing={2.5}>
      {sessions.map((session, sessionIndex) => (
        <ProgramSessionCard
          key={session.id}
          session={session}
          sessionIndex={sessionIndex}
          formatRestDuration={formatRestDuration}
        />
      ))}
    </Stack>
  );
}

interface ProgramSessionCardProps {
  session: ProgramSession;
  sessionIndex: number;
  formatRestDuration: (restSeconds?: number | null) => string | null;
}

function ProgramSessionCard({
  session,
  sessionIndex,
  formatRestDuration,
}: ProgramSessionCardProps): React.JSX.Element {
  const { t } = useTranslation();

  const sessionDurationLabel = t('programs-coatch.view.session_duration', { duration: session.durationMin });
  const exercisesCountLabel = t('programs-coatch.view.stats.exercises_value', {
    count: session.exercises.length,
  });

  return (
    <Paper
      variant="outlined"
      sx={(theme) => ({
        borderRadius: 2.5,
        p: { xs: 2.5, md: 3 },
        bgcolor: alpha(theme.palette.success.light, 0.12),
        borderColor: alpha(theme.palette.success.main, 0.4),
        boxShadow: '0 20px 40px rgba(22, 101, 52, 0.12)',
      })}
    >
      <Stack spacing={2.5}>
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1.5}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Chip
              label={t('programs-coatch.view.sessions.session_label', { index: sessionIndex + 1 })}
              color="success"
              variant="filled"
              sx={{ fontWeight: 700 }}
            />
            <Stack spacing={0.5}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {session.label}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {sessionDurationLabel} • {exercisesCountLabel}
              </Typography>
            </Stack>
          </Stack>
          {session.description ? (
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: { md: '45%', lg: '40%' } }}>
              {session.description}
            </Typography>
          ) : null}
        </Stack>

        <Divider flexItem />

        {session.exercises.length > 0 ? (
          <Grid container spacing={{ xs: 2, md: 2.5 }}>
            {session.exercises.map((exercise, exerciseIndex) => (
              <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={exercise.id}>
                <ProgramExerciseCard
                  exercise={exercise}
                  exerciseIndex={exerciseIndex}
                  formatRestDuration={formatRestDuration}
                />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography variant="body2" color="text.secondary">
            {t('programs-coatch.view.session_no_exercises')}
          </Typography>
        )}
      </Stack>
    </Paper>
  );
}

interface ProgramExerciseCardProps {
  exercise: ProgramSessionExercise;
  exerciseIndex: number;
  formatRestDuration: (restSeconds?: number | null) => string | null;
}

function ProgramExerciseCard({
  exercise,
  exerciseIndex,
  formatRestDuration,
}: ProgramExerciseCardProps): React.JSX.Element {
  const { t } = useTranslation();

  const metrics = React.useMemo(
    () =>
      [
        {
          key: 'series',
          label: t('programs-coatch.view.exercises.series'),
          value: exercise.series,
        },
        {
          key: 'repetitions',
          label: t('programs-coatch.view.exercises.repetitions'),
          value: exercise.repetitions,
        },
        {
          key: 'rest',
          label: t('programs-coatch.view.exercises.rest'),
          value: formatRestDuration(exercise.restSeconds),
        },
        {
          key: 'charge',
          label: t('programs-coatch.view.exercises.charge'),
          value: exercise.charge,
        },
      ].filter((metric) => Boolean(metric.value && String(metric.value).trim().length > 0)),
    [exercise.charge, exercise.repetitions, exercise.restSeconds, exercise.series, formatRestDuration, t],
  );

  const levelKey = exercise.level?.toLowerCase();
  const levelLabel = levelKey ? t(`programs-coatch.view.exercises.levels.${levelKey}`) : null;
  const effortSummary = summarizeExerciseEffort(exercise);

  const badgeGroups = React.useMemo(
    () =>
      [
        {
          key: 'categories',
          title: t('programs-coatch.view.exercises.categories'),
          items: exercise.categories,
          paletteKey: 'primary' as const,
        },
        {
          key: 'muscles',
          title: t('programs-coatch.view.exercises.muscles'),
          items: exercise.muscles,
          paletteKey: 'success' as const,
        },
        {
          key: 'equipment',
          title: t('programs-coatch.view.exercises.equipment'),
          items: exercise.equipments,
          paletteKey: 'warning' as const,
        },
        {
          key: 'tags',
          title: t('programs-coatch.view.exercises.tags'),
          items: exercise.tags,
          paletteKey: 'secondary' as const,
        },
      ].filter((group) => Boolean(group.items && group.items.length > 0)),
    [exercise.categories, exercise.equipments, exercise.muscles, exercise.tags, t],
  );

  return (
    <Paper
      sx={(theme) => ({
        height: '100%',
        borderRadius: 2,
        p: 2.5,
        position: 'relative',
        overflow: 'hidden',
        backgroundImage: `linear-gradient(180deg, ${alpha(theme.palette.primary.light, 0.08)} 0%, ${theme.palette.background.paper} 45%)`,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
        boxShadow: '0 18px 36px rgba(15, 23, 42, 0.08)',
        transition: 'transform 200ms ease, box-shadow 200ms ease',
        display: 'flex',
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow: '0 24px 48px rgba(15, 23, 42, 0.16)',
        },
      })}
    >
      <Stack spacing={2} sx={{ flex: 1 }}>
        <Stack direction="row" alignItems="flex-start" spacing={1.5}>
          <Box
            sx={(theme) => ({
              width: 40,
              height: 40,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              color: theme.palette.common.white,
              backgroundImage: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
              boxShadow: '0 8px 18px rgba(25, 118, 210, 0.28)',
            })}
          >
            {exerciseIndex + 1}
          </Box>
          <Stack spacing={0.5} sx={{ flex: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {exercise.label}
            </Typography>
            {effortSummary ? (
              <Typography variant="body2" color="text.secondary">
                {effortSummary}
              </Typography>
            ) : null}
          </Stack>
          {levelLabel ? (
            <Chip
              size="small"
              label={levelLabel}
              sx={(theme) => ({
                bgcolor: alpha(theme.palette.secondary.main, 0.12),
                color: theme.palette.secondary.main,
                fontWeight: 600,
                textTransform: 'uppercase',
              })}
            />
          ) : null}
        </Stack>

        {exercise.description ? (
          <Typography variant="body2" color="text.primary">
            {exercise.description}
          </Typography>
        ) : null}

        {exercise.instructions ? (
          <Box
            sx={(theme) => ({
              borderRadius: 2,
              p: 1.5,
              bgcolor: alpha(theme.palette.primary.main, 0.08),
              border: `1px solid ${alpha(theme.palette.primary.main, 0.16)}`,
            })}
          >
            <Typography variant="caption" color="primary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
              {t('programs-coatch.view.exercises.instructions')}
            </Typography>
            <Typography variant="body2" color="text.primary" sx={{ mt: 0.5 }}>
              {exercise.instructions}
            </Typography>
          </Box>
        ) : null}

        {metrics.length > 0 ? (
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            {metrics.map((metric) => (
              <Chip
                key={metric.key}
                size="small"
                label={`${metric.label}: ${metric.value}`}
                sx={(theme) => ({
                  bgcolor: alpha(theme.palette.grey[500], 0.12),
                  color: theme.palette.text.primary,
                  fontWeight: 500,
                })}
              />
            ))}
          </Stack>
        ) : null}

        {badgeGroups.length > 0 ? (
          <Stack spacing={1.5}>
            {badgeGroups.map((group) => (
              <ProgramExerciseBadgeGroup
                key={group.key}
                title={group.title}
                items={group.items}
                paletteKey={group.paletteKey}
              />
            ))}
          </Stack>
        ) : null}
      </Stack>
    </Paper>
  );
}

function ProgramExerciseBadgeGroup({
  title,
  items,
  paletteKey,
}: ProgramExerciseBadgeGroupProps): React.JSX.Element | null {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <Stack spacing={0.75}>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.4 }}
      >
        {title}
      </Typography>
      <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
        {items.map((item) => (
          <Chip
            key={item.id}
            size="small"
            label={item.label}
            sx={(theme) => ({
              bgcolor: alpha(theme.palette[paletteKey].main, 0.16),
              color: theme.palette[paletteKey].main,
              fontWeight: 600,
            })}
          />
        ))}
      </Stack>
    </Stack>
  );
}
