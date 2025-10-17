import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { useSessions } from '@hooks/useSessions';
import { useExercises, type ExerciseVisibility } from '@hooks/useExercises';
import { useCategories } from '@hooks/useCategories';
import { useUsers, type User } from '@src/hooks/useUsers';
import { usePrograms } from '@src/hooks/usePrograms';
import { useFlashStore } from '@src/hooks/useFlashStore';
import { useDebouncedValue } from '@src/hooks/useDebouncedValue';
import { slugify } from '@src/utils/slugify';

import type {
  BuilderCopy,
  ExerciseLibraryItem,
  ExerciseCategoryOption,
  ExerciseTypeOption,
  ProgramForm,
  ProgramSession,
  SessionTemplate,
} from '@src/components/programs/programBuilderTypes';
import {
  parseDragData,
  parseRestSecondsValue,
  parseSeriesCount,
  logWithTimestamp,
} from '@src/components/programs/programBuilderUtils';

import type { ProgramExercise } from '@src/components/programs/programBuilderTypes';

const INITIAL_FORM_STATE: ProgramForm = {
  athlete: '',
  programName: '',
  duration: '',
  frequency: '',
  description: '',
};

type UseProgramBuilderResult = {
  form: ProgramForm;
  sessions: ProgramSession[];
  selectedAthlete: User | null;
  users: User[];
  sessionSearch: string;
  exerciseSearch: string;
  exerciseCategory: string;
  exerciseType: 'all' | ExerciseVisibility;
  sessionTemplates: SessionTemplate[];
  filteredExercises: ExerciseLibraryItem[];
  exerciseCategoryOptions: ExerciseCategoryOption[];
  exerciseTypeOptions: ExerciseTypeOption[];
  exerciseMap: Map<string, ExerciseLibraryItem>;
  limitHint: string;
  emptyExercisesMessage: string;
  summaryText: string;
  sessionDropZoneLabel: string;
  exerciseDropZoneLabel: string;
  sessionsLoading: boolean;
  exercisesLoading: boolean;
  categoriesLoading: boolean;
  usersLoading: boolean;
  isDraggingSession: boolean;
  isDraggingExercise: boolean;
  sessionDragOrigin: 'library' | 'draft' | null;
  exerciseDragOrigin: 'library' | 'draft' | null;
  setSessionSearch: React.Dispatch<React.SetStateAction<string>>;
  setExerciseSearch: React.Dispatch<React.SetStateAction<string>>;
  setExerciseCategory: React.Dispatch<React.SetStateAction<string>>;
  setExerciseType: React.Dispatch<React.SetStateAction<'all' | ExerciseVisibility>>;
  setUsersQ: React.Dispatch<React.SetStateAction<string>>;
  handleSelectAthlete: (_event: unknown, value: User | null) => void;
  handleFormChange: (
    field: keyof ProgramForm,
  ) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleAddSessionFromTemplate: (templateId: string, position?: number) => void;
  handleCreateEmptySession: () => void;
  handleRemoveSession: (sessionId: string) => void;
  handleRemoveExercise: (sessionId: string, exerciseId: string) => void;
  handleSessionLabelChange: (sessionId: string, label: string) => void;
  handleExerciseLabelChange: (
    sessionId: string,
    exerciseId: string,
    label: string,
  ) => void;
  handleExerciseDropAtPosition: (
    sessionId: string,
    position: number,
    event: React.DragEvent<HTMLDivElement>,
  ) => void;
  handleSessionDropAtPosition: (
    position: number,
    event: React.DragEvent<HTMLDivElement>,
  ) => void;
  handleSessionDragStartFromLibrary: () => void;
  handleSessionDragStartFromDraft: () => void;
  handleSessionDragEnd: () => void;
  handleExerciseDragStartFromLibrary: () => void;
  handleExerciseDragStartFromSession: () => void;
  handleExerciseDragEnd: () => void;
  handleSubmit: () => Promise<void>;
  userLabel: (user: User | null) => string;
};

/**
 * Centralises Program Builder state management and command handlers.
 * The hook removes imperative logic from the presentation component, improving readability and reusability.
 */
