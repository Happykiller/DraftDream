import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Avatar,
  Box,
  Chip,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  CalendarMonthOutlined,
  ContentCopyOutlined,
  DeleteOutline,
  EditOutlined,
  FitnessCenterOutlined,
  HistoryOutlined,
  PersonOutline,
  ScheduleOutlined,
  UpdateOutlined,
  VisibilityOutlined,
} from '@mui/icons-material';

import type { Program } from '@src/hooks/usePrograms';

interface ProgramCardProps {
  program: Program;
}

type ProgramDifficulty = 'beginner' | 'intermediate' | 'advanced';

const DIFFICULTY_PRIORITY: ProgramDifficulty[] = ['advanced', 'intermediate', 'beginner'];

function normalizeDifficulty(level?: string | null): ProgramDifficulty | null {
  if (!level) {
    return null;
  }

  const normalized = level.toLowerCase();

  if (normalized === 'beginner' || normalized === 'intermediate' || normalized === 'advanced') {
    return normalized;
  }

  return null;
}

function deriveProgramDifficulty(program: Program): ProgramDifficulty | null {
  const difficulty = program.sessions
    .flatMap((session) => session.exercises)
    .map((exercise) => normalizeDifficulty(exercise.level))
    .filter((level): level is ProgramDifficulty => Boolean(level))
    .sort((a, b) => DIFFICULTY_PRIORITY.indexOf(a) - DIFFICULTY_PRIORITY.indexOf(b));

  return difficulty[0] ?? null;
}

type ProgramAction = {
  key: 'view' | 'copy' | 'edit' | 'delete';
  color: 'primary' | 'secondary' | 'success' | 'error';
  Icon: typeof VisibilityOutlined;
};

const PROGRAM_ACTIONS: ProgramAction[] = [
  { key: 'view', color: 'primary', Icon: VisibilityOutlined },
  { key: 'copy', color: 'secondary', Icon: ContentCopyOutlined },
  { key: 'edit', color: 'success', Icon: EditOutlined },
  { key: 'delete', color: 'error', Icon: DeleteOutline },
];

function formatDate(value: string, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(value));
  } catch (error) {
    return value;
  }
}

export function ProgramCard({ program }: ProgramCardProps): React.JSX.Element {
  const { t, i18n } = useTranslation();
  const sessionsCount = program.sessions.length;
  const exercisesCount = program.sessions.reduce(
    (total, session) => total + session.exercises.length,
    0,
  );
  const primarySession = program.sessions[0];
  const difficulty = deriveProgramDifficulty(program);

  const createdOn = React.useMemo(
    () => formatDate(program.createdAt, i18n.language),
    [i18n.language, program.createdAt],
  );
  const updatedOn = React.useMemo(
    () => formatDate(program.updatedAt, i18n.language),
    [i18n.language, program.updatedAt],
  );

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 3,
        border: (theme) => `1px solid ${theme.palette.divider}`,
        p: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
        <Stack spacing={1} flex={1} minWidth={0}>
          <Typography variant="h6" sx={{ fontWeight: 600 }} noWrap>
            {program.label}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ minHeight: 40 }}>
            {program.description || t('programs-coatch.list.no_description')}
          </Typography>
          {difficulty && (
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip
                label={t(`programs-coatch.list.difficulty.${difficulty}`)}
                size="small"
                color="info"
                variant="outlined"
              />
            </Stack>
          )}
        </Stack>
        <Stack direction="row" spacing={0.5}>
          {PROGRAM_ACTIONS.map(({ key, color, Icon }) => {
            const label = t(`programs-coatch.list.actions.${key}`);

            return (
              <Tooltip key={key} title={label}>
                <IconButton
                  size="small"
                  aria-label={label}
                  sx={(theme) => ({
                    color: theme.palette.text.secondary,
                    transition: theme.transitions.create(['color', 'background-color'], {
                      duration: theme.transitions.duration.shorter,
                    }),
                    '&:hover': {
                      bgcolor: alpha(theme.palette[color].main, 0.12),
                      color: theme.palette[color].main,
                    },
                  })}
                >
                  <Icon fontSize="small" />
                </IconButton>
              </Tooltip>
            );
          })}
        </Stack>
      </Stack>

      <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
        <Stack direction="row" spacing={1} alignItems="center">
          <CalendarMonthOutlined fontSize="small" color="primary" />
          <Typography variant="body2">
            {t('programs-coatch.list.duration_weeks', { count: program.duration })}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          <ScheduleOutlined fontSize="small" color="primary" />
          <Typography variant="body2">
            {t('programs-coatch.list.frequency_week', { count: program.frequency })}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          <FitnessCenterOutlined fontSize="small" color="primary" />
          <Typography variant="body2">
            {t('programs-coatch.list.sessions_summary', {
              sessions: sessionsCount,
              exercises: exercisesCount,
            })}
          </Typography>
        </Stack>
      </Stack>

      <Divider flexItem />

      <Stack spacing={1.5}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          {t('programs-coatch.list.program_sessions_title')}
        </Typography>
        {primarySession ? (
          <Paper
            variant="outlined"
            sx={{
              borderRadius: 2,
              p: 2,
              bgcolor: (theme) => theme.palette.action.hover,
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
              <Stack spacing={0.5} flex={1} minWidth={0}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }} noWrap>
                  {primarySession.label}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {t('programs-coatch.list.session_exercises', {
                    count: primarySession.exercises.length,
                  })}
                </Typography>
              </Stack>
              <Avatar sx={{ width: 32, height: 32 }}>
                <PersonOutline fontSize="small" />
              </Avatar>
            </Stack>
            {primarySession.exercises.length > 0 && (
              <List dense disablePadding sx={{ mt: 1 }}>
                {primarySession.exercises.slice(0, 3).map((exercise) => (
                  <ListItem
                    key={exercise.id}
                    disableGutters
                    sx={{
                      px: 0,
                      py: 0.5,
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar>
                        <HistoryOutlined fontSize="small" />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {exercise.label}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {exercise.series && exercise.repetitions
                            ? `${exercise.series} × ${exercise.repetitions}`
                            : exercise.series || exercise.repetitions || ''}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
                {primarySession.exercises.length > 3 && (
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      {t('programs-coatch.list.more_exercises', {
                        count: primarySession.exercises.length - 3,
                      })}
                    </Typography>
                  </Box>
                )}
              </List>
            )}
          </Paper>
        ) : (
          <Typography variant="body2" color="text.secondary">
            {t('programs-coatch.list.no_sessions')}
          </Typography>
        )}
      </Stack>

      <Divider flexItem />

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent={{ xs: 'flex-start', sm: 'space-between' }}
        spacing={{ xs: 1, sm: 3 }}
        sx={{ width: '100%' }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <HistoryOutlined fontSize="small" color="action" />
          <Typography variant="caption" color="text.secondary">
            {t('programs-coatch.list.created_on', { date: createdOn })}
          </Typography>
        </Stack>
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{ ml: { xs: 0, sm: 'auto' } }}
        >
          <UpdateOutlined fontSize="small" color="action" />
          <Typography variant="caption" color="text.secondary">
            {t('programs-coatch.list.updated_on', { date: updatedOn })}
          </Typography>
        </Stack>
      </Stack>
    </Paper>
  );
}
