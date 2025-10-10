
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { alpha, useTheme } from '@mui/material/styles';
import {
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Grid } from '@mui/material';
import { Add, Close, DeleteOutline, DragIndicator, Search } from '@mui/icons-material';

type ExerciseLibraryItem = {
  id: string;
  name: string;
  focus: string;
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
  | { type: 'session-template'; id: string }
  | { type: 'exercise'; id: string }
  | { type: 'session-move'; id: string };

type BuilderCopy = {
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

const EXERCISE_LIBRARY: ExerciseLibraryItem[] = [
  {
    id: 'ex-bench-press',
    name: 'Developpe couche',
    focus: 'Haut du corps',
    category: 'strength',
    type: 'barbell',
    duration: 12,
    sets: 4,
    reps: '8-10',
    rest: '90s',
    tags: ['Pectoraux', 'Triceps'],
  },
  {
    id: 'ex-incline-dumbbell',
    name: 'Developpe incline halteres',
    focus: 'Haut du corps',
    category: 'strength',
    type: 'dumbbell',
    duration: 10,
    sets: 3,
    reps: '10-12',
    rest: '75s',
    tags: ['Pectoraux', 'Epaules'],
  },
  {
    id: 'ex-classic-pushup',
    name: 'Pompes classiques',
    focus: 'Haut du corps',
    category: 'bodyweight',
    type: 'bodyweight',
    duration: 8,
    sets: 3,
    reps: 'max',
    rest: '60s',
    tags: ['Pectoraux', 'Triceps', 'Gainage'],
  },
  {
    id: 'ex-goblet-squat',
    name: 'Squat goblet',
    focus: 'Bas du corps',
    category: 'strength',
    type: 'dumbbell',
    duration: 15,
    sets: 4,
    reps: '10-12',
    rest: '90s',
    tags: ['Quadriceps', 'Fessiers'],
  },
  {
    id: 'ex-lunge-walk',
    name: 'Fentes marchees',
    focus: 'Bas du corps',
    category: 'strength',
    type: 'dumbbell',
    duration: 10,
    sets: 3,
    reps: '12-14',
    rest: '75s',
    tags: ['Fessiers', 'Ischios'],
  },
  {
    id: 'ex-row-band',
    name: 'Tirage elastique',
    focus: 'Dos et posture',
    category: 'mobility',
    type: 'band',
    duration: 8,
    sets: 3,
    reps: '15',
    rest: '60s',
    tags: ['Dos', 'Epaules'],
  },
];

const SESSION_TEMPLATES: SessionTemplate[] = [
  {
    id: 'template-upper',
    name: 'Haut du corps',
    duration: 45,
    focus: 'Haut du corps',
    tags: ['Pectoraux', 'Dos', 'Epaules', 'Bras'],
    exercises: [
      { exerciseId: 'ex-bench-press', sets: 4, reps: '8-10', rest: '90s' },
      { exerciseId: 'ex-incline-dumbbell', sets: 3, reps: '10-12', rest: '75s' },
      { exerciseId: 'ex-classic-pushup', sets: 3, reps: 'max', rest: '60s' },
    ],
  },
  {
    id: 'template-lower',
    name: 'Bas du corps',
    duration: 50,
    focus: 'Bas du corps',
    tags: ['Quadriceps', 'Fessiers'],
    exercises: [
      { exerciseId: 'ex-goblet-squat', sets: 4, reps: '10-12', rest: '90s' },
      { exerciseId: 'ex-lunge-walk', sets: 3, reps: '12-14', rest: '75s' },
      { exerciseId: 'ex-row-band', sets: 3, reps: '15', rest: '60s' },
    ],
  },
  {
    id: 'template-posture',
    name: 'Dos et posture',
    duration: 35,
    focus: 'Dos et posture',
    tags: ['Dos', 'Gainage'],
    exercises: [
      { exerciseId: 'ex-row-band', sets: 4, reps: '15', rest: '45s' },
      { exerciseId: 'ex-classic-pushup', sets: 2, reps: 'max', rest: '60s' },
    ],
  },
];
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

export function ProgramsCoach(): React.JSX.Element {
  const { t } = useTranslation();
  const theme = useTheme();

  const [builderOpen, setBuilderOpen] = React.useState<boolean>(false);
  const [form, setForm] = React.useState<ProgramForm>({
    athlete: '',
    programName: '',
    duration: '',
    frequency: '',
    description: '',
  });
  const [sessionSearch, setSessionSearch] = React.useState<string>('');
  const [sessionCategory, setSessionCategory] = React.useState<string>('all');
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

  const nextId = React.useCallback((type: 'session' | 'exercise') => {
    idCountersRef.current[type] += 1;
    return `${type}-${idCountersRef.current[type]}`;
  }, []);

  const createSessionFromTemplate = React.useCallback(
    (template: SessionTemplate): ProgramSession => ({
      id: nextId('session'),
      name: template.name,
      duration: template.duration,
      focus: template.focus,
      tags: template.tags,
      exercises: template.exercises.map((exerciseRef) => {
        const base = EXERCISE_LIBRARY.find(
          (item) => item.id === exerciseRef.exerciseId,
        );
        return {
          id: nextId('exercise'),
          exerciseId: exerciseRef.exerciseId,
          sets: exerciseRef.sets ?? base?.sets ?? 3,
          reps: exerciseRef.reps ?? base?.reps ?? '10',
          rest: exerciseRef.rest ?? base?.rest ?? '60s',
        };
      }),
    }),
    [nextId],
  );

  const [sessions, setSessions] = React.useState<ProgramSession[]>(() => {
    const template = SESSION_TEMPLATES[0];
    return template ? [createSessionFromTemplate(template)] : [];
  });

  React.useEffect(() => {
    if (sessions.length === 0) {
      setSelectedSessionId(null);
      return;
    }
    if (!selectedSessionId) {
      setSelectedSessionId(sessions[0].id);
    }
  }, [sessions, selectedSessionId]);

  const builderCopy = t('programs-coatch.builder', {
    returnObjects: true,
  }) as unknown as BuilderCopy;

  const sessionCategories = React.useMemo(
    () =>
      Array.from(new Set(SESSION_TEMPLATES.map((template) => template.focus))).sort(),
    [],
  );

  const exerciseCategories = React.useMemo(
    () =>
      Array.from(new Set(EXERCISE_LIBRARY.map((exercise) => exercise.focus))).sort(),
    [],
  );

  const exerciseTypes = React.useMemo(
    () =>
      Array.from(new Set(EXERCISE_LIBRARY.map((exercise) => exercise.type))).sort(),
    [],
  );

  const filteredTemplates = React.useMemo(() => {
    const search = sessionSearch.trim().toLowerCase();
    return SESSION_TEMPLATES.filter((template) => {
      const matchesSearch =
        !search ||
        template.name.toLowerCase().includes(search) ||
        template.tags.some((tag) => tag.toLowerCase().includes(search));
      const matchesCategory =
        sessionCategory === 'all' || template.focus === sessionCategory;
      return matchesSearch && matchesCategory;
    });
  }, [sessionCategory, sessionSearch]);

  const filteredExercises = React.useMemo(() => {
    const search = exerciseSearch.trim().toLowerCase();
    return EXERCISE_LIBRARY.filter((exercise) => {
      const matchesSearch =
        !search ||
        exercise.name.toLowerCase().includes(search) ||
        exercise.tags.some((tag) => tag.toLowerCase().includes(search));
      const matchesCategory =
        exerciseCategory === 'all' || exercise.focus === exerciseCategory;
      const matchesType = exerciseType === 'all' || exercise.type === exerciseType;
      return matchesSearch && matchesCategory && matchesType;
    });
  }, [exerciseCategory, exerciseSearch, exerciseType]);

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
      const template = SESSION_TEMPLATES.find((item) => item.id === templateId);
      if (!template) {
        return;
      }
      const session = createSessionFromTemplate(template);
      setSessions((prev) => [...prev, session]);
      setSelectedSessionId(session.id);
    },
    [createSessionFromTemplate],
  );

  const handleAddExerciseToSession = React.useCallback(
    (sessionId: string, exerciseId: string) => {
      const exercise = EXERCISE_LIBRARY.find((item) => item.id === exerciseId);
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
    [nextId],
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
      if (payload?.type === 'session-template') {
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
    <Stack spacing={3} sx={{ mt: 2 }}>
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      alignItems={{ xs: 'flex-start', md: 'center' }}
      justifyContent="space-between"
      spacing={2}
    >
      <Stack spacing={0.5}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          {t('programs-coatch.title')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {builderOpen ? builderCopy.subtitle : t('programs-coatch.placeholder')}
        </Typography>
      </Stack>
      <Stack direction="row" spacing={1.5}>
        {builderOpen && (
          <Button
            variant="text"
            color="inherit"
            startIcon={<Close fontSize="small" />}
            onClick={() => setBuilderOpen(false)}
          >
            {t('programs-coatch.actions.close_builder')}
          </Button>
        )}
        <Button
          variant="contained"
          startIcon={<Add fontSize="small" />}
          onClick={() => setBuilderOpen(true)}
        >
          {t('programs-coatch.actions.open_builder')}
        </Button>
      </Stack>
    </Stack>

    {builderOpen ? (
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
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {builderCopy.title}
            </Typography>
            <Chip
              label={builderCopy.draft_label}
              variant="outlined"
              size="small"
              color="default"
            />
          </Stack>

          <Grid container spacing={3}>
            <Grid size={4}>
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
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {builderCopy.templates_title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {builderCopy.templates_subtitle}
                      </Typography>
                    </Stack>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Add fontSize="small" />}
                      onClick={() =>
                        handleAddSessionFromTemplate(SESSION_TEMPLATES[0]?.id ?? '')
                      }
                      disabled={!SESSION_TEMPLATES.length}
                    >
                      {builderCopy.config.button_create}
                    </Button>
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

                  <TextField
                    select
                    fullWidth
                    size="small"
                    label={builderCopy.config.filter_label}
                    value={sessionCategory}
                    onChange={(event) => setSessionCategory(event.target.value)}
                  >
                    <MenuItem value="all">{builderCopy.config.filter_all}</MenuItem>
                    {sessionCategories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </TextField>

                  <Stack spacing={1.5}>
                    {filteredTemplates.map((template) => (
                      <Paper
                        key={template.id}
                        variant="outlined"
                        draggable
                        onDragStart={(event) =>
                          beginDrag(event, { type: 'session-template', id: template.id })
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
                            <Button
                              size="small"
                              variant="text"
                              startIcon={<Add fontSize="small" />}
                              onClick={() => handleAddSessionFromTemplate(template.id)}
                            >
                              {builderCopy.config.button_create}
                            </Button>
                          </Stack>
                        </Stack>
                      </Paper>
                    ))}
                    {!filteredTemplates.length && (
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
            <Grid size={5}>
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
                      : '2px dashed' ,
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
                              : '1px solid' ,
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
                                const exercise = EXERCISE_LIBRARY.find(
                                  (item) => item.id === exerciseItem.exerciseId,
                                );
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
                                            {exercise.focus} - {exerciseItem.sets} x {exerciseItem.reps} - {exerciseItem.rest}
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

            <Grid size={4}>
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
                  sx={{ alignSelf: 'flex-start' }}
                >
                  {builderCopy.library.button_create}
                </Button>

                <Stack spacing={1.5} sx={{ mt: 1, flexGrow: 1 }}>
                  {filteredExercises.map((exercise) => (
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
                          {exercise.focus} - {exercise.duration} {builderCopy.structure.duration_unit} - {exercise.rest} repos
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
                  {!filteredExercises.length && (
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
            <Button variant="text" onClick={() => setBuilderOpen(false)}>
              {builderCopy.footer.cancel}
            </Button>
            <Button variant="contained" size="large" onClick={handleSubmit}>
              {builderCopy.footer.submit}
            </Button>
          </Stack>
        </Stack>
      </Paper>
    ) : (
      <Paper
        sx={{
          borderRadius: 3,
          p: { xs: 3, md: 5 },
          textAlign: 'center',
          bgcolor: alpha(theme.palette.primary.light, 0.08),
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
          {t('programs-coatch.placeholder')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {builderCopy.subtitle}
        </Typography>
      </Paper>
    )}
  </Stack>
);
}