export function useProgramBuilder(
  builderCopy: BuilderCopy,
  onCancel: () => void,
): UseProgramBuilderResult {
  const { t, i18n } = useTranslation();
  const flash = useFlashStore();

  const [usersQ, setUsersQ] = React.useState('');
  const [selectedAthlete, setSelectedAthlete] = React.useState<User | null>(null);
  const [sessionSearch, setSessionSearch] = React.useState('');
  const [exerciseSearch, setExerciseSearch] = React.useState('');
  const [exerciseCategory, setExerciseCategory] = React.useState('all');
  const [exerciseType, setExerciseType] = React.useState<'all' | ExerciseVisibility>('all');
  const [isDraggingSession, setIsDraggingSession] = React.useState(false);
  const [sessionDragOrigin, setSessionDragOrigin] = React.useState<'library' | 'draft' | null>(null);
  const [isDraggingExercise, setIsDraggingExercise] = React.useState(false);
  const [exerciseDragOrigin, setExerciseDragOrigin] = React.useState<'library' | 'draft' | null>(null);
  const [sessions, setSessions] = React.useState<ProgramSession[]>([]);
  const [form, setForm] = React.useState<ProgramForm>(INITIAL_FORM_STATE);

  const debouncedQ = useDebouncedValue(usersQ, 300);
  const debouncedSessionSearch = useDebouncedValue(sessionSearch, 300);
  const debouncedExerciseSearch = useDebouncedValue(exerciseSearch, 300);

  const exerciseVisibilityFilter = React.useMemo<ExerciseVisibility | undefined>(
    () => (exerciseType === 'all' ? undefined : exerciseType),
    [exerciseType],
  );

  const exerciseCategoryFilter = React.useMemo<string | undefined>(
    () => (exerciseCategory === 'all' ? undefined : exerciseCategory),
    [exerciseCategory],
  );

  const collator = React.useMemo(
    () => new Intl.Collator(i18n.language || undefined, { sensitivity: 'base' }),
    [i18n.language],
  );

  const { items: sessionItems, loading: sessionsLoading } = useSessions({
    page: 1,
    limit: 10,
    q: debouncedSessionSearch,
  });

  const { items: exerciseItems, loading: exercisesLoading } = useExercises({
    page: 1,
    limit: 10,
    q: debouncedExerciseSearch,
    visibility: exerciseVisibilityFilter,
    categoryId: exerciseCategoryFilter,
  });

  const { items: categoryItems, loading: categoriesLoading } = useCategories({
    page: 1,
    limit: 100,
    q: '',
  });

  const { items: users, loading: usersLoading } = useUsers({
    page: 1,
    limit: 100,
    q: debouncedQ,
  });

  const { create: createProgram } = usePrograms({ page: 1, limit: 50, q: '' });

  const userLabel = React.useCallback((user: User | null) => {
    if (!user) {
      return '';
    }
    return user.email;
  }, []);

  const sessionTemplates = React.useMemo<SessionTemplate[]>(() => {
    const sorted = [...sessionItems].sort((a, b) => a.label.localeCompare(b.label));
    return sorted.map((item) => ({
      id: item.id,
      label: item.label,
      duration: item.durationMin,
      tags: [],
      exercises: item.exerciseIds.map((exerciseId) => ({ exerciseId })),
    }));
  }, [sessionItems]);

  const exerciseCategoryOptions = React.useMemo<ExerciseCategoryOption[]>(() => {
    const dedup = new Map<string, ExerciseCategoryOption>();
    for (const item of categoryItems) {
      const label = item.label || item.slug || item.locale;
      if (!label) continue;
      dedup.set(item.id, { id: item.id, label });
    }
    return Array.from(dedup.values()).sort((a, b) => collator.compare(a.label, b.label));
  }, [categoryItems, collator]);

  const categoryLabelById = React.useMemo(
    () => new Map(exerciseCategoryOptions.map((option) => [option.id, option.label])),
    [exerciseCategoryOptions],
  );

  const exerciseLibrary = React.useMemo<ExerciseLibraryItem[]>(() => {
    const sorted = [...exerciseItems].sort((a, b) => collator.compare(a.label, b.label));
    return sorted.map((item) => {
      const seenMuscles = new Set<string>();
      const muscles: ExerciseLibraryItem['muscles'] = [];
      for (const muscle of item.primaryMuscles ?? []) {
        if (!muscle?.id || seenMuscles.has(muscle.id)) continue;
        muscles.push({
          id: muscle.id,
          label: muscle.label ?? muscle.id,
          role: 'primary',
        });
        seenMuscles.add(muscle.id);
      }
      for (const muscle of item.secondaryMuscles ?? []) {
        if (!muscle?.id || seenMuscles.has(muscle.id)) continue;
        muscles.push({
          id: muscle.id,
          label: muscle.label ?? muscle.id,
          role: 'secondary',
        });
        seenMuscles.add(muscle.id);
      }

      const tags = (item.tags ?? [])
        .filter((tag): tag is NonNullable<typeof tag> => Boolean(tag?.id))
        .map((tag) => ({
          id: tag!.id,
          label: tag!.label ?? tag!.id,
        }));

      const equipment = (item.equipment ?? [])
        .filter((eq): eq is NonNullable<typeof eq> => Boolean(eq?.id))
        .map((eq) => ({
          id: eq!.id,
          label: eq!.label ?? eq!.id,
        }));

      const categoryLabel =
        item.category?.label ?? categoryLabelById.get(item.categoryId) ?? '';

      return {
        id: item.id,
        label: item.label,
        level: item.level,
        categoryId: item.categoryId,
        categoryLabel,
        type: item.visibility,
        duration: item.rest ?? 0,
        sets: parseSeriesCount(item.series),
        reps: item.repetitions,
        rest: item.rest != null ? `${item.rest}s` : '-',
        muscles,
        tags,
        equipment,
      };
    });
  }, [categoryLabelById, collator, exerciseItems]);

  const exerciseMap = React.useMemo(
    () => new Map(exerciseLibrary.map((exercise) => [exercise.id, exercise])),
    [exerciseLibrary],
  );

  const exerciseTypeOptions = React.useMemo<ExerciseTypeOption[]>(
    () => [
      { value: 'all', label: builderCopy.library.secondary_filter_all },
      {
        value: 'PRIVATE',
        label:
          builderCopy.library.type_private ??
          t('programs-coatch.builder.library.type_private', {
            defaultValue: 'Private',
          }),
      },
      {
        value: 'PUBLIC',
        label:
          builderCopy.library.type_public ??
          t('programs-coatch.builder.library.type_public', {
            defaultValue: 'Public',
          }),
      },
    ],
    [
      builderCopy.library.secondary_filter_all,
      builderCopy.library.type_private,
      builderCopy.library.type_public,
      t,
    ],
  );

  const limitHint = React.useMemo(
    () =>
      builderCopy.library.limit_hint ??
      t('programs-coatch.builder.library.limit_hint', {
        defaultValue: 'Showing up to 10 exercises sorted alphabetically.',
      }),
    [builderCopy.library.limit_hint, t],
  );

  const emptyExercisesMessage = React.useMemo(
    () =>
      builderCopy.library.empty_state ??
      t('programs-coatch.builder.library.empty_state', {
        defaultValue: 'No exercises match your filters.',
      }),
    [builderCopy.library.empty_state, t],
  );

  const filteredExercises = React.useMemo(() => {
    if (exerciseCategory === 'all') {
      return exerciseLibrary;
    }
    return exerciseLibrary.filter((exercise) => exercise.categoryId === exerciseCategory);
  }, [exerciseCategory, exerciseLibrary]);

  const summaryText = React.useMemo(
    () => t('programs-coatch.builder.structure.summary', { count: sessions.length }),
    [sessions.length, t],
  );

  const sessionDropZoneLabel = React.useMemo(
    () =>
      t('programs-coatch.builder.structure.drop_zone', {
        defaultValue: 'Drop session here',
      }),
    [t],
  );

  const exerciseDropZoneLabel = React.useMemo(
    () =>
      builderCopy.structure.exercise_drop_zone ??
      t('programs-coatch.builder.structure.exercise_drop_zone', {
        defaultValue: 'Drop exercise here',
      }),
    [builderCopy.structure.exercise_drop_zone, t],
  );

  const idCountersRef = React.useRef<{ session: number; exercise: number }>({
    session: 0,
    exercise: 0,
  });

  React.useEffect(() => {
    if (!selectedAthlete && form.athlete) {
      const found = users.find((user) => user.id === form.athlete);
      if (found) {
        setSelectedAthlete(found);
      }
    }
  }, [users, selectedAthlete, form.athlete]);

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
            customLabel: undefined,
          } satisfies ProgramExercise;
        })
        .filter((exercise): exercise is ProgramExercise => Boolean(exercise));

      return {
        id: nextId('session'),
        sessionId: template.id,
        label: template.label,
        duration: template.duration,
        tags: template.tags,
        exercises,
      } satisfies ProgramSession;
    },
    [exerciseMap, nextId],
  );

  const createEmptySession = React.useCallback((): ProgramSession => {
    const id = nextId('session');
    logWithTimestamp('log', '[ProgramBuilder][createEmptySession] generating new draft session', { id });
    return {
      id,
      sessionId: id,
      label: builderCopy.structure.custom_session_label,
      duration: 0,
      tags: [],
      exercises: [],
    };
  }, [builderCopy.structure.custom_session_label, nextId]);

  const handleSelectAthlete = React.useCallback((_event: unknown, value: User | null) => {
    setSelectedAthlete(value);
    setForm((prev) => ({ ...prev, athlete: value?.id ?? '' }));
  }, []);

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
      logWithTimestamp('log', '[ProgramBuilder][handleAddSessionFromTemplate] request', {
        templateId,
        position,
      });
      const template = sessionTemplates.find((item) => item.id === templateId);
      if (!template) {
        logWithTimestamp('warn', '[ProgramBuilder][handleAddSessionFromTemplate] template not found', {
          templateId,
          available: sessionTemplates.map((item) => item.id),
        });
        return;
      }

      logWithTimestamp('log', '[ProgramBuilder][handleAddSessionFromTemplate] template resolved', {
        templateId,
        templateLabel: template.label,
        position,
      });
      const session = createSessionFromTemplate(template);
      setSessions((prev) => {
        const insertAt =
          position != null ? Math.min(Math.max(position, 0), prev.length) : prev.length;
        logWithTimestamp('log', '[ProgramBuilder][handleAddSessionFromTemplate] inserting session', {
          insertAt,
          previousLength: prev.length,
          sessionId: session.id,
        });
        const next = [...prev];
        next.splice(insertAt, 0, session);
        return next;
      });
    },
    [createSessionFromTemplate, sessionTemplates],
  );

  const handleCreateEmptySession = React.useCallback(() => {
    const emptySession = createEmptySession();
    logWithTimestamp('log', '[ProgramBuilder][handleCreateEmptySession] appending empty session', {
      sessionId: emptySession.id,
    });
    setSessions((prev) => {
      logWithTimestamp('log', '[ProgramBuilder][handleCreateEmptySession] previous length', prev.length);
      return [...prev, emptySession];
    });
  }, [createEmptySession]);

  const handleAddExerciseToSession = React.useCallback(
    (sessionId: string, exerciseId: string, position?: number) => {
      logWithTimestamp('log', '[ProgramBuilder][handleAddExerciseToSession] request', {
        sessionId,
        exerciseId,
        position,
      });
      const exercise = exerciseMap.get(exerciseId);
      if (!exercise) {
        logWithTimestamp('warn', '[ProgramBuilder][handleAddExerciseToSession] exercise not found', {
          exerciseId,
        });
        return;
      }

      setSessions((prev) =>
        prev.map((session) => {
          if (session.id !== sessionId) {
            return session;
          }

          const exercises = [...session.exercises];
          const insertAt =
            position != null ? Math.min(Math.max(position, 0), exercises.length) : exercises.length;
          logWithTimestamp('log', '[ProgramBuilder][handleAddExerciseToSession] inserting exercise', {
            sessionId,
            exerciseId: exercise.id,
            insertAt,
            previousLength: exercises.length,
          });
          exercises.splice(insertAt, 0, {
            id: nextId('exercise'),
            exerciseId: exercise.id,
            sets: exercise.sets,
            reps: exercise.reps,
            rest: exercise.rest,
            customLabel: undefined,
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
    logWithTimestamp('log', '[ProgramBuilder][handleRemoveSession] removing session', { sessionId });
    setSessions((prev) => prev.filter((session) => session.id !== sessionId));
  }, []);

  const handleRemoveExercise = React.useCallback((sessionId: string, exerciseId: string) => {
    logWithTimestamp('log', '[ProgramBuilder][handleRemoveExercise] removing exercise', {
      sessionId,
      exerciseId,
    });
    setSessions((prev) =>
      prev.map((session) => {
        if (session.id !== sessionId) {
          return session;
        }
        return {
          ...session,
          exercises: session.exercises.filter((exercise) => exercise.id !== exerciseId),
        };
      }),
    );
  }, []);

  const handleSessionLabelChange = React.useCallback((sessionId: string, label: string) => {
    logWithTimestamp('log', '[ProgramBuilder][handleSessionLabelChange] update label', {
      sessionId,
      label,
    });
    setSessions((prev) =>
      prev.map((session) => (session.id === sessionId ? { ...session, label } : session)),
    );
  }, []);

  const handleExerciseLabelChange = React.useCallback(
    (sessionId: string, exerciseId: string, label: string) => {
      logWithTimestamp('log', '[ProgramBuilder][handleExerciseLabelChange] update label', {
        sessionId,
        exerciseId,
        label,
      });
      setSessions((prev) =>
        prev.map((session) => {
          if (session.id !== sessionId) {
            return session;
          }

          const exercises = session.exercises.map((exercise) =>
            exercise.id === exerciseId
              ? { ...exercise, customLabel: label || undefined }
              : exercise,
          );
          return { ...session, exercises };
        }),
      );
    },
    [],
  );

  const handleSessionDragStartFromLibrary = React.useCallback(() => {
    logWithTimestamp('log', '[ProgramBuilder][SessionDrag] start from library');
    setIsDraggingSession(true);
    setSessionDragOrigin('library');
  }, []);

  const handleSessionDragStartFromDraft = React.useCallback(() => {
    logWithTimestamp('log', '[ProgramBuilder][SessionDrag] start from draft');
    setIsDraggingSession(true);
    setSessionDragOrigin('draft');
  }, []);

  const handleSessionDragEnd = React.useCallback(() => {
    logWithTimestamp('log', '[ProgramBuilder][SessionDrag] end');
    setIsDraggingSession(false);
    setSessionDragOrigin(null);
  }, []);

  const handleExerciseDragStartFromLibrary = React.useCallback(() => {
    logWithTimestamp('log', '[ProgramBuilder][ExerciseDrag] start from library');
    setIsDraggingExercise(true);
    setExerciseDragOrigin('library');
  }, []);

  const handleExerciseDragStartFromSession = React.useCallback(() => {
    logWithTimestamp('log', '[ProgramBuilder][ExerciseDrag] start from session');
    setIsDraggingExercise(true);
    setExerciseDragOrigin('draft');
  }, []);

  const handleExerciseDragEnd = React.useCallback(() => {
    logWithTimestamp('log', '[ProgramBuilder][ExerciseDrag] end');
    setIsDraggingExercise(false);
    setExerciseDragOrigin(null);
  }, []);

  const handleSessionDrop = React.useCallback(
    (position: number, event: React.DragEvent<HTMLDivElement>) => {
      logWithTimestamp('log', '[ProgramBuilder][handleSessionDrop] received drop', {
        position,
        dataTypes: Array.from(event.dataTransfer.types ?? []),
      });
      const payload = parseDragData(event);
      if (!payload) {
        logWithTimestamp('warn', '[ProgramBuilder][handleSessionDrop] missing payload');
        return;
      }

      logWithTimestamp('log', '[ProgramBuilder][handleSessionDrop] payload', payload);
      if (payload.type === 'session') {
        handleAddSessionFromTemplate(payload.id, position);
      } else if (payload.type === 'session-move') {
        setSessions((prev) => {
          const currentIndex = prev.findIndex((session) => session.id === payload.id);
          if (currentIndex === -1) {
            logWithTimestamp('warn', '[ProgramBuilder][handleSessionDrop] session to move not found', payload);
            return prev;
          }

          const next = [...prev];
          const [dragged] = next.splice(currentIndex, 1);
          let insertAt = position;
          if (currentIndex < position) {
            insertAt -= 1;
          }
          insertAt = Math.max(0, Math.min(insertAt, next.length));
          logWithTimestamp('log', '[ProgramBuilder][handleSessionDrop] reordering session', {
            fromIndex: currentIndex,
            toIndex: insertAt,
            sessionId: dragged.id,
          });
          next.splice(insertAt, 0, dragged);
          return next;
        });
      }

      handleSessionDragEnd();
    },
    [handleAddSessionFromTemplate, handleSessionDragEnd],
  );

  const handleExerciseDrop = React.useCallback(
    (sessionId: string, position: number, event: React.DragEvent<HTMLDivElement>) => {
      logWithTimestamp('log', '[ProgramBuilder][handleExerciseDrop] received drop', {
        sessionId,
        position,
        dataTypes: Array.from(event.dataTransfer.types ?? []),
      });
      const payload = parseDragData(event);
      if (!payload) {
        logWithTimestamp('warn', '[ProgramBuilder][handleExerciseDrop] missing payload');
        return;
      }

      logWithTimestamp('log', '[ProgramBuilder][handleExerciseDrop] payload', payload);
      if (payload.type === 'exercise') {
        handleAddExerciseToSession(sessionId, payload.id, position);
      } else if (payload.type === 'exercise-move') {
        setSessions((prev) => {
          const sourceSessionIndex = prev.findIndex((session) => session.id === payload.sessionId);
          if (sourceSessionIndex === -1) {
            logWithTimestamp('warn', '[ProgramBuilder][handleExerciseDrop] source session not found', payload);
            return prev;
          }

          const sourceSession = prev[sourceSessionIndex];
          const sourceExerciseIndex = sourceSession.exercises.findIndex(
            (exercise) => exercise.id === payload.id,
          );
          if (sourceExerciseIndex === -1) {
            logWithTimestamp('warn', '[ProgramBuilder][handleExerciseDrop] exercise not found in source', payload);
            return prev;
          }

          const draggedExercise = sourceSession.exercises[sourceExerciseIndex];
          const withoutSource = prev.map((session) => {
            if (session.id !== payload.sessionId) {
              return session;
            }
            const exercises = [...session.exercises];
            exercises.splice(sourceExerciseIndex, 1);
            logWithTimestamp('log', '[ProgramBuilder][handleExerciseDrop] removed from source session', {
              sessionId: session.id,
              exerciseId: draggedExercise.id,
              remaining: exercises.length,
            });
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
            if (payload.sessionId === sessionId && sourceExerciseIndex < position) {
              insertAt -= 1;
            }
            insertAt = Math.max(0, Math.min(insertAt, exercises.length));
            logWithTimestamp('log', '[ProgramBuilder][handleExerciseDrop] inserting exercise', {
              sessionId: session.id,
              exerciseId: draggedExercise.id,
              insertAt,
              lengthBefore: exercises.length,
            });
            exercises.splice(insertAt, 0, draggedExercise);
            return {
              ...session,
              exercises,
            };
          });
        });
      }

      handleExerciseDragEnd();
    },
    [handleAddExerciseToSession, handleExerciseDragEnd],
  );

  const handleExerciseDropAtPosition = React.useCallback(
    (sessionId: string, position: number, event: React.DragEvent<HTMLDivElement>) => {
      logWithTimestamp('log', '[ProgramBuilder][handleExerciseDropAtPosition] triggered', {
        sessionId,
        position,
      });
      handleExerciseDrop(sessionId, position, event);
    },
    [handleExerciseDrop],
  );

  const handleSessionDropAtPosition = React.useCallback(
    (position: number, event: React.DragEvent<HTMLDivElement>) => {
      logWithTimestamp('log', '[ProgramBuilder][handleSessionDropAtPosition] triggered', { position });
      handleSessionDrop(position, event);
    },
    [handleSessionDrop],
  );

  const resetBuilder = React.useCallback(() => {
    setSelectedAthlete(null);
    setUsersQ('');
    setSessionSearch('');
    setExerciseSearch('');
    setExerciseCategory('all');
    setExerciseType('all');
    setSessions([]);
    setForm(INITIAL_FORM_STATE);
    idCountersRef.current = { session: 0, exercise: 0 };
  }, []);

  const handleSubmit = React.useCallback(async () => {
    const name = form.programName?.trim();
    const duration = Number.parseInt(form.duration, 10);
    const frequency = Number.parseInt(form.frequency, 10);

    if (!name || !duration || !frequency) {
      flash.error('Please fill required fields');
      return;
    }

    try {
      const sessionSnapshots = sessions.map((session) => ({
        id: session.id,
        templateSessionId: session.sessionId,
        label: session.label,
        durationMin: session.duration,
        description: undefined,
        exercises: session.exercises
          .map((exercise) => {
            const base = exerciseMap.get(exercise.exerciseId);
            if (!base) {
              return null;
            }
            return {
              id: exercise.id,
              templateExerciseId: exercise.exerciseId,
              label: exercise.customLabel ?? base.label,
              series: String(exercise.sets),
              repetitions: exercise.reps,
              restSeconds: parseRestSecondsValue(exercise.rest),
              description: undefined,
              instructions: undefined,
              charge: undefined,
              videoUrl: undefined,
              level: base.level,
            };
          })
          .filter((exercise): exercise is NonNullable<typeof exercise> => Boolean(exercise)),
      }));

      await createProgram({
        slug: slugify(name, String(Date.now()).slice(-5)),
        locale: i18n.language,
        label: name,
        duration,
        frequency,
        description: form.description || '',
        sessionIds: sessions.map((session) => session.sessionId),
        sessions: sessionSnapshots,
        userId: form.athlete || null,
      });

      resetBuilder();
      onCancel();
    } catch (error) {
      flash.error(t('common.unexpected_error'));
    }
  }, [
    createProgram,
    exerciseMap,
    flash,
    form.description,
    form.frequency,
    form.programName,
    form.duration,
    form.athlete,
    i18n.language,
    onCancel,
    resetBuilder,
    sessions,
    t,
  ]);

  React.useEffect(() => {
    logWithTimestamp('log', '[ProgramBuilder][state] sessions updated', sessions);
  }, [sessions]);

  React.useEffect(() => {
    logWithTimestamp('log', '[ProgramBuilder][state] session drag status', {
      isDraggingSession,
      sessionDragOrigin,
    });
  }, [isDraggingSession, sessionDragOrigin]);

  React.useEffect(() => {
    logWithTimestamp('log', '[ProgramBuilder][state] exercise drag status', {
      isDraggingExercise,
      exerciseDragOrigin,
    });
  }, [isDraggingExercise, exerciseDragOrigin]);

  return {
    form,
    sessions,
    selectedAthlete,
    users,
    sessionSearch,
    exerciseSearch,
    exerciseCategory,
    exerciseType,
    sessionTemplates,
    filteredExercises,
    exerciseCategoryOptions,
    exerciseTypeOptions,
    exerciseMap,
    limitHint,
    emptyExercisesMessage,
    summaryText,
    sessionDropZoneLabel,
    exerciseDropZoneLabel,
    sessionsLoading,
    exercisesLoading,
    categoriesLoading,
    usersLoading,
    isDraggingSession,
    isDraggingExercise,
    sessionDragOrigin,
    exerciseDragOrigin,
    setSessionSearch,
    setExerciseSearch,
    setExerciseCategory,
    setExerciseType,
    setUsersQ,
    handleSelectAthlete,
    handleFormChange,
    handleAddSessionFromTemplate,
    handleCreateEmptySession,
    handleRemoveSession,
    handleRemoveExercise,
    handleSessionLabelChange,
    handleExerciseLabelChange,
    handleExerciseDropAtPosition,
    handleSessionDropAtPosition,
    handleSessionDragStartFromLibrary,
    handleSessionDragStartFromDraft,
    handleSessionDragEnd,
    handleExerciseDragStartFromLibrary,
    handleExerciseDragStartFromSession,
    handleExerciseDragEnd,
    handleSubmit,
    userLabel,
  };
}
