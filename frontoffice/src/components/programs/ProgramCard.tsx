import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Chip,
  Divider,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  CalendarMonthOutlined,
  CenterFocusStrongOutlined,
  ContentCopyOutlined,
  DeleteOutline,
  EditOutlined,
  HistoryOutlined,
  PersonOutline,
  ScheduleOutlined,
  UpdateOutlined,
  VisibilityOutlined,
} from '@mui/icons-material';

import type { Program } from '@src/hooks/usePrograms';

import { ProgramCloneDialog } from './ProgramCloneDialog';

interface ProgramCardProps {
  program: Program;
  allowedActions?: ProgramActionKey[];
  onDelete?: (programId: string) => void;
  onEdit?: (program: Program) => void;
  onClone?: (program: Program, payload: { label: string; athleteId: string | null }) => Promise<void>;
  onView?: (program: Program) => void;
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

export type ProgramActionKey = 'view' | 'copy' | 'edit' | 'delete';

type ProgramAction = {
  key: ProgramActionKey;
  color: 'primary' | 'secondary' | 'success' | 'error';
  Icon: typeof VisibilityOutlined;
};

const DEFAULT_ALLOWED_ACTIONS: ProgramActionKey[] = ['view', 'copy', 'edit', 'delete'];

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
  } catch (_error) {
    return value;
  }
}

export function ProgramCard({
  program,
  allowedActions = DEFAULT_ALLOWED_ACTIONS,
  onDelete,
  onEdit,
  onClone,
  onView,
}: ProgramCardProps): React.JSX.Element {
  const { t, i18n } = useTranslation();
  const sessionsCount = program.sessions.length;
  const exercisesCount = program.sessions.reduce(
    (total, session) => total + session.exercises.length,
    0,
  );
  const difficulty = deriveProgramDifficulty(program);
  const [isCloneDialogOpen, setIsCloneDialogOpen] = React.useState(false);
  const [isCloneSubmitting, setIsCloneSubmitting] = React.useState(false);

  const handleOpenCloneDialog = React.useCallback(() => {
    setIsCloneDialogOpen(true);
  }, []);

  const handleCloseCloneDialog = React.useCallback(() => {
    setIsCloneDialogOpen(false);
  }, []);

  const handleCloneSubmittingChange = React.useCallback((submitting: boolean) => {
    setIsCloneSubmitting(submitting);
  }, []);
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
    () => formatDate(program.createdAt, i18n.language),
    [i18n.language, program.createdAt],
  );
  const updatedOn = React.useMemo(
    () => formatDate(program.updatedAt, i18n.language),
    [i18n.language, program.updatedAt],
  );

  const availableActions = React.useMemo(
    () => PROGRAM_ACTIONS.filter((action) => allowedActions.includes(action.key)),
    [allowedActions],
  );

  const handleActionClick = React.useCallback(
    (actionKey: ProgramAction['key']) => {
      if (actionKey === 'view') {
        onView?.(program);
        return;
      }

      if (actionKey === 'delete') {
        onDelete?.(program.id);
        return;
      }

      if (actionKey === 'copy') {
        handleOpenCloneDialog();
        return;
      }

      if (actionKey === 'edit') {
        onEdit?.(program);
      }
    },
    [handleOpenCloneDialog, onDelete, onEdit, onView, program],
  );

  return (
    <>
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
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
          {/* Program summary */}
          <Stack flex={1} minWidth={0}>
            <Typography variant="h6" sx={{ fontWeight: 600 }} noWrap>
              {program.label}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                minHeight: 40,
                mt: 0.75,
              }}
            >
              {program.description || t('programs-coatch.list.no_description')}
            </Typography>
            {(difficulty || athleteLabel) && (
              <Stack
                spacing={0.5}
                alignItems="flex-start"
                sx={{ mt: difficulty ? 0.75 : 0 }}
              >
                {difficulty && (
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Chip
                      label={t(`programs-coatch.list.difficulty.${difficulty}`)}
                      size="small"
                      sx={(theme) => ({
                        bgcolor: alpha(theme.palette.success.main, 0.16),
                        color: theme.palette.success.main,
                        fontWeight: 600,
                      })}
                    />
                  </Stack>
                )}
                {athleteLabel && (
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <PersonOutline fontSize="small" color="action" />
                    <Typography variant="caption" color="text.secondary">
                      {athleteLabel}
                    </Typography>
                  </Stack>
                )}
              </Stack>
            )}
          </Stack>
          {/* Actions */}
          <Stack direction="row" spacing={0.5}>
            {availableActions.map(({ key, color, Icon }) => {
              const label = t(`programs-coatch.list.actions.${key}`);
              const isDisabled =
                (key === 'copy' && (isCloneSubmitting || !onClone)) ||
                (key === 'delete' && !onDelete) ||
                (key === 'edit' && !onEdit);

              return (
                <Tooltip key={key} title={label}>
                  <IconButton
                    size="small"
                    aria-label={label}
                    onClick={() => handleActionClick(key)}
                    disabled={Boolean(isDisabled)}
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

        {/* Metrics */}
        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
          <Stack direction="row" spacing={1} alignItems="center">
            <CalendarMonthOutlined fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {t('programs-coatch.list.duration_weeks', { count: program.duration })}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <ScheduleOutlined fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {t('programs-coatch.list.frequency_week', { count: program.frequency })}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <CenterFocusStrongOutlined fontSize="small" color="action" />
            <Typography variant="body2" color="text.secondary">
              {t('programs-coatch.list.sessions_summary', {
                sessions: sessionsCount,
                exercises: exercisesCount,
              })}
            </Typography>
          </Stack>
        </Stack>

        <Divider flexItem />

        {/* Sessions preview */}
        <Stack spacing={1.5}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {t('programs-coatch.list.program_sessions_title')}
          </Typography>
          {program.sessions.length > 0 ? (
            <Stack spacing={1.5}>
              {program.sessions.map((session) => (
                <Stack key={session.id} spacing={1}>
                  <Stack direction="row" justifyContent="space-between" alignItems="baseline">
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {session.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {t('programs-coatch.list.session_exercises', {
                        count: session.exercises.length,
                      })}
                    </Typography>
                  </Stack>
                  {session.exercises.length > 0 && (
                    <Stack spacing={0.5}>
                      {session.exercises.slice(0, 3).map((exercise) => (
                        <Stack
                          key={exercise.id}
                          direction="row"
                          justifyContent="space-between"
                          alignItems="baseline"
                        >
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {exercise.label}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {exercise.series && exercise.repetitions
                              ? `${exercise.series} × ${exercise.repetitions}`
                              : exercise.series || exercise.repetitions || ''}
                          </Typography>
                        </Stack>
                      ))}
                      {session.exercises.length > 3 && (
                        <Typography variant="caption" color="text.secondary">
                          {t('programs-coatch.list.more_exercises', {
                            count: session.exercises.length - 3,
                          })}
                        </Typography>
                      )}
                    </Stack>
                  )}
                </Stack>
              ))}
            </Stack>
          ) : (
            <Typography variant="body2" color="text.secondary">
              {t('programs-coatch.list.no_sessions')}
            </Typography>
          )}
        </Stack>

        <Divider flexItem />

        {/* Metadata */}
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

      {/* Clone dialog */}
      {allowedActions.includes('copy') && onClone && (
        <ProgramCloneDialog
          open={isCloneDialogOpen}
          program={program}
          onClose={handleCloseCloneDialog}
          onClone={onClone}
          onSubmittingChange={handleCloneSubmittingChange}
        />
      )}
    </>
  );
}
