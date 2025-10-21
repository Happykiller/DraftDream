import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { useSessions } from '@hooks/useSessions';
import {
  useExercises,
  type Exercise,
  type ExerciseVisibility,
} from '@hooks/useExercises';
import { useCategories } from '@hooks/useCategories';
import { useUsers, type User } from '@src/hooks/useUsers';
import { usePrograms } from '@src/hooks/usePrograms';
import { useFlashStore } from '@src/hooks/useFlashStore';
import { useDebouncedValue } from '@src/hooks/useDebouncedValue';
import { slugify } from '@src/utils/slugify';
import { session } from '@stores/session';

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
  parseRestSecondsValue,
  parseSeriesCount,
} from '@src/components/programs/programBuilderUtils';

import type { ProgramExercise } from '@src/components/programs/programBuilderTypes';

const INITIAL_FORM_STATE: ProgramForm = {
  athlete: '',
  programName: '',
  duration: '',
  frequency: '',
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
  sessionLimitHint: string;
  emptyExercisesMessage: string;
  summaryText: string;
  sessionsLoading: boolean;
  exercisesLoading: boolean;
  categoriesLoading: boolean;
  usersLoading: boolean;
  setSessionSearch: React.Dispatch<React.SetStateAction<string>>;
  setExerciseSearch: React.Dispatch<React.SetStateAction<string>>;
  setExerciseCategory: React.Dispatch<React.SetStateAction<string>>;
  setExerciseType: React.Dispatch<React.SetStateAction<'all' | ExerciseVisibility>>;
  setUsersQ: React.Dispatch<React.SetStateAction<string>>;
  handleSelectAthlete: (_event: unknown, value: User | null) => void;
  handleFormChange: (
    field: keyof ProgramForm,
  ) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  updateProgramName: (value: string) => void;
  updateProgramDescription: (value: string) => void;
  handleAddSessionFromTemplate: (templateId: string, position?: number) => void;
  handleCreateEmptySession: () => void;
  handleRemoveSession: (sessionId: string) => void;
  handleRemoveExercise: (sessionId: string, exerciseId: string) => void;
  handleSessionLabelChange: (sessionId: string, label: string) => void;
  handleSessionDescriptionChange: (sessionId: string, description: string) => void;
  handleSessionDurationChange: (sessionId: string, duration: number) => void;
  handleExerciseLabelChange: (
    sessionId: string,
    exerciseId: string,
    label: string,
  ) => void;
  handleExerciseDescriptionChange: (
    sessionId: string,
    exerciseId: string,
    description: string,
  ) => void;
  handleAddExerciseToSession: (sessionId: string, exerciseId: string, position?: number) => void;
  handleMoveSessionUp: (sessionId: string) => void;
  handleMoveSessionDown: (sessionId: string) => void;
  handleMoveExerciseUp: (sessionId: string, exerciseId: string) => void;
  handleMoveExerciseDown: (sessionId: string, exerciseId: string) => void;
  handleSubmit: (event?: React.SyntheticEvent) => Promise<void>;
  userLabel: (user: User | null) => string;
  isSubmitDisabled: boolean;
  createExercise: ReturnType<typeof useExercises>['create'];
  updateExercise: ReturnType<typeof useExercises>['update'];
  registerExercise: (exercise: Exercise) => void;
  getRawExerciseById: (exerciseId: string) => Exercise | undefined;
};

/**
 * Centralises Program Builder state management and command handlers.
 * The hook removes imperative logic from the presentation component, improving readability and reusability.
 */
