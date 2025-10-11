// src/components/programs/ProgramBuilderPanel.tsx
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { alpha, useTheme } from '@mui/material/styles';
import {
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Add, DeleteOutline, DragIndicator, Search } from '@mui/icons-material';
import { useSessions } from '@hooks/useSessions';
import { useExercises } from '@hooks/useExercises';
import { useCategories } from '@hooks/useCategories';

type ExerciseLibraryItem = {
  id: string;
  name: string;
  level: string;
  category: string;
  type: string;
  duration: number;
  sets: number;
  reps: string;
  rest: string;
  tags: string[];
};

type TemplateExerciseRef = {
  exerciseId: string;
  sets?: number;
  reps?: string;
  rest?: string;
};

type SessionTemplate = {
  id: string;
  name: string;
  duration: number;
  focus: string;
  tags: string[];
  exercises: TemplateExerciseRef[];
};

type ProgramExercise = {
  id: string;
  exerciseId: string;
  sets: number;
  reps: string;
  rest: string;
};

type ProgramSession = {
  id: string;
  name: string;
  duration: number;
  focus: string;
  tags: string[];
  exercises: ProgramExercise[];
};

type ProgramForm = {
  athlete: string;
  programName: string;
  duration: string;
  frequency: string;
  description: string;
};

type DragPayload =
  | { type: 'session'; id: string }
  | { type: 'exercise'; id: string }
  | { type: 'session-move'; id: string };

export type BuilderCopy = {
  title: string;
  subtitle: string;
  config: {
    title: string;
    client_label: string;
    client_placeholder: string;
    program_name_label: string;
    duration_label: string;
    frequency_label: string;
    description_label: string;
    description_placeholder: string;
    search_placeholder: string;
    filter_label: string;
    filter_all: string;
    button_create: string;
  };
  templates_title: string;
  templates_subtitle: string;
  structure: {
    title: string;
    summary: string;
    empty: string;
    session_prefix: string;
    duration_unit: string;
    tags_label: string;
  };
  library: {
    title: string;
    subtitle: string;
    search_placeholder: string;
    primary_filter_label: string;
    primary_filter_all: string;
    secondary_filter_label: string;
    secondary_filter_all: string;
    button_create: string;
  };
  footer: {
    cancel: string;
    submit: string;
  };
  draft_label: string;
};

const beginDrag = <T extends HTMLElement>(
  event: React.DragEvent<T>,
  payload: DragPayload,
) => {
  event.dataTransfer.setData('application/json', JSON.stringify(payload));
  event.dataTransfer.effectAllowed = 'copyMove';
};

const parseDragData = (event: React.DragEvent): DragPayload | null => {
  const raw = event.dataTransfer.getData('application/json');
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as DragPayload;
  } catch (error) {
    console.warn('Unable to parse drag payload', error);
    return null;
  }
};

const parseSeriesCount = (series: string | null | undefined): number => {
  if (!series) {
    return 3;
  }
  const direct = Number(series);
  if (!Number.isNaN(direct) && direct > 0) {
    return direct;
  }
  const match = series.match(/\d+/);
  return match ? Number(match[0]) : 3;
};

type ProgramBuilderPanelProps = {
  builderCopy: BuilderCopy;
  onCancel: () => void;
};

