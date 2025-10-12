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
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Add, Search } from '@mui/icons-material';
import { useSessions } from '@hooks/useSessions';
import { useExercises } from '@hooks/useExercises';
import { useCategories } from '@hooks/useCategories';
import { ProgramBuilderSessionItem } from './ProgramBuilderSessionItem';
import { ProgramBuilderSessionTemplateItem } from './ProgramBuilderSessionTemplateItem';
import { ProgramBuilderSessionDropZone } from './ProgramBuilderSessionDropZone';
import { ProgramBuilderExerciseLibraryItem } from './ProgramBuilderExerciseLibraryItem';

export type ExerciseLibraryItem = {
  id: string;
  label: string;
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

export type SessionTemplate = {
  id: string;
  label: string;
  duration: number;
  focus: string;
  tags: string[];
  exercises: TemplateExerciseRef[];
};

export type ProgramExercise = {
  id: string;
  exerciseId: string;
  sets: number;
  reps: string;
  rest: string;
};

export type ProgramSession = {
  id: string;
  label: string;
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
  | { type: 'session-move'; id: string }
  | { type: 'exercise-move'; sessionId: string; id: string };

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
    exercise_drop_zone: string;
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
        label: item.label,
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
        label: item.label,
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
  const [isDraggingSession, setIsDraggingSession] = React.useState(false);
  const [isDraggingExercise, setIsDraggingExercise] = React.useState(false);

  const idCountersRef = React.useRef<{ session: number; exercise: number }>({
    session: 0,
    exercise: 0,
  });

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
        label: template.label,
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
            .map((item) => item.label || item.slug || item.locale)
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
        template.label.toLowerCase().includes(search) ||
        template.tags.some((tag) => tag.toLowerCase().includes(search));
      return matchesSearch;
    });
  }, [sessionSearch, sessionTemplates]);

  const filteredExercises = React.useMemo(() => {
    const search = exerciseSearch.trim().toLowerCase();
    return exerciseLibrary.filter((exercise) => {
      const matchesSearch =
        !search ||
        exercise.label.toLowerCase().includes(search) ||
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
    (templateId: string, position?: number) => {
      const template = sessionTemplates.find((item) => item.id === templateId);
      if (!template) {
        return;
      }
      const session = createSessionFromTemplate(template);
      setSessions((prev) => {
        const insertAt =
          position != null
            ? Math.min(Math.max(position, 0), prev.length)
            : prev.length;
        const next = [...prev];
        next.splice(insertAt, 0, session);
        return next;
      });
      setSelectedSessionId(session.id);
    },
    [createSessionFromTemplate, sessionTemplates],
  );

  const handleAddExerciseToSession = React.useCallback(
    (sessionId: string, exerciseId: string, position?: number) => {
      const exercise = exerciseMap.get(exerciseId);
      if (!exercise) {
        return;
      }
      setSessions((prev) =>
        prev.map((session) => {
          if (session.id !== sessionId) {
            return session;
          }
          const exercises = [...session.exercises];
          const insertAt =
            position != null
              ? Math.min(Math.max(position, 0), exercises.length)
              : exercises.length;
          exercises.splice(insertAt, 0, {
            id: nextId('exercise'),
            exerciseId: exercise.id,
            sets: exercise.sets,
            reps: exercise.reps,
            rest: exercise.rest,
          });
          return {
            ...session,
            exercises,
          };
        }),
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

  const handleSessionDragStart = React.useCallback(() => {
    setIsDraggingSession(true);
  }, []);

  const handleSessionDragEnd = React.useCallback(() => {
    setIsDraggingSession(false);
  }, []);

  const handleExerciseDragStartFromLibrary = React.useCallback(() => {
    setIsDraggingExercise(true);
  }, []);

  const handleExerciseDragStartFromSession = React.useCallback(() => {
    setIsDraggingExercise(true);
  }, []);

  const handleExerciseDragEnd = React.useCallback(() => {
    setIsDraggingExercise(false);
  }, []);

  const handleSessionDropAtPosition = React.useCallback(
    (position: number, event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      const payload = parseDragData(event);
      setIsDraggingSession(false);
      if (!payload) {
        return;
      }
      if (payload.type === 'session') {
        handleAddSessionFromTemplate(payload.id, position);
        return;
      }
      if (payload.type === 'session-move') {
        setSessions((prev) => {
          const currentIndex = prev.findIndex(
            (session) => session.id === payload.id,
          );
          if (currentIndex === -1) {
            return prev;
          }
          if (position === currentIndex || position === currentIndex + 1) {
            return prev;
          }
          const next = [...prev];
          const [moved] = next.splice(currentIndex, 1);
          let targetIndex = position;
          if (position > currentIndex) {
            targetIndex -= 1;
          }
          targetIndex = Math.max(0, Math.min(targetIndex, next.length));
          next.splice(targetIndex, 0, moved);
          return next;
        });
      }
    },
    [handleAddSessionFromTemplate],
  );

  const handleExerciseDropAtPosition = React.useCallback(
    (sessionId: string, position: number, event: React.DragEvent<HTMLDivElement>) => {
      const payload = parseDragData(event);
      if (!payload) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      handleExerciseDragEnd();
      if (payload.type === 'exercise') {
        handleAddExerciseToSession(sessionId, payload.id, position);
        return;
      }
      if (payload.type === 'exercise-move') {
        setSessions((prev) => {
          const sourceSessionIndex = prev.findIndex(
            (session) => session.id === payload.sessionId,
          );
          if (sourceSessionIndex === -1) {
            return prev;
          }
          const sourceSession = prev[sourceSessionIndex];
          const sourceExerciseIndex = sourceSession.exercises.findIndex(
            (exercise) => exercise.id === payload.id,
          );
          if (sourceExerciseIndex === -1) {
            return prev;
          }
          const draggedExercise = sourceSession.exercises[sourceExerciseIndex];
          const withoutSource = prev.map((session) => {
            if (session.id !== payload.sessionId) {
              return session;
            }
            const exercises = [...session.exercises];
            exercises.splice(sourceExerciseIndex, 1);
            return {
              ...session,
              exercises,
            };
          });
          return withoutSource.map((session) => {
            if (session.id !== sessionId) {
              return session;
            }
            const exercises = [...session.exercises];
            let insertAt = position;
            if (
              payload.sessionId === sessionId &&
              sourceExerciseIndex < position
            ) {
              insertAt -= 1;
            }
            insertAt = Math.max(0, Math.min(insertAt, exercises.length));
            exercises.splice(insertAt, 0, draggedExercise);
            return {
              ...session,
              exercises,
            };
          });
        });
      }
    },
    [handleAddExerciseToSession, handleExerciseDragEnd],
  );

  const summaryText = t('programs-coatch.builder.structure.summary', {
    count: sessions.length,
  });
  const sessionDropZoneLabel = t(
    'programs-coatch.builder.structure.drop_zone',
    { defaultValue: 'Drop session here' },
  );
  const exerciseDropZoneLabel =
    builderCopy.structure.exercise_drop_zone ??
    t('programs-coatch.builder.structure.exercise_drop_zone', {
      defaultValue: 'Drop exercise here',
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
        {/* Header */}
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
            {/* Program configuration and template list */}
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
                {/* Session templates */}
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
                      <ProgramBuilderSessionTemplateItem
                        key={template.id}
                        template={template}
                        builderCopy={builderCopy}
                        onDragStart={(event) => {
                          handleSessionDragStart();
                          beginDrag(event, { type: 'session', id: template.id });
                        }}
                        onDragEnd={handleSessionDragEnd}
                      />
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
              {/* Program structure builder */}
              <Stack spacing={0.5}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {builderCopy.structure.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {summaryText}
                </Typography>
              </Stack>

              <Box
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
                  isDraggingSession ? (
                    <Stack spacing={1.5} sx={{ flexGrow: 1, minHeight: 180 }}>
                      <ProgramBuilderSessionDropZone
                        key="session-drop-empty"
                        label={sessionDropZoneLabel}
                        onDrop={(event) => handleSessionDropAtPosition(0, event)}
                      />
                      <Typography variant="body2" color="text.secondary" align="center">
                        {builderCopy.structure.empty}
                      </Typography>
                    </Stack>
                  ) : (
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
                  )
                ) : (
                  <>
                    {isDraggingSession && (
                      <ProgramBuilderSessionDropZone
                        key="session-drop-0"
                        label={sessionDropZoneLabel}
                        onDrop={(event) => handleSessionDropAtPosition(0, event)}
                      />
                    )}
                    {sessions.map((session, index) => (
                      <React.Fragment key={session.id}>
                        <ProgramBuilderSessionItem
                          session={session}
                          index={index}
                          isSelected={session.id === selectedSessionId}
                          builderCopy={builderCopy}
                          onSelect={() => setSelectedSessionId(session.id)}
                          onRemoveSession={() => handleRemoveSession(session.id)}
                          onRemoveExercise={(exerciseId) =>
                            handleRemoveExercise(session.id, exerciseId)
                          }
                          onDragStart={(event) => {
                            handleSessionDragStart();
                            beginDrag(event, {
                              type: 'session-move',
                              id: session.id,
                            });
                          }}
                          onDragEnd={handleSessionDragEnd}
                          getExerciseById={(exerciseId) => exerciseMap.get(exerciseId)}
                          isDraggingExercise={isDraggingExercise}
                          exerciseDropLabel={exerciseDropZoneLabel}
                          onExerciseDrop={handleExerciseDropAtPosition}
                          onExerciseDragStart={(sessionId, exerciseId, dragEvent) => {
                            handleExerciseDragStartFromSession();
                            beginDrag(dragEvent, {
                              type: 'exercise-move',
                              sessionId,
                              id: exerciseId,
                            });
                          }}
                          onExerciseDragEnd={handleExerciseDragEnd}
                        />
                        {isDraggingSession && (
                          <ProgramBuilderSessionDropZone
                            key={`session-drop-${index + 1}`}
                            label={sessionDropZoneLabel}
                            onDrop={(event) =>
                              handleSessionDropAtPosition(index + 1, event)
                            }
                          />
                        )}
                      </React.Fragment>
                    ))}
                  </>
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
              {/* Exercise library */}
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
                  {t('common.loading', { defaultValue: 'Loading categories...' })}
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
                    <ProgramBuilderExerciseLibraryItem
                      key={exercise.id}
                      exercise={exercise}
                      onDragStart={(event) => {
                        handleExerciseDragStartFromLibrary();
                        beginDrag(event, { type: 'exercise', id: exercise.id });
                      }}
                      onDragEnd={handleExerciseDragEnd}
                    />
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

        {/* Footer actions */}
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

