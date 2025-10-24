import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Autocomplete,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  Paper,
  Stack,
  TextField,
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

import inversify from '@src/commons/inversify';
import type { Program, ProgramUser } from '@src/hooks/usePrograms';
import { useDebouncedValue } from '@src/hooks/useDebouncedValue';
import { GraphqlServiceFetch } from '@src/services/graphql/graphql.service.fetch';

interface ProgramCardProps {
  program: Program;
  onDelete?: (programId: string) => void;
  onEdit?: (program: Program) => void;
  onClone?: (program: Program, payload: { label: string; athleteId: string | null }) => Promise<void>;
}

interface AthleteOption {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
}

interface AthleteListPayload {
  user_list: {
    items: AthleteOption[];
  };
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

const ATHLETE_CACHE = new Map<string, AthleteOption[]>();

const LIST_USERS_QUERY = `
  query ListUsers($input: ListUsersInput) {
    user_list(input: $input) {
      items {
        id
        email
        first_name
        last_name
      }
    }
  }
`;

function formatAthleteLabel({ first_name, last_name, email }: AthleteOption | ProgramUser): string {
  const displayName = [first_name, last_name]
    .filter((value): value is string => Boolean(value && value.trim()))
    .join(' ')
    .trim();

  return displayName || email;
}

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

export function ProgramCard({ program, onDelete, onEdit, onClone }: ProgramCardProps): React.JSX.Element {
  const { t, i18n } = useTranslation();
  const sessionsCount = program.sessions.length;
  const exercisesCount = program.sessions.reduce(
    (total, session) => total + session.exercises.length,
    0,
  );
  const difficulty = deriveProgramDifficulty(program);
  const gql = React.useMemo(() => new GraphqlServiceFetch(inversify), []);
  const [isCloneDialogOpen, setIsCloneDialogOpen] = React.useState(false);
  const [cloneLabel, setCloneLabel] = React.useState('');
  const [cloneError, setCloneError] = React.useState<string | null>(null);
  const [cloneLabelError, setCloneLabelError] = React.useState<string | null>(null);
  const [cloneLoading, setCloneLoading] = React.useState(false);
  const [selectedAthlete, setSelectedAthlete] = React.useState<AthleteOption | null>(null);
  const [athleteInputValue, setAthleteInputValue] = React.useState('');
  const [rawAthleteOptions, setRawAthleteOptions] = React.useState<AthleteOption[]>([]);
  const [athletesLoading, setAthletesLoading] = React.useState(false);
  const [athleteQuery, setAthleteQuery] = React.useState('');
  const debouncedAthleteQuery = useDebouncedValue(athleteQuery, 300);
  const programAthleteOption = React.useMemo<AthleteOption | null>(() => {
    if (!program.athlete) {
      return null;
    }
    return {
      id: program.athlete.id,
      email: program.athlete.email,
      first_name: program.athlete.first_name ?? null,
      last_name: program.athlete.last_name ?? null,
    };
  }, [program.athlete]);
  const mergedAthleteOptions = React.useMemo(() => {
    const dedup = new Map<string, AthleteOption>();
    rawAthleteOptions.forEach((option) => {
      dedup.set(option.id, option);
    });
    if (programAthleteOption) {
      dedup.set(programAthleteOption.id, programAthleteOption);
    }
    if (selectedAthlete) {
      dedup.set(selectedAthlete.id, selectedAthlete);
    }
    return Array.from(dedup.values());
  }, [programAthleteOption, rawAthleteOptions, selectedAthlete]);

  const loadAthletes = React.useCallback(
    async (search: string) => {
      const key = search.trim().toLowerCase();
      if (ATHLETE_CACHE.has(key)) {
        setRawAthleteOptions(ATHLETE_CACHE.get(key) ?? []);
        setAthletesLoading(false);
        return;
      }

      setAthletesLoading(true);
      try {
        const { data, errors } = await gql.send<AthleteListPayload>({
          query: LIST_USERS_QUERY,
          operationName: 'ListUsers',
          variables: {
            input: {
              page: 1,
              limit: 25,
              q: search.trim() || undefined,
            },
          },
        });

        if (errors?.length) {
          throw new Error(errors[0].message);
        }

        const items = data?.user_list.items ?? [];
        ATHLETE_CACHE.set(key, items);
        setRawAthleteOptions(items);
      } catch (_error) {
        setRawAthleteOptions([]);
      } finally {
        setAthletesLoading(false);
      }
    },
    [gql],
  );

  React.useEffect(() => {
    if (!isCloneDialogOpen) {
      return;
    }
    void loadAthletes(debouncedAthleteQuery);
  }, [debouncedAthleteQuery, isCloneDialogOpen, loadAthletes]);

  const handleOpenCloneDialog = React.useCallback(() => {
    const copySuffix = t('programs-coatch.list.clone_dialog.copy_suffix', {
      defaultValue: '(Copy)',
    });
    const baseLabel = program.label?.trim() ?? '';
    const nextLabel = baseLabel.length > 0 ? `${baseLabel} ${copySuffix}`.trim() : copySuffix;

    setCloneLabel(nextLabel);
    setCloneError(null);
    setCloneLabelError(null);
    setSelectedAthlete(programAthleteOption);
    setAthleteInputValue(programAthleteOption ? formatAthleteLabel(programAthleteOption) : '');
    setAthleteQuery('');
    setIsCloneDialogOpen(true);
  }, [program.label, programAthleteOption, t]);

  const handleCloseCloneDialog = React.useCallback(() => {
    setIsCloneDialogOpen(false);
    setCloneLoading(false);
    setCloneError(null);
    setCloneLabelError(null);
  }, []);

  const handleCloneSubmit = React.useCallback(async () => {
    if (!onClone) {
      handleCloseCloneDialog();
      return;
    }

    const trimmedLabel = cloneLabel.trim();
    setCloneLabelError(null);
    if (!trimmedLabel) {
      setCloneLabelError(
        t('programs-coatch.list.clone_dialog.errors.missing_label', {
          defaultValue: 'Please provide a program name.',
        }),
      );
      return;
    }

    setCloneLoading(true);
    try {
      setCloneError(null);
      setCloneLabelError(null);
      await onClone(program, {
        label: trimmedLabel,
        athleteId: selectedAthlete?.id ?? null,
      });
      handleCloseCloneDialog();
    } catch (error: unknown) {
      setCloneError(
        error instanceof Error
          ? error.message
          : t('common.unexpected_error', { defaultValue: 'Unexpected error.' }),
      );
    } finally {
      setCloneLoading(false);
    }
  }, [cloneLabel, handleCloseCloneDialog, onClone, program, selectedAthlete, t]);

  const handleAthleteSelection = React.useCallback((_: unknown, option: AthleteOption | null) => {
    setSelectedAthlete(option);
  }, []);

  const handleAthleteInputChange = React.useCallback((_: unknown, value: string) => {
    setAthleteInputValue(value);
    setAthleteQuery(value);
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

  const handleActionClick = React.useCallback(
    (actionKey: ProgramAction['key']) => {
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
    [handleOpenCloneDialog, onDelete, onEdit, program],
  );

  const cloneDialogTitle = t('programs-coatch.list.clone_dialog.title', {
    defaultValue: 'Copy the program',
  });
  const cloneDialogDescription = t('programs-coatch.list.clone_dialog.description', {
    defaultValue: 'Update the program name and athlete before duplicating.',
  });
  const cloneDialogNameLabel = t('programs-coatch.list.clone_dialog.fields.name', {
    defaultValue: 'Program name',
  });
  const cloneDialogNamePlaceholder = t(
    'programs-coatch.list.clone_dialog.fields.name_placeholder',
    {
      defaultValue: 'Ex: Summer strength plan',
    },
  );
  const cloneDialogAthleteLabel = t('programs-coatch.list.clone_dialog.fields.athlete', {
    defaultValue: 'Athlete',
  });
  const cloneDialogAthletePlaceholder = t(
    'programs-coatch.list.clone_dialog.fields.athlete_placeholder',
    {
      defaultValue: 'Select an athlete (optional)',
    },
  );
  const cloneDialogNoResults = t('programs-coatch.list.clone_dialog.no_results', {
    defaultValue: 'No athlete found',
  });
  const cloneDialogCancel = t('programs-coatch.list.clone_dialog.actions.cancel', {
    defaultValue: 'Cancel',
  });
  const cloneDialogSubmit = t('programs-coatch.list.clone_dialog.actions.submit', {
    defaultValue: 'Copy',
  });
  const cloneDialogSubmitting = t('programs-coatch.list.clone_dialog.actions.submitting', {
    defaultValue: 'Copying…',
  });

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
            {PROGRAM_ACTIONS.map(({ key, color, Icon }) => {
              const label = t(`programs-coatch.list.actions.${key}`);

              return (
                <Tooltip key={key} title={label}>
                  <IconButton
                    size="small"
                    aria-label={label}
                    onClick={() => handleActionClick(key)}
                    disabled={key === 'copy' && cloneLoading}
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
      <Dialog open={isCloneDialogOpen} onClose={cloneLoading ? undefined : handleCloseCloneDialog} fullWidth maxWidth="sm">
        <DialogTitle>{cloneDialogTitle}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {cloneDialogDescription}
          </Typography>
          <TextField
            autoFocus
            fullWidth
            label={cloneDialogNameLabel}
            placeholder={cloneDialogNamePlaceholder}
            value={cloneLabel}
            onChange={(event) => {
              setCloneLabel(event.target.value);
              if (cloneLabelError) {
                setCloneLabelError(null);
              }
            }}
            error={Boolean(cloneLabelError)}
            helperText={cloneLabelError ?? ' '}
            disabled={cloneLoading}
          />
          <Autocomplete
            options={mergedAthleteOptions}
            value={selectedAthlete}
            onChange={handleAthleteSelection}
            inputValue={athleteInputValue}
            onInputChange={handleAthleteInputChange}
            loading={athletesLoading}
            getOptionLabel={(option) => formatAthleteLabel(option)}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            clearOnBlur={false}
            handleHomeEndKeys
            noOptionsText={cloneDialogNoResults}
            disabled={cloneLoading}
            renderInput={(params) => (
              <TextField
                {...params}
                label={cloneDialogAthleteLabel}
                placeholder={cloneDialogAthletePlaceholder}
                InputProps={{
                  ...params.InputProps,
                }}
              />
            )}
          />
          {cloneError && (
            <Typography variant="body2" color="error">
              {cloneError}
            </Typography>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleCloseCloneDialog} disabled={cloneLoading}>
            {cloneDialogCancel}
          </Button>
          <Button onClick={handleCloneSubmit} variant="contained" color="primary" disabled={cloneLoading}>
            {cloneLoading ? cloneDialogSubmitting : cloneDialogSubmit}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