export function ProgramBuilderPanel({
  builderCopy,
  onCancel,
}: ProgramBuilderPanelProps): React.JSX.Element {
  const { t } = useTranslation();
  const theme = useTheme();

  const { items: sessionItems, loading: sessionsLoading } = useSessions({
    page: 1,
    limit: 50,
    q: '',
  });
  const { items: exerciseItems, loading: exercisesLoading } = useExercises({
    page: 1,
    limit: 100,
    q: '',
  });
  const { items: categoryItems, loading: categoriesLoading } = useCategories({
    page: 1,
    limit: 100,
    q: '',
  });

  const sessionTemplates = React.useMemo<SessionTemplate[]>(
    () =>
      sessionItems.map((item) => ({
        id: item.id,
        name: item.title,
        duration: item.durationMin,
        focus: item.locale || 'General',
        tags: [],
        exercises: item.exerciseIds.map((exerciseId) => ({ exerciseId })),
      })),
    [sessionItems],
  );

  const exerciseLibrary = React.useMemo<ExerciseLibraryItem[]>(
    () =>
      exerciseItems.map((item) => ({
        id: item.id,
        name: item.name,
        level: item.level,
        category: item.level,
        type: item.visibility,
        duration: item.rest ?? 0,
        sets: parseSeriesCount(item.series),
        reps: item.repetitions,
        rest: item.rest != null ? `${item.rest}s` : '-',
        tags: [],
      })),
    [exerciseItems],
  );

  const exerciseMap = React.useMemo(
    () => new Map(exerciseLibrary.map((exercise) => [exercise.id, exercise])),
    [exerciseLibrary],
  );

  const [form, setForm] = React.useState<ProgramForm>({
    athlete: '',
    programName: '',
    duration: '',
    frequency: '',
    description: '',
  });
  const [sessionSearch, setSessionSearch] = React.useState<string>('');
  const [exerciseSearch, setExerciseSearch] = React.useState<string>('');
  const [exerciseCategory, setExerciseCategory] = React.useState<string>('all');
  const [exerciseType, setExerciseType] = React.useState<string>('all');
  const [selectedSessionId, setSelectedSessionId] = React.useState<string | null>(
    null,
  );

  const idCountersRef = React.useRef<{ session: number; exercise: number }>({
    session: 0,
    exercise: 0,
  });

  const initializedRef = React.useRef(false);

  const nextId = React.useCallback((type: 'session' | 'exercise') => {
    idCountersRef.current[type] += 1;
    return `${type}-${idCountersRef.current[type]}`;
  }, []);

  const createSessionFromTemplate = React.useCallback(
    (template: SessionTemplate): ProgramSession => {
      const exercises = template.exercises
        .map((exerciseRef) => {
          const base = exerciseMap.get(exerciseRef.exerciseId);
          if (!base) {
            return null;
          }
          return {
            id: nextId('exercise'),
            exerciseId: base.id,
            sets: exerciseRef.sets ?? base.sets,
            reps: exerciseRef.reps ?? base.reps,
            rest: exerciseRef.rest ?? base.rest,
          };
        })
        .filter((exercise): exercise is ProgramExercise => exercise !== null);

      return {
        id: nextId('session'),
        name: template.name,
        duration: template.duration,
        focus: template.focus,
        tags: template.tags,
        exercises,
      };
    },
    [exerciseMap, nextId],
  );

  const [sessions, setSessions] = React.useState<ProgramSession[]>([]);

  React.useEffect(() => {
    if (initializedRef.current || !sessionTemplates.length) {
      return;
    }
    const [firstTemplate] = sessionTemplates;
    const firstSession = createSessionFromTemplate(firstTemplate);
    setSessions([firstSession]);
    initializedRef.current = true;
  }, [createSessionFromTemplate, sessionTemplates]);

  React.useEffect(() => {
    if (sessions.length === 0) {
      setSelectedSessionId(null);
      return;
    }
    if (!selectedSessionId) {
      setSelectedSessionId(sessions[0].id);
    }
  }, [sessions, selectedSessionId]);

  const exerciseCategories = React.useMemo(
    () =>
      Array.from(
        new Set(
          categoryItems
            .map((item) => item.name || item.slug || item.locale)
            .filter((value): value is string => Boolean(value)),
        ),
      ).sort(),
    [categoryItems],
  );

  const exerciseTypes = React.useMemo(
    () =>
      Array.from(
        new Set(
          exerciseLibrary
            .map((exercise) => exercise.type)
            .filter((value): value is string => Boolean(value)),
        ),
      ).sort(),
    [exerciseLibrary],
  );

  const filteredTemplates = React.useMemo(() => {
    const search = sessionSearch.trim().toLowerCase();
    return sessionTemplates.filter((template) => {
      const matchesSearch =
        !search ||
        template.name.toLowerCase().includes(search) ||
        template.tags.some((tag) => tag.toLowerCase().includes(search));
      return matchesSearch;
    });
  }, [sessionSearch, sessionTemplates]);

  const filteredExercises = React.useMemo(() => {
    const search = exerciseSearch.trim().toLowerCase();
    return exerciseLibrary.filter((exercise) => {
      const matchesSearch =
        !search ||
        exercise.name.toLowerCase().includes(search) ||
        exercise.tags.some((tag) => tag.toLowerCase().includes(search));
      const matchesCategory =
        exerciseCategory === 'all' || exercise.category === exerciseCategory;
      const matchesType = exerciseType === 'all' || exercise.type === exerciseType;
      return matchesSearch && matchesCategory && matchesType;
    });
  }, [exerciseCategory, exerciseLibrary, exerciseSearch, exerciseType]);

  const handleFormChange = React.useCallback(
    (field: keyof ProgramForm) =>
      (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { value } = event.target;
        setForm((prev) => ({ ...prev, [field]: value }));
      },
    [],
  );

  const handleAddSessionFromTemplate = React.useCallback(
    (templateId: string) => {
      const template = sessionTemplates.find((item) => item.id === templateId);
      if (!template) {
        return;
      }
      const session = createSessionFromTemplate(template);
      setSessions((prev) => [...prev, session]);
      setSelectedSessionId(session.id);
    },
    [createSessionFromTemplate, sessionTemplates],
  );

  const handleAddExerciseToSession = React.useCallback(
    (sessionId: string, exerciseId: string) => {
      const exercise = exerciseMap.get(exerciseId);
      if (!exercise) {
        return;
      }
      setSessions((prev) =>
        prev.map((session) =>
          session.id === sessionId
            ? {
              ...session,
              exercises: [
                ...session.exercises,
                {
                  id: nextId('exercise'),
                  exerciseId: exercise.id,
                  sets: exercise.sets,
                  reps: exercise.reps,
                  rest: exercise.rest,
                },
              ],
            }
            : session,
        ),
      );
    },
    [exerciseMap, nextId],
  );

  const handleRemoveSession = React.useCallback((sessionId: string) => {
    setSessions((prev) => prev.filter((session) => session.id !== sessionId));
  }, []);

  const handleRemoveExercise = React.useCallback(
    (sessionId: string, exerciseId: string) => {
      setSessions((prev) =>
        prev.map((session) =>
          session.id === sessionId
            ? {
              ...session,
              exercises: session.exercises.filter(
                (exercise) => exercise.id !== exerciseId,
              ),
            }
            : session,
        ),
      );
    },
    [],
  );

  const handleSessionReorder = React.useCallback(
    (sourceId: string, targetId: string) => {
      if (sourceId === targetId) {
        return;
      }
      setSessions((prev) => {
        const sourceIndex = prev.findIndex((session) => session.id === sourceId);
        const targetIndex = prev.findIndex((session) => session.id === targetId);
        if (sourceIndex === -1 || targetIndex === -1) {
          return prev;
        }
        const next = [...prev];
        const [moved] = next.splice(sourceIndex, 1);
        next.splice(targetIndex, 0, moved);
        return next;
      });
    },
    [],
  );

  const handleStructureDrop = React.useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const payload = parseDragData(event);
      if (payload?.type === 'session') {
        handleAddSessionFromTemplate(payload.id);
      }
    },
    [handleAddSessionFromTemplate],
  );

  const handleSessionDrop = React.useCallback(
    (sessionId: string, event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      const payload = parseDragData(event);
      if (!payload) {
        return;
      }
      if (payload.type === 'session-move') {
        handleSessionReorder(payload.id, sessionId);
        return;
      }
      if (payload.type === 'exercise') {
        handleAddExerciseToSession(sessionId, payload.id);
      }
    },
    [handleAddExerciseToSession, handleSessionReorder],
  );

  const handleSessionDragOver = React.useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const payload = parseDragData(event);
    event.dataTransfer.dropEffect =
      payload?.type === 'session-move' ? 'move' : 'copy';
  }, []);

  const summaryText = t('programs-coatch.builder.structure.summary', {
    count: sessions.length,
  });

  const handleSubmit = React.useCallback(() => {
    const draft = {
      form,
      sessions,
    };
    console.info('Program draft ready to submit', draft);
  }, [form, sessions]);

  return (
    <Paper
      elevation={4}
      sx={{
        borderRadius: 3,
        p: { xs: 2, md: 3 },
        bgcolor: alpha(theme.palette.background.paper, 0.98),
      }}
    >
      <Stack spacing={3}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            {builderCopy.title}
          </Typography>
          <Chip
            label={builderCopy.draft_label}
            variant="outlined"
            size="small"
            color="default"
          />
        </Stack>

        <Stack spacing={0.5}>
          <Typography variant="body2" color="text.secondary">
            {builderCopy.subtitle}
          </Typography>
        </Stack>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 3, lg: 3 }}>
            <Stack spacing={3}>
              <Paper
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                  {builderCopy.config.title}
                </Typography>

                <TextField
                  label={builderCopy.config.client_label}
                  placeholder={builderCopy.config.client_placeholder}
                  size="small"
                  fullWidth
                  value={form.athlete}
                  onChange={handleFormChange('athlete')}
                />
                <TextField
                  label={builderCopy.config.program_name_label}
                  placeholder={builderCopy.config.client_placeholder}
                  size="small"
                  fullWidth
                  value={form.programName}
                  onChange={handleFormChange('programName')}
                />

                <Stack direction="row" spacing={1.5}>
                  <TextField
                    label={builderCopy.config.duration_label}
                    size="small"
                    fullWidth
                    value={form.duration}
                    onChange={handleFormChange('duration')}
                  />
                  <TextField
                    label={builderCopy.config.frequency_label}
                    size="small"
                    fullWidth
                    value={form.frequency}
                    onChange={handleFormChange('frequency')}
                  />
                </Stack>

                <TextField
                  label={builderCopy.config.description_label}
                  placeholder={builderCopy.config.description_placeholder}
                  size="small"
                  multiline
                  minRows={4}
                  fullWidth
                  value={form.description}
                  onChange={handleFormChange('description')}
                />
              </Paper>

              <Paper
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                <Stack
                  direction="row"
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  justifyContent="space-between"
                  spacing={1}
                >
                  <Stack spacing={0.5}>
                    <Typography variant="h5" sx={{ fontWeight: 600 }}>
                      {builderCopy.templates_title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {builderCopy.templates_subtitle}
                    </Typography>
                  </Stack>
                </Stack>

                <TextField
                  fullWidth
                  size="small"
                  placeholder={builderCopy.config.search_placeholder}
                  value={sessionSearch}
                  onChange={(event) => setSessionSearch(event.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search fontSize="small" color="disabled" />
                      </InputAdornment>
                    ),
                  }}
                />

                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Add fontSize="small" />}
                  onClick={() =>
                    console.log('Create new session')
                  }
                  disabled={!sessionTemplates.length}
                >
                  {builderCopy.config.button_create}
                </Button>

                <Stack spacing={1.5}>
                  {sessionsLoading && (
                    <Typography variant="body2" color="text.secondary">
                      {t('common.loading', { defaultValue: 'Loading...' })}
                    </Typography>
                  )}
                  {!sessionsLoading &&
                    filteredTemplates.map((template) => (
                      <Paper
                        key={template.id}
                        variant="outlined"
                        draggable
                        onDragStart={(event) =>
                          beginDrag(event, { type: 'session', id: template.id })
                        }
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          cursor: 'grab',
                          '&:hover': {
                            borderColor: theme.palette.primary.main,
                            boxShadow: theme.shadows[2],
                          },
                        }}
                      >
                        <Stack spacing={1.25}>
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {template.name}
                            </Typography>
                            <Chip
                              label={`${template.duration} ${builderCopy.structure.duration_unit}`}
                              size="small"
                              color="secondary"
                              variant="outlined"
                            />
                          </Stack>
                          <Stack direction="row" spacing={0.5} flexWrap="wrap">
                            {template.tags.map((tag) => (
                              <Chip key={tag} label={tag} size="small" variant="outlined" />
                            ))}
                          </Stack>
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <Typography variant="caption" color="text.secondary">
                              {template.exercises.length} exercices
                            </Typography>
                          </Stack>
                        </Stack>
                      </Paper>
                    ))}
                  {!sessionsLoading && !filteredTemplates.length && (
                    <Typography variant="body2" color="text.secondary">
                      {sessionSearch
                        ? t('common.field_incorrect')
                        : t('programs-coatch.placeholder')}
                    </Typography>
                  )}
                </Stack>
              </Paper>
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 5, lg: 5 }}>
            <Paper
              sx={{
                p: 2.5,
                borderRadius: 2,
                minHeight: 420,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <Stack spacing={0.5}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {builderCopy.structure.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {summaryText}
                </Typography>
              </Stack>

              <Box
                onDragOver={(event) => {
                  event.preventDefault();
                  event.dataTransfer.dropEffect = 'copy';
                }}
                onDrop={handleStructureDrop}
                sx={{
                  flexGrow: 1,
                  border: sessions.length
                    ? '1px solid'
                    : '2px dashed',
                  borderRadius: 2,
                  bgcolor: sessions.length
                    ? alpha(theme.palette.background.default, 0.5)
                    : alpha(theme.palette.primary.light, 0.1),
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  transition: 'background-color 150ms ease',
                }}
              >
                {sessions.length === 0 ? (
                  <Stack
                    alignItems="center"
                    justifyContent="center"
                    spacing={1}
                    sx={{ flexGrow: 1, minHeight: 180 }}
                  >
                    <Typography variant="body2" color="text.secondary" align="center">
                      {builderCopy.structure.empty}
                    </Typography>
                  </Stack>
                ) : (
                  sessions.map((session, index) => (
                    <Paper
                      key={session.id}
                      draggable
                      onDragStart={(event) =>
                        beginDrag(event, { type: 'session-move', id: session.id })
                      }
                      onDragOver={handleSessionDragOver}
                      onDrop={(event) => handleSessionDrop(session.id, event)}
                      onClick={() => setSelectedSessionId(session.id)}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        cursor: 'grab',
                        border:
                          session.id === selectedSessionId
                            ? '2px solid'
                            : '1px solid',
                        bgcolor:
                          session.id === selectedSessionId
                            ? alpha(theme.palette.primary.main, 0.06)
                            : theme.palette.background.paper,
                        transition:
                          'border-color 150ms ease, background-color 150ms ease',
                      }}
                    >
                      <Stack spacing={1.5}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Stack direction="row" spacing={1} alignItems="center">
                            <DragIndicator fontSize="small" color="disabled" />
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {builderCopy.structure.session_prefix} {index + 1} - {session.name}
                            </Typography>
                          </Stack>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Chip
                              label={`${session.duration} ${builderCopy.structure.duration_unit}`}
                              size="small"
                            />
                            <IconButton
                              size="small"
                              onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                                event.stopPropagation();
                                handleRemoveSession(session.id);
                              }}
                              aria-label="delete-session"
                            >
                              <DeleteOutline fontSize="small" />
                            </IconButton>
                          </Stack>
                        </Stack>

                        <Stack direction="row" spacing={0.5} flexWrap="wrap">
                          {session.tags.map((tag) => (
                            <Chip key={tag} label={tag} size="small" variant="outlined" />
                          ))}
                        </Stack>

                        <Stack spacing={1}>
                          {session.exercises.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">
                              {builderCopy.library.subtitle}
                            </Typography>
                          ) : (
                            session.exercises.map((exerciseItem, exerciseIndex) => {
                              const exercise = exerciseMap.get(exerciseItem.exerciseId);
                              if (!exercise) {
                                return null;
                              }
                              return (
                                <Paper
                                  key={exerciseItem.id}
                                  variant="outlined"
                                  sx={{ p: 1.5, borderRadius: 1.75 }}
                                >
                                  <Stack
                                    direction="row"
                                    alignItems="flex-start"
                                    spacing={1}
                                    justifyContent="space-between"
                                  >
                                    <Stack direction="row" spacing={1} alignItems="flex-start">
                                      <Typography
                                        variant="subtitle2"
                                        sx={{ fontWeight: 700, minWidth: 24 }}
                                      >
                                        {exerciseIndex + 1}.
                                      </Typography>
                                      <Stack spacing={0.5}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                          {exercise.name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          {exerciseItem.sets} x {exerciseItem.reps} - {exerciseItem.rest}
                                        </Typography>
                                        <Stack direction="row" spacing={0.5} flexWrap="wrap">
                                          {exercise.tags.map((tag) => (
                                            <Chip
                                              key={`${exercise.id}-${tag}`}
                                              label={tag}
                                              size="small"
                                              variant="outlined"
                                            />
                                          ))}
                                        </Stack>
                                      </Stack>
                                    </Stack>
                                    <IconButton
                                      size="small"
                                      onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
                                        event.stopPropagation();
                                        handleRemoveExercise(session.id, exerciseItem.id);
                                      }}
                                      aria-label="delete-exercise"
                                    >
                                      <DeleteOutline fontSize="small" />
                                    </IconButton>
                                  </Stack>
                                </Paper>
                              );
                            })
                          )}
                        </Stack>
                      </Stack>
                    </Paper>
                  ))
                )}
              </Box>
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 4, lg: 4 }}>
            <Paper
              sx={{
                p: 2.5,
                borderRadius: 2,
                minHeight: 420,
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              <Stack spacing={0.5}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {builderCopy.library.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {builderCopy.library.subtitle}
                </Typography>
              </Stack>

              <TextField
                fullWidth
                size="small"
                placeholder={builderCopy.library.search_placeholder}
                value={exerciseSearch}
                onChange={(event) => setExerciseSearch(event.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search fontSize="small" color="disabled" />
                    </InputAdornment>
                  ),
                }}
              />

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label={builderCopy.library.primary_filter_label}
                  value={exerciseCategory}
                  disabled={categoriesLoading && !exerciseCategories.length}
                  onChange={(event) => setExerciseCategory(event.target.value)}
                >
                  <MenuItem value="all">
                    {builderCopy.library.primary_filter_all}
                  </MenuItem>
                  {exerciseCategories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label={builderCopy.library.secondary_filter_label}
                  value={exerciseType}
                  onChange={(event) => setExerciseType(event.target.value)}
                >
                  <MenuItem value="all">
                    {builderCopy.library.secondary_filter_all}
                  </MenuItem>
                  {exerciseTypes.map((type) => (
                    <MenuItem key={type} value={type}>
                      {type}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>

              <Button
                variant="outlined"
                size="small"
                startIcon={<Add fontSize="small" />}
                onClick={() => console.log('Create new exercise')}
              >
                {builderCopy.library.button_create}
              </Button>

              {categoriesLoading && (
                <Typography variant="caption" color="text.secondary">
                  {t('common.loading', { defaultValue: 'Loading categories…' })}
                </Typography>
              )}

              <Stack spacing={1.5} sx={{ mt: 1, flexGrow: 1 }}>
                {exercisesLoading && (
                  <Typography variant="body2" color="text.secondary">
                    {t('common.loading', { defaultValue: 'Loading...' })}
                  </Typography>
                )}
                {!exercisesLoading &&
                  filteredExercises.map((exercise) => (
                    <Paper
                      key={exercise.id}
                      variant="outlined"
                      draggable
                      onDragStart={(event) =>
                        beginDrag(event, { type: 'exercise', id: exercise.id })
                      }
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        cursor: 'grab',
                        '&:hover': {
                          borderColor: theme.palette.primary.main,
                          boxShadow: theme.shadows[1],
                        },
                      }}
                    >
                      <Stack spacing={1}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {exercise.name}
                          </Typography>
                          <Chip
                            label={`${exercise.sets} x ${exercise.reps}`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          {exercise.level} · {exercise.rest}
                        </Typography>
                        <Stack direction="row" spacing={0.5} flexWrap="wrap">
                          {exercise.tags.map((tag) => (
                            <Chip
                              key={`${exercise.id}-${tag}`}
                              label={tag}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Stack>
                      </Stack>
                    </Paper>
                  ))}
                {!exercisesLoading && !filteredExercises.length && (
                  <Typography variant="body2" color="text.secondary">
                    {exerciseSearch
                      ? t('common.field_incorrect')
                      : t('programs-coatch.placeholder')}
                  </Typography>
                )}
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        <Divider />

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          justifyContent="space-between"
          spacing={1.5}
        >
          <Button variant="text" onClick={onCancel}>
            {builderCopy.footer.cancel}
          </Button>
          <Button variant="contained" size="large" onClick={handleSubmit}>
            {builderCopy.footer.submit}
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}