export function useProgramBuilder(
  builderCopy: BuilderCopy,
  onCancel: () => void,
  onCreated: () => void,
): UseProgramBuilderResult {
  const { t, i18n } = useTranslation();
  const flashError = useFlashStore((state) => state.error);

  const [usersQ, setUsersQ] = React.useState('');
  const [selectedAthlete, setSelectedAthlete] = React.useState<User | null>(null);
  const [sessionSearch, setSessionSearch] = React.useState('');
  const [exerciseSearch, setExerciseSearch] = React.useState('');
  const [exerciseCategory, setExerciseCategory] = React.useState('all');
  const [exerciseType, setExerciseType] = React.useState<'all' | ExerciseVisibility>('all');
  const [sessions, setSessions] = React.useState<ProgramSession[]>([]);
  const [form, setForm] = React.useState<ProgramForm>(() => ({
    ...INITIAL_FORM_STATE,
    programName: builderCopy.structure.title,
  }));
  const [programDescription, setProgramDescription] = React.useState(
    builderCopy.structure.header_description,
  );
  const [currentUserId, setCurrentUserId] = React.useState<string | null>(
    () => session.getState().id,
  );

  React.useEffect(() => {
    const unsubscribe = session.subscribe((state) => {
      setCurrentUserId(state.id);
    });
    return unsubscribe;
  }, []);

  React.useEffect(() => {
    setProgramDescription(builderCopy.structure.header_description);
  }, [builderCopy.structure.header_description]);

  const trimmedProgramName = React.useMemo(() => form.programName.trim(), [form.programName]);
  const parsedDuration = React.useMemo<number | null>(() => {
    const value = Number.parseInt(form.duration, 10);
    return Number.isNaN(value) || value <= 0 ? null : value;
  }, [form.duration]);
  const parsedFrequency = React.useMemo<number | null>(() => {
    const value = Number.parseInt(form.frequency, 10);
    return Number.isNaN(value) || value <= 0 ? null : value;
  }, [form.frequency]);
  const isSubmitDisabled = React.useMemo(
    () => !trimmedProgramName || parsedDuration === null || parsedFrequency === null,
    [parsedDuration, parsedFrequency, trimmedProgramName],
  );

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

  const {
    items: exerciseItems,
    loading: exercisesLoading,
    create: createExercise,
    update: updateExercise,
  } = useExercises({
    page: 1,
    limit: 10,
    q: debouncedExerciseSearch,
    visibility: exerciseVisibilityFilter,
    categoryId: exerciseCategoryFilter,
    locale: i18n.language,
  });

  const [exerciseOverrides, setExerciseOverrides] = React.useState<
    Map<string, Exercise>
  >(() => new Map());

  const registerExercise = React.useCallback((exercise: Exercise) => {
    setExerciseOverrides((prev) => {
      const next = new Map(prev);
      next.set(exercise.id, exercise);
      return next;
    });
  }, []);

  React.useEffect(() => {
    setExerciseOverrides((prev) => {
      if (prev.size === 0) {
        return prev;
      }
      let changed = false;
      const next = new Map(prev);
      for (const item of exerciseItems) {
        if (next.delete(item.id)) {
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [exerciseItems]);

  const combinedExercises = React.useMemo(() => {
    const merged = new Map<string, Exercise>();
    exerciseItems.forEach((item) => {
      merged.set(item.id, item);
    });
    exerciseOverrides.forEach((item) => {
      merged.set(item.id, item);
    });
    return Array.from(merged.values());
  }, [exerciseItems, exerciseOverrides]);

  const rawExerciseMap = React.useMemo(
    () => new Map(combinedExercises.map((exercise) => [exercise.id, exercise])),
    [combinedExercises],
  );

  const getRawExerciseById = React.useCallback(
    (exerciseId: string) => rawExerciseMap.get(exerciseId),
    [rawExerciseMap],
  );

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
      description: item.description ?? '',
      tags: [],
      exercises: item.exerciseIds.map((exerciseId, index) => {
        const summary = item.exercises?.[index] ?? item.exercises?.find((exercise) => exercise.id === exerciseId);
        return {
          exerciseId,
          label: summary?.label ?? exerciseId,
        };
      }),
    }));
  }, [sessionItems]);

  const exerciseCategoryOptions = React.useMemo<ExerciseCategoryOption[]>(() => {
    const dedup = new Map<string, ExerciseCategoryOption>();
    for (const item of categoryItems) {
      if (item.locale && item.locale !== i18n.language) {
        continue;
      }
      const label = item.label || item.slug || item.locale;
      if (!label) continue;
      dedup.set(item.id, { id: item.id, label });
    }
    return Array.from(dedup.values()).sort((a, b) => collator.compare(a.label, b.label));
  }, [categoryItems, collator, i18n.language]);

  const categoryLabelById = React.useMemo(
    () => new Map(exerciseCategoryOptions.map((option) => [option.id, option.label])),
    [exerciseCategoryOptions],
  );

  const exerciseLibrary = React.useMemo<ExerciseLibraryItem[]>(() => {
    const sorted = [...combinedExercises].sort((a, b) => collator.compare(a.label, b.label));
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
        visibility: item.visibility,
        canEdit:
          item.visibility === 'PRIVATE' &&
          Boolean(currentUserId) &&
          item.createdBy === currentUserId,
        duration: item.rest ?? 0,
        sets: parseSeriesCount(item.series),
        reps: item.repetitions,
        rest: item.rest != null ? `${item.rest}s` : '-',
        description: item.description ?? undefined,
        muscles,
        tags,
        equipment,
      };
    });
  }, [categoryLabelById, collator, combinedExercises, currentUserId]);

  const exerciseMapRef = React.useRef(new Map<string, ExerciseLibraryItem>());

  const exerciseMap = React.useMemo(() => {
    const merged = new Map(exerciseMapRef.current);
    exerciseLibrary.forEach((exercise) => {
      merged.set(exercise.id, exercise);
    });
    exerciseMapRef.current = merged;
    return merged;
  }, [exerciseLibrary]);

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

  const sessionLimitHint = React.useMemo(
    () =>
      builderCopy.templates_limit_hint ??
      t('programs-coatch.builder.templates_limit_hint', {
        defaultValue: 'Showing up to 10 sessions sorted alphabetically.',
      }),
    [builderCopy.templates_limit_hint, t],
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

          const programExercise: ProgramExercise = {
            id: nextId('exercise'),
            exerciseId: base.id,
            sets: exerciseRef.sets ?? base.sets,
            reps: exerciseRef.reps ?? base.reps,
            rest: exerciseRef.rest ?? base.rest,
            customLabel: undefined,
            customDescription: undefined,
          };
          return programExercise;
        })
        .filter((exercise): exercise is ProgramExercise => exercise !== null);

      return {
        id: nextId('session'),
        sessionId: template.id,
        label: template.label,
        duration: template.duration,
        description: template.description,
        tags: template.tags,
        exercises,
      } satisfies ProgramSession;
    },
    [exerciseMap, nextId],
  );

  const createEmptySession = React.useCallback((): ProgramSession => {
    const id = nextId('session');
    return {
      id,
      sessionId: id,
      label: builderCopy.structure.custom_session_label,
      duration: 0,
      description: '',
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

  const updateProgramName = React.useCallback((value: string) => {
    setForm((prev) => ({ ...prev, programName: value }));
  }, []);

  const updateProgramDescription = React.useCallback((value: string) => {
    setProgramDescription(value);
  }, []);

  const handleAddSessionFromTemplate = React.useCallback(
    (templateId: string, position?: number) => {
      const template = sessionTemplates.find((item) => item.id === templateId);
      if (!template) {
        return;
      }

      const session = createSessionFromTemplate(template);
      setSessions((prev) => {
        const insertAt =
          position != null ? Math.min(Math.max(position, 0), prev.length) : prev.length;
        const next = [...prev];
        next.splice(insertAt, 0, session);
        return next;
      });
    },
    [createSessionFromTemplate, sessionTemplates],
  );

  const handleCreateEmptySession = React.useCallback(() => {
    const emptySession = createEmptySession();
    setSessions((prev) => {
      return [...prev, emptySession];
    });
  }, [createEmptySession]);

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
            position != null ? Math.min(Math.max(position, 0), exercises.length) : exercises.length;
          const programExercise: ProgramExercise = {
            id: nextId('exercise'),
            exerciseId: exercise.id,
            sets: exercise.sets,
            reps: exercise.reps,
            rest: exercise.rest,
            customLabel: undefined,
            customDescription: undefined,
          };
          exercises.splice(insertAt, 0, programExercise);

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

  const handleRemoveExercise = React.useCallback((sessionId: string, exerciseId: string) => {
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
    setSessions((prev) =>
      prev.map((session) => (session.id === sessionId ? { ...session, label } : session)),
    );
  }, []);

  const handleSessionDescriptionChange = React.useCallback(
    (sessionId: string, description: string) => {
      setSessions((prev) =>
        prev.map((session) => (session.id === sessionId ? { ...session, description } : session)),
      );
    },
  []);

  const handleSessionDurationChange = React.useCallback(
    (sessionId: string, duration: number) => {
      setSessions((prev) =>
        prev.map((session) => (session.id === sessionId ? { ...session, duration } : session)),
      );
    },
  []);

  const handleExerciseLabelChange = React.useCallback(
    (sessionId: string, exerciseId: string, label: string) => {
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

  const handleExerciseDescriptionChange = React.useCallback(
    (sessionId: string, exerciseId: string, description: string) => {
      setSessions((prev) =>
        prev.map((session) => {
          if (session.id !== sessionId) {
            return session;
          }

          const exercises = session.exercises.map((exercise) =>
            exercise.id === exerciseId
              ? {
                  ...exercise,
                  customDescription: description.trim() ? description.trim() : undefined,
                }
              : exercise,
          );

          return { ...session, exercises };
        }),
      );
    },
    [],
  );

  const handleMoveSessionUp = React.useCallback((sessionId: string) => {
    setSessions((prev) => {
      const index = prev.findIndex((session) => session.id === sessionId);
      if (index <= 0) {
        return prev;
      }
      const next = [...prev];
      const [current] = next.splice(index, 1);
      next.splice(index - 1, 0, current);
      return next;
    });
  }, []);

  const handleMoveSessionDown = React.useCallback((sessionId: string) => {
    setSessions((prev) => {
      const index = prev.findIndex((session) => session.id === sessionId);
      if (index === -1 || index >= prev.length - 1) {
        return prev;
      }
      const next = [...prev];
      const [current] = next.splice(index, 1);
      next.splice(index + 1, 0, current);
      return next;
    });
  }, []);

  const handleMoveExerciseUp = React.useCallback((sessionId: string, exerciseId: string) => {
    setSessions((prev) =>
      prev.map((session) => {
        if (session.id !== sessionId) {
          return session;
        }

        const index = session.exercises.findIndex((exercise) => exercise.id === exerciseId);
        if (index <= 0) {
          return session;
        }

        const exercises = [...session.exercises];
        const [current] = exercises.splice(index, 1);
        exercises.splice(index - 1, 0, current);
        return {
          ...session,
          exercises,
        };
      }),
    );
  }, []);

  const handleMoveExerciseDown = React.useCallback((sessionId: string, exerciseId: string) => {
    setSessions((prev) =>
      prev.map((session) => {
        if (session.id !== sessionId) {
          return session;
        }

        const index = session.exercises.findIndex((exercise) => exercise.id === exerciseId);
        if (index === -1 || index >= session.exercises.length - 1) {
          return session;
        }

        const exercises = [...session.exercises];
        const [current] = exercises.splice(index, 1);
        exercises.splice(index + 1, 0, current);
        return {
          ...session,
          exercises,
        };
      }),
    );
  }, []);

  const resetBuilder = React.useCallback(() => {
    setSelectedAthlete(null);
    setUsersQ('');
    setSessionSearch('');
    setExerciseSearch('');
    setExerciseCategory('all');
    setExerciseType('all');
    setSessions([]);
    setForm({ ...INITIAL_FORM_STATE, programName: builderCopy.structure.title });
    setProgramDescription(builderCopy.structure.header_description);
    idCountersRef.current = { session: 0, exercise: 0 };
    exerciseMapRef.current = new Map();
    setExerciseOverrides(() => new Map());
  }, [
    builderCopy.structure.header_description,
    builderCopy.structure.title,
    setExerciseOverrides,
  ]);

  const handleSubmit = React.useCallback(async (event?: React.SyntheticEvent) => {
    event?.preventDefault();
    event?.stopPropagation();

    const name = trimmedProgramName;
    const duration = parsedDuration;
    const frequency = parsedFrequency;

    if (!name || !duration || !frequency) {
      flashError(
        t('programs-coatch.builder.errors.missing_required_fields', {
          defaultValue: 'Please fill required fields.',
        }),
      );
      return;
    }

    try {
      const sessionSnapshots = sessions.map((session) => ({
        id: session.id,
        templateSessionId: session.sessionId,
        label: session.label,
        durationMin: session.duration,
        description: session.description ? session.description : undefined,
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
              description:
                exercise.customDescription ?? base.description ?? undefined,
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
        description: programDescription.trim() || '',
        sessionIds: sessions.map((session) => session.sessionId),
        sessions: sessionSnapshots,
        userId: form.athlete || null,
      });

      onCreated();
      resetBuilder();
      onCancel();
    } catch (_error: unknown) {
      flashError(t('common.unexpected_error'));
    }
  }, [
    createProgram,
    exerciseMap,
    flashError,
    parsedDuration,
    parsedFrequency,
    programDescription,
    form.athlete,
    trimmedProgramName,
    i18n.language,
    onCancel,
    onCreated,
    resetBuilder,
    sessions,
    t,
  ]);

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
    sessionLimitHint,
    emptyExercisesMessage,
    summaryText,
    sessionsLoading,
    exercisesLoading,
    categoriesLoading,
    usersLoading,
    setSessionSearch,
    setExerciseSearch,
    setExerciseCategory,
    setExerciseType,
    setUsersQ,
    handleSelectAthlete,
    handleFormChange,
    updateProgramName,
    updateProgramDescription,
    handleAddSessionFromTemplate,
    handleCreateEmptySession,
    handleRemoveSession,
    handleRemoveExercise,
    handleSessionLabelChange,
    handleSessionDescriptionChange,
    handleSessionDurationChange,
    handleExerciseLabelChange,
    handleExerciseDescriptionChange,
    handleAddExerciseToSession,
    handleMoveSessionUp,
    handleMoveSessionDown,
    handleMoveExerciseUp,
    handleMoveExerciseDown,
    handleSubmit,
    userLabel,
    isSubmitDisabled,
    createExercise,
    updateExercise,
    registerExercise,
    getRawExerciseById,
  };
}
