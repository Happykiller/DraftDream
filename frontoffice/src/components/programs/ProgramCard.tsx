import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Chip,
  Divider,
  Grid,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
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
  ExpandMoreOutlined,
} from '@mui/icons-material';

import type { Program } from '@src/hooks/programs/usePrograms';
import { UserType } from '@src/commons/enums';
import { session } from '@stores/session';

import { GlassCard } from '../common/GlassCard';
import { ProgramCloneDialog } from './ProgramCloneDialog';
import { ProgramDeleteDialog } from './ProgramDeleteDialog';
import { ProgramViewDialog } from './ProgramViewDialog';
import { deriveProgramDifficulty, formatProgramDate } from './programFormatting';
import { TextWithTooltip } from '../common/TextWithTooltip';

interface ProgramCardProps {
  program: Program;
  allowedActions?: ProgramActionKey[];
  onDelete?: (programId: string) => Promise<void> | void;
  onEdit?: (program: Program) => void;
  onClone?: (
    program: Program,
    payload: { label: string; athleteId: string | null; openBuilder: boolean },
  ) => Promise<void>;
  onView?: (program: Program) => void;
  onPrefetch?: (action: 'view' | 'edit') => void;
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

const COLLAPSED_CONTENT_MAX_HEIGHT = 480;

export const ProgramCard = React.memo(function ProgramCard({
  program,
  allowedActions = DEFAULT_ALLOWED_ACTIONS,
  onDelete,
  onEdit,
  onClone,
  onView,
  onPrefetch,
}: ProgramCardProps): React.JSX.Element {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const role = session((state) => state.role);
  const sessionsCount = program.sessions.length;
  const exercisesCount = program.sessions.reduce(
    (total, session) => total + session.exercises.length,
    0,
  );
  const difficulty = deriveProgramDifficulty(program);
  const [isCloneDialogOpen, setIsCloneDialogOpen] = React.useState(false);
  const [isCloneSubmitting, setIsCloneSubmitting] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isDeleteSubmitting, setIsDeleteSubmitting] = React.useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = React.useState(false);
  const contentRef = React.useRef<HTMLDivElement | null>(null);
  const [isOverflowing, setIsOverflowing] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const isAthleteUser = role === UserType.Athlete;

  const handleOpenCloneDialog = React.useCallback(() => {
    setIsCloneDialogOpen(true);
  }, []);

  const handleCloseCloneDialog = React.useCallback(() => {
    setIsCloneDialogOpen(false);
  }, []);

  const handleCloneSubmittingChange = React.useCallback((submitting: boolean) => {
    setIsCloneSubmitting(submitting);
  }, []);

  const handleToggleExpand = React.useCallback(() => {
    setIsExpanded((previous) => !previous);
  }, []);

  const handleOpenDeleteDialog = React.useCallback(() => {
    setIsDeleteDialogOpen(true);
  }, []);

  const handleCloseDeleteDialog = React.useCallback<NonNullable<React.ComponentProps<
    typeof ProgramDeleteDialog
  >['onClose']>>(
    (_, reason) => {
      if (isDeleteSubmitting && reason) {
        return;
      }

      if (!isDeleteSubmitting) {
        setIsDeleteDialogOpen(false);
      }
    },
    [isDeleteSubmitting],
  );

  const handleConfirmDelete = React.useCallback(async () => {
    if (!onDelete) {
      return;
    }

    setIsDeleteSubmitting(true);

    try {
      await onDelete(program.id);
      setIsDeleteDialogOpen(false);
    } catch (_error) {
      // Error handled by hook
    } finally {
      setIsDeleteSubmitting(false);
    }
  }, [onDelete, program.id]);

  const handleCloseViewDialog = React.useCallback(() => {
    setIsViewDialogOpen(false);
  }, []);
  const athleteLabel = React.useMemo(() => {
    if (isAthleteUser || !program.athlete) {
      return null;
    }

    const { first_name, last_name, email } = program.athlete;
    const displayName = [first_name, last_name]
      .filter((value): value is string => Boolean(value && value.trim()))
      .join(' ')
      .trim();

    return displayName || email;
  }, [isAthleteUser, program.athlete]);

  const createdOn = React.useMemo(
    () => formatProgramDate(program.createdAt, i18n.language),
    [i18n.language, program.createdAt],
  );
  const updatedOn = React.useMemo(
    () => formatProgramDate(program.updatedAt, i18n.language),
    [i18n.language, program.updatedAt],
  );

  const availableActions = React.useMemo(
    () => PROGRAM_ACTIONS.filter((action) => allowedActions.includes(action.key)),
    [allowedActions],
  );
  const summaryBackground = React.useMemo(
    () => alpha(theme.palette.primary.main, 0.08),
    [theme.palette.primary.main],
  );
  const summaryBorder = React.useMemo(
    () => alpha(theme.palette.primary.main, 0.16),
    [theme.palette.primary.main],
  );

  const handleActionClick = React.useCallback(
    (actionKey: ProgramAction['key']) => {
      if (actionKey === 'view') {
        if (!onView) {
          setIsViewDialogOpen(true);
        }

        onView?.(program);
        return;
      }

      if (actionKey === 'delete') {
        if (onDelete) {
          handleOpenDeleteDialog();
        }
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
    [handleOpenCloneDialog, handleOpenDeleteDialog, onDelete, onEdit, onView, program],
  );

  const overflowToggleLabel = isExpanded
    ? t('programs-coatch.list.collapse_details')
    : t('programs-coatch.list.expand_details');

  React.useEffect(() => {
    const element = contentRef.current;

    if (!element) {
      return undefined;
    }

    const updateOverflowState = () => {
      setIsOverflowing(element.scrollHeight > COLLAPSED_CONTENT_MAX_HEIGHT + 1);
    };

    updateOverflowState();

    if (typeof ResizeObserver === 'function') {
      const observer = new ResizeObserver(updateOverflowState);
      observer.observe(element);

      return () => {
        observer.disconnect();
      };
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', updateOverflowState);

      return () => {
        window.removeEventListener('resize', updateOverflowState);
      };
    }

    return undefined;
  }, [program.id]);

  React.useEffect(() => {
    if (!isOverflowing && isExpanded) {
      setIsExpanded(false);
    }
  }, [isExpanded, isOverflowing]);

  React.useEffect(() => {
    setIsExpanded(false);
  }, [program.id]);

  return (
    <>
      <GlassCard
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          p: 2.5,
        }}
      >
        <Box
          ref={contentRef}
          sx={(theme) => ({
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            gap: theme.spacing(2),
            flexGrow: 1,
            maxHeight: isExpanded ? 'none' : COLLAPSED_CONTENT_MAX_HEIGHT,
            overflow: 'hidden',
            ...(isOverflowing && !isExpanded
              ? {
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: theme.spacing(7),
                  backgroundImage: theme.palette.mode === 'dark'
                    ? `linear-gradient(180deg, rgba(30, 30, 30, 0) 0%, rgba(30, 30, 30, 0.9) 75%)`
                    : `linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.9) 75%)`,
                },
              }
              : {}),
          })}
        >
          {/* General information */}
          {/* Header */}
          <Grid container>
            {/* Program summary */}
            <Grid size={10}>
              <Box
                sx={{
                  flex: 1,
                  minWidth: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  width: '75%',
                }}
              >
                <TextWithTooltip
                  tooltipTitle={program.label}
                  variant="h6"
                  sx={{
                    fontWeight: 700
                  }}
                />
                <TextWithTooltip
                  tooltipTitle={program.description || t('programs-coatch.list.no_description')}
                  variant="body2"
                  color="text.secondary"
                />
              </Box>
              {(difficulty || athleteLabel) && (
                <Stack
                  spacing={0.75}
                  alignItems="flex-start"
                  sx={{ mt: difficulty ? 0.75 : 0 }}
                >
                  {difficulty && (
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      <Chip
                        label={t(`programs-coatch.list.difficulty.${difficulty}`)}
                        size="small"
                        sx={(theme) => ({
                          bgcolor: alpha(theme.palette.success.main, 0.1),
                          color: theme.palette.success.main,
                          fontWeight: 700,
                          border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                        })}
                      />
                    </Stack>
                  )}
                  {athleteLabel && (
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <PersonOutline fontSize="small" color="action" />
                      <Typography variant="caption" color="text.secondary" fontWeight={500}>
                        {athleteLabel}
                      </Typography>
                    </Stack>
                  )}
                </Stack>
              )}
            </Grid>
            {/* Actions */}
            <Grid size={2} display="flex" justifyContent="flex-end" alignItems="flex-start">
              {availableActions.map(({ key, color, Icon }) => {
                const label = t(`programs-coatch.list.actions.${key}`);
                const isDisabled =
                  (key === 'copy' && (isCloneSubmitting || !onClone)) ||
                  (key === 'delete' && (!onDelete || isDeleteSubmitting)) ||
                  (key === 'edit' && !onEdit);

                return (
                  <Tooltip key={key} title={label}>
                    <IconButton
                      size="small"
                      aria-label={label}
                      onClick={() => handleActionClick(key)}
                      onMouseEnter={() => {
                        if (key === 'edit' || key === 'view') {
                          onPrefetch?.(key);
                        }
                      }}
                      disabled={Boolean(isDisabled)}
                      sx={(theme) => ({
                        color: theme.palette.text.secondary,
                        '&:hover': {
                          bgcolor: alpha(theme.palette[color].main, 0.08),
                          color: theme.palette[color].main,
                        },
                      })}
                    >
                      <Icon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                );
              })}
            </Grid>
          </Grid>

          {/* Metrics */}
          <Box
            sx={{
              borderRadius: 2,
              backgroundColor: summaryBackground,
              border: `1px solid ${summaryBorder}`,
              px: { xs: 1.5, sm: 2 },
              py: { xs: 1.5, sm: 2 },
            }}
          >
            <Stack spacing={1.5}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <ScheduleOutlined fontSize="small" color="primary" />
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }}>
                  {t('programs-coatch.view.sections.overview')}
                </Typography>
              </Stack>
              <Grid container spacing={{ xs: 1, sm: 2 }}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Stack spacing={0.25}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                      {t('programs-coatch.view.information.duration')}
                    </Typography>
                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <CalendarMonthOutlined fontSize="small" sx={{ opacity: 0.7 }} />
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        {t('programs-coatch.list.duration_weeks', { count: program.duration })}
                      </Typography>
                    </Stack>
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Stack spacing={0.25}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: theme.palette.success.main }}>
                      {t('programs-coatch.view.information.frequency')}
                    </Typography>
                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <ScheduleOutlined fontSize="small" sx={{ opacity: 0.7 }} />
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        {t('programs-coatch.list.frequency_week', { count: program.frequency })}
                      </Typography>
                    </Stack>
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, md: 12 }}>
                  <Stack spacing={0.25}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700, color: theme.palette.info.main }}>
                      {t('programs-coatch.list.program_sessions_title')}
                    </Typography>
                    <Stack direction="row" spacing={0.75} alignItems="center">
                      <CenterFocusStrongOutlined fontSize="small" sx={{ opacity: 0.7 }} />
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                        {t('programs-coatch.list.sessions_summary', {
                          sessions: sessionsCount,
                          exercises: exercisesCount,
                        })}
                      </Typography>
                    </Stack>
                  </Stack>
                </Grid>
              </Grid>
            </Stack>
          </Box>

          <Divider sx={{ opacity: 0.6 }} />

          {/* Sessions preview */}
          <Stack spacing={1.5}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {t('programs-coatch.list.program_sessions_title')}
            </Typography>
            {program.sessions.length > 0 ? (
              <Stack spacing={1.5}>
                {program.sessions.map((session) => (
                  <Box
                    key={session.id}
                    sx={{
                      borderRadius: 2,
                      border: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
                      px: { xs: 1.5, sm: 2 },
                      py: { xs: 1.5, sm: 2 },
                    }}
                  >
                    <Stack spacing={1}>
                      <Grid container>
                        <Grid size={10}>
                          <TextWithTooltip
                            tooltipTitle={session.label}
                            variant="h6"
                            sx={{
                              fontWeight: 700,
                              lineHeight: 1.2,
                              display: 'block',
                            }}
                          />
                        </Grid>
                        <Grid size={2} sx={{ textAlign: 'right' }}>
                          <Typography variant="caption" color="text.secondary" fontWeight={600}>
                            {t('programs-coatch.list.session_exercises', {
                              count: session.exercises.length,
                            })}
                          </Typography>
                        </Grid>
                      </Grid>
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
                            <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', mt: 0.5 }}>
                              {t('programs-coatch.list.more_exercises', {
                                count: session.exercises.length - 3,
                              })}
                            </Typography>
                          )}
                        </Stack>
                      )}
                    </Stack>
                  </Box>
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                {t('programs-coatch.list.no_sessions')}
              </Typography>
            )}
          </Stack>

          <Divider sx={{ opacity: 0.6 }} />

          {/* Metadata */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={2}
            sx={{ width: '100%', mt: 'auto' }}
          >
            <Stack direction="row" spacing={0.75} alignItems="center">
              <HistoryOutlined fontSize="inherit" sx={{ opacity: 0.6, fontSize: '1rem' }} />
              <Typography variant="caption" color="text.secondary">
                {t('programs-coatch.list.created_on', { date: createdOn })}
              </Typography>
            </Stack>
            <Stack
              direction="row"
              spacing={0.75}
              alignItems="center"
            >
              <UpdateOutlined fontSize="inherit" sx={{ opacity: 0.6, fontSize: '1rem' }} />
              <Typography variant="caption" color="text.secondary">
                {t('programs-coatch.list.updated_on', { date: updatedOn })}
              </Typography>
            </Stack>
          </Stack>

        </Box>

        {isOverflowing && (
          <>
            <Divider sx={{ mt: 2, opacity: 0.6 }} />
            <Stack direction="row" justifyContent="center" sx={{ pt: 1 }}>
              <Tooltip title={overflowToggleLabel}>
                <IconButton
                  size="small"
                  aria-label={overflowToggleLabel}
                  aria-expanded={isExpanded}
                  onClick={handleToggleExpand}
                  sx={(theme) => ({
                    color: theme.palette.text.secondary,
                    transition: theme.transitions.create('transform', {
                      duration: theme.transitions.duration.shorter,
                    }),
                    transform: isExpanded ? 'rotate(180deg)' : 'none',
                  })}
                >
                  <ExpandMoreOutlined fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </>
        )}
      </GlassCard>

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
      {allowedActions.includes('delete') && onDelete && (
        <ProgramDeleteDialog
          open={isDeleteDialogOpen}
          programLabel={program.label}
          loading={isDeleteSubmitting}
          onClose={handleCloseDeleteDialog}
          onConfirm={handleConfirmDelete}
        />
      )}
      {allowedActions.includes('view') && !onView && (
        <ProgramViewDialog open={isViewDialogOpen} program={program} onClose={handleCloseViewDialog} />
      )}
    </>
  );
});
