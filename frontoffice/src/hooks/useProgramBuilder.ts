import * as React from 'react';
import { useTranslation } from 'react-i18next';

import { ExerciseLevel as ExerciseLevelEnum, UserType } from '@src/commons/enums';
import { useSessions } from '@hooks/useSessions';
import {
  useExercises,
  type Exercise,
  type ExerciseLevel,
  type ExerciseVisibility,
} from '@hooks/useExercises';
import { useCategories } from '@hooks/useCategories';
import { useUsers, type User } from '@src/hooks/useUsers';
import {
  usePrograms,
  type Program,
  type ProgramSessionExercise as ProgramSnapshotExercise,
} from '@src/hooks/usePrograms';
import { useFlashStore } from '@src/hooks/useFlashStore';
import { useDebouncedValue } from '@src/hooks/useDebouncedValue';
import { slugify } from '@src/utils/slugify';
import { session } from '@stores/session';

import type {
  BuilderCopy,
  ExerciseCategoryOption,
  ExerciseLibraryItem,
  ExerciseTypeOption,
  ProgramExercise,
  ProgramExercisePatch,
  ProgramForm,
  ProgramSession,
  SessionTemplate,
} from '@src/components/programs/programBuilderTypes';
import {
  parseRestSecondsValue,
  parseSeriesCount,
} from '@src/components/programs/programBuilderUtils';

const INITIAL_FORM_STATE: ProgramForm = {
  athlete: '',
  programName: '',
  duration: '',
  frequency: '',
};

function hasNonEmptyText(value?: string | null): boolean {
  return Boolean(value && value.trim().length > 0);
}

function hasAnyLabeledItems(
  items?: ReadonlyArray<{ id?: string | null; label?: string | null }> | null,
): boolean {
  if (!items?.length) {
    return false;
  }

  return items.some((item) => Boolean(item?.label && item.label.trim().length > 0));
}

/**
 * Determines whether a program exercise snapshot lacks metadata and should be hydrated.
 */
function shouldHydrateExerciseDetails(exercise: ProgramSnapshotExercise): boolean {
  if (!hasNonEmptyText(exercise.label)) {
    return true;
  }

  const hasMetadata =
    hasNonEmptyText(exercise.description) ||
    hasNonEmptyText(exercise.instructions) ||
    hasNonEmptyText(exercise.series) ||
    hasNonEmptyText(exercise.repetitions) ||
    hasNonEmptyText(exercise.charge) ||
    hasNonEmptyText(exercise.videoUrl) ||
    exercise.restSeconds != null ||
    hasAnyLabeledItems(exercise.categories) ||
    hasAnyLabeledItems(exercise.muscles) ||
    hasAnyLabeledItems(exercise.equipments) ||
    hasAnyLabeledItems(exercise.tags);

  return !hasMetadata;
}

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
  handleUpdateProgramExercise: (
    sessionId: string,
    exerciseId: string,
    patch: ProgramExercisePatch,
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
  deleteExercise: (exerciseId: string) => Promise<void>;
  registerExercise: (exercise: Exercise) => void;
  getRawExerciseById: (exerciseId: string) => Exercise | undefined;
  mode: 'create' | 'edit';
};

/**
 * Centralises Program Builder state management and command handlers.
 * The hook removes imperative logic from the presentation component, improving readability and reusability.
 */
export function useProgramBuilder(
  builderCopy: BuilderCopy,
  onCancel: () => void,
  options?: {
    onCreated?: () => void;
    onUpdated?: () => void;
    program?: Program;
  },
): UseProgramBuilderResult {
  const { t, i18n } = useTranslation();
  const flashError = useFlashStore((state) => state.error);
  const onCreated = options?.onCreated;
  const onUpdated = options?.onUpdated;
  const program = options?.program;
  const mode: 'create' | 'edit' = program ? 'edit' : 'create';

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
    if (mode === 'edit') {
      return;
    }
    setProgramDescription(builderCopy.structure.header_description);
  }, [builderCopy.structure.header_description, mode]);

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

  const exerciseCategoryIdsFilter = React.useMemo<string[] | undefined>(() => {
    if (!exerciseCategoryFilter) {
      return undefined;
    }
    return [exerciseCategoryFilter];
  }, [exerciseCategoryFilter]);

  const {
    items: exerciseItems,
    loading: exercisesLoading,
    create: createExercise,
    update: updateExercise,
    remove: removeExercise,
    getById: getExerciseById,
  } = useExercises({
    page: 1,
    limit: 10,
    q: debouncedExerciseSearch,
    visibility: exerciseVisibilityFilter,
    categoryIds: exerciseCategoryIdsFilter,
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

  const deleteExercise = React.useCallback(
    async (exerciseId: string) => {
      await removeExercise(exerciseId);
      setExerciseOverrides((prev) => {
        if (!prev.has(exerciseId)) {
          return prev;
        }
        const next = new Map(prev);
        next.delete(exerciseId);
        return next;
      });
    },
    [removeExercise],
  );

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

  const normalizeExerciseLevel = React.useCallback(
    (level?: string | null): ExerciseLevel => {
      const normalized = (level ?? '').toUpperCase();
      if (normalized === ExerciseLevelEnum.Intermediate) {
        return ExerciseLevelEnum.Intermediate;
      }
      if (normalized === ExerciseLevelEnum.Advanced) {
        return ExerciseLevelEnum.Advanced;
      }
      return ExerciseLevelEnum.Beginner;
    },
    [],
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
    type: UserType.Athlete,
  });

  const { create: createProgram, update: updateProgram } = usePrograms({
    page: 1,
    limit: 50,
    q: '',
  });

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
      for (const muscle of item.muscles ?? []) {
        if (!muscle?.id || seenMuscles.has(muscle.id)) continue;
        muscles.push({
          id: muscle.id,
          label: muscle.label ?? muscle.id,
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

      return {
        id: item.id,
        label: item.label,
        level: item.level,
        categoryIds: Array.from(new Set(item.categoryIds ?? [])),
        categoryLabels: Array.from(new Set((item.categoryIds ?? []).map((categoryId) => {
          const category = item.categories?.find((candidate) => candidate?.id === categoryId);
          const label = category?.label ?? categoryLabelById.get(categoryId) ?? categoryId;
          return label;
        }))),
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
          t('programs-coatch.builder.library.type_private'),
      },
      {
        value: 'PUBLIC',
        label:
          builderCopy.library.type_public ??
          t('programs-coatch.builder.library.type_public'),
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
      t('programs-coatch.builder.library.limit_hint'),
    [builderCopy.library.limit_hint, t],
  );

  const sessionLimitHint = React.useMemo(
    () =>
      builderCopy.templates_limit_hint ??
      t('programs-coatch.builder.templates_limit_hint'),
    [builderCopy.templates_limit_hint, t],
  );

  const emptyExercisesMessage = React.useMemo(
    () =>
      builderCopy.library.empty_state ??
      t('programs-coatch.builder.library.empty_state'),
    [builderCopy.library.empty_state, t],
  );

  const filteredExercises = React.useMemo(() => {
    if (exerciseCategory === 'all') {
      return exerciseLibrary;
    }
    return exerciseLibrary.filter((exercise) => exercise.categoryIds.includes(exerciseCategory));
  }, [exerciseCategory, exerciseLibrary]);

  const summaryText = React.useMemo(
    () => t('programs-coatch.builder.structure.summary', { count: sessions.length }),
    [sessions.length, t],
  );

  const idCountersRef = React.useRef<{ session: number; exercise: number }>({
    session: 0,
    exercise: 0,
  });
  const usedIdsRef = React.useRef<{ session: Set<string>; exercise: Set<string> }>({
    session: new Set(),
    exercise: new Set(),
  });

  React.useEffect(() => {
    if (!selectedAthlete && form.athlete) {
      const found = users.find((user) => user.id === form.athlete);
      if (found) {
        setSelectedAthlete(found);
      }
    }
  }, [users, selectedAthlete, form.athlete]);

  const nextId = React.useCallback(
    (type: 'session' | 'exercise') => {
      const used = usedIdsRef.current[type];
      let counter = idCountersRef.current[type];
      let candidate = '';
      do {
        counter += 1;
        candidate = `${type}-${counter}`;
      } while (used.has(candidate));
      idCountersRef.current[type] = counter;
      used.add(candidate);
      return candidate;
    },
    [],
  );

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

  const composeProgramExercise = React.useCallback(
    (
      builderExerciseId: string,
      exerciseId: string,
      overrides?: Partial<Omit<ProgramExercise, 'id' | 'exerciseId'>>,
    ): ProgramExercise | null => {
      const rawExercise = getRawExerciseById(exerciseId);
      const libraryExercise = exerciseMap.get(exerciseId);
      if (!rawExercise && !libraryExercise) {
        return null;
      }

      const source = rawExercise ?? libraryExercise!;
      const seriesValue =
        'series' in source && typeof source.series === 'string' && source.series.trim()
          ? source.series
          : rawExercise?.series ?? String(libraryExercise?.sets ?? 1);
      const repetitionsValue =
        'repetitions' in source && typeof source.repetitions === 'string'
          ? source.repetitions
          : rawExercise?.repetitions ?? libraryExercise?.reps ?? '';
      const parsedSets = parseSeriesCount(seriesValue);
      const baseSets = Number.isFinite(parsedSets) && parsedSets ? Math.max(1, Math.trunc(parsedSets)) : 1;
      const normalizedRestSeconds =
        'rest' in source && typeof source.rest === 'number'
          ? source.rest ?? null
          : rawExercise?.rest ?? parseRestSecondsValue(libraryExercise?.rest ?? null);
      const restLabel =
        normalizedRestSeconds != null
          ? `${Math.max(0, Math.trunc(normalizedRestSeconds))}s`
          : libraryExercise?.rest ?? '-';
      const normalizedLevel = normalizeExerciseLevel(
        'level' in source ? source.level : libraryExercise?.level,
      );
      const baseCategoryIds = Array.from(
        new Set(
          (
            ('categoryIds' in source ? source.categoryIds : libraryExercise?.categoryIds) ?? []
          ).filter((id): id is string => Boolean(id)),
        ),
      );
      const categoryLabels = baseCategoryIds.map((categoryId) => {
        const rawLabel = rawExercise?.categories?.find((item) => item?.id === categoryId)?.label;
        if (rawLabel) {
          return rawLabel;
        }
        if (libraryExercise) {
          const index = libraryExercise.categoryIds.indexOf(categoryId);
          if (index >= 0 && libraryExercise.categoryLabels[index]) {
            return libraryExercise.categoryLabels[index];
          }
        }
        return categoryLabelById.get(categoryId) ?? categoryId;
      });

      const normalizeLabeledItems = (
        items:
          | ({ id?: string | null; label?: string | null } | null | undefined)[]
          | undefined,
      ) => {
        const dedup = new Map<string, string>();
        for (const item of items ?? []) {
          if (!item?.id) {
            continue;
          }
          const label = (item.label ?? item.id).trim();
          if (!dedup.has(item.id)) {
            dedup.set(item.id, label.length > 0 ? label : item.id);
          }
        }
        return Array.from(dedup.entries()).map(([id, label]) => ({ id, label }));
      };

      const muscles = normalizeLabeledItems(
        'muscles' in source ? source.muscles : libraryExercise?.muscles,
      );
      const muscleIds = muscles.map((item) => item.id);
      const equipment = normalizeLabeledItems(
        'equipment' in source ? source.equipment : libraryExercise?.equipment,
      );
      const equipmentIds = equipment.map((item) => item.id);
      const tags = normalizeLabeledItems('tags' in source ? source.tags : libraryExercise?.tags);
      const tagIds = tags.map((item) => item.id);

      const descriptionValue =
        ('description' in source ? source.description : libraryExercise?.description) ?? '';
      const instructionsValue = ('instructions' in source ? source.instructions : null) ?? '';
      const chargeValue = ('charge' in source ? source.charge : null) ?? '';
      const videoUrlValue = ('videoUrl' in source ? source.videoUrl : null) ?? '';

      const baseExercise: ProgramExercise = {
        id: builderExerciseId,
        exerciseId,
        label: ('label' in source ? source.label : libraryExercise?.label) ?? '',
        description: descriptionValue ?? '',
        instructions: instructionsValue ?? '',
        level: normalizedLevel,
        series: seriesValue ?? '',
        repetitions: repetitionsValue ?? '',
        charge: chargeValue ?? '',
        restSeconds: normalizedRestSeconds ?? null,
        rest: restLabel,
        videoUrl: videoUrlValue ?? '',
        categoryIds: baseCategoryIds,
        categoryLabels,
        muscleIds,
        muscles,
        equipmentIds,
        equipment,
        tagIds,
        tags,
        sets: baseSets,
        reps: repetitionsValue ?? '',
      };

      if (!overrides) {
        return baseExercise;
      }

      const nextExercise: ProgramExercise = { ...baseExercise };

      if (Object.prototype.hasOwnProperty.call(overrides, 'label') && overrides.label !== undefined) {
        nextExercise.label = overrides.label;
      }

      if (
        Object.prototype.hasOwnProperty.call(overrides, 'description') &&
        overrides.description !== undefined
      ) {
        nextExercise.description = overrides.description;
      }

      if (
        Object.prototype.hasOwnProperty.call(overrides, 'instructions') &&
        overrides.instructions !== undefined
      ) {
        nextExercise.instructions = overrides.instructions;
      }

      if (Object.prototype.hasOwnProperty.call(overrides, 'level') && overrides.level) {
        nextExercise.level = overrides.level;
      }

      if (Object.prototype.hasOwnProperty.call(overrides, 'series') && overrides.series !== undefined) {
        nextExercise.series = overrides.series;
        const parsed = parseSeriesCount(overrides.series);
        if (Number.isFinite(parsed) && parsed) {
          nextExercise.sets = Math.max(1, Math.trunc(parsed));
        }
      }

      if (
        Object.prototype.hasOwnProperty.call(overrides, 'repetitions') &&
        overrides.repetitions !== undefined
      ) {
        nextExercise.repetitions = overrides.repetitions;
        nextExercise.reps = overrides.repetitions;
      }

      if (Object.prototype.hasOwnProperty.call(overrides, 'sets') && overrides.sets !== undefined) {
        const parsed = Number.isFinite(overrides.sets)
          ? Math.trunc(Number(overrides.sets))
          : Number.NaN;
        if (!Number.isNaN(parsed) && parsed > 0) {
          nextExercise.sets = parsed;
        }
      }

      if (Object.prototype.hasOwnProperty.call(overrides, 'reps') && overrides.reps !== undefined) {
        nextExercise.reps = overrides.reps;
      }

      if (Object.prototype.hasOwnProperty.call(overrides, 'charge') && overrides.charge !== undefined) {
        nextExercise.charge = overrides.charge;
      }

      if (
        Object.prototype.hasOwnProperty.call(overrides, 'restSeconds') &&
        overrides.restSeconds !== undefined
      ) {
        nextExercise.restSeconds = overrides.restSeconds;
        nextExercise.rest =
          overrides.restSeconds != null && Number.isFinite(overrides.restSeconds)
            ? `${Math.max(0, Math.trunc(overrides.restSeconds))}s`
            : '-';
      }

      if (Object.prototype.hasOwnProperty.call(overrides, 'rest') && overrides.rest !== undefined) {
        nextExercise.rest = overrides.rest;
      }

      if (
        Object.prototype.hasOwnProperty.call(overrides, 'videoUrl') &&
        overrides.videoUrl !== undefined
      ) {
        nextExercise.videoUrl = overrides.videoUrl;
      }

      if (
        Object.prototype.hasOwnProperty.call(overrides, 'categoryIds') &&
        overrides.categoryIds
      ) {
        nextExercise.categoryIds = [...overrides.categoryIds];
      }

      if (
        Object.prototype.hasOwnProperty.call(overrides, 'categoryLabels') &&
        overrides.categoryLabels
      ) {
        nextExercise.categoryLabels = [...overrides.categoryLabels];
      }

      if (
        Object.prototype.hasOwnProperty.call(overrides, 'muscleIds') &&
        overrides.muscleIds
      ) {
        nextExercise.muscleIds = [...overrides.muscleIds];
      }

      if (Object.prototype.hasOwnProperty.call(overrides, 'muscles') && overrides.muscles) {
        nextExercise.muscles = overrides.muscles.map((item) => ({ ...item }));
      }

      if (
        Object.prototype.hasOwnProperty.call(overrides, 'equipmentIds') &&
        overrides.equipmentIds
      ) {
        nextExercise.equipmentIds = [...overrides.equipmentIds];
      }

      if (Object.prototype.hasOwnProperty.call(overrides, 'equipment') && overrides.equipment) {
        nextExercise.equipment = overrides.equipment.map((item) => ({ ...item }));
      }

      if (Object.prototype.hasOwnProperty.call(overrides, 'tagIds') && overrides.tagIds) {
        nextExercise.tagIds = [...overrides.tagIds];
      }

      if (Object.prototype.hasOwnProperty.call(overrides, 'tags') && overrides.tags) {
        nextExercise.tags = overrides.tags.map((item) => ({ ...item }));
      }

      return nextExercise;
    },
    [
      categoryLabelById,
      exerciseMap,
      getRawExerciseById,
      normalizeExerciseLevel,
    ],
  );

  const createSessionFromTemplate = React.useCallback(
    (template: SessionTemplate): ProgramSession => {
      const exercises = template.exercises
        .map((exerciseRef) => {
          const overrides: Partial<Omit<ProgramExercise, 'id' | 'exerciseId'>> = {};

          if (exerciseRef.label && exerciseRef.label.trim()) {
            overrides.label = exerciseRef.label;
          }

          if (exerciseRef.sets != null) {
            overrides.sets = exerciseRef.sets;
            overrides.series = String(exerciseRef.sets);
          }

          if (exerciseRef.reps) {
            overrides.repetitions = exerciseRef.reps;
            overrides.reps = exerciseRef.reps;
          }

          if (exerciseRef.rest != null) {
            overrides.rest = exerciseRef.rest;
            const parsedRest = parseRestSecondsValue(exerciseRef.rest);
            overrides.restSeconds = parsedRest ?? null;
          }

          const programExercise = composeProgramExercise(
            nextId('exercise'),
            exerciseRef.exerciseId,
            overrides,
          );

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
    [composeProgramExercise, nextId],
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
      const builderExerciseId = nextId('exercise');
      const programExercise = composeProgramExercise(builderExerciseId, exerciseId);
      if (!programExercise) {
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
          exercises.splice(insertAt, 0, programExercise);

          return {
            ...session,
            exercises,
          };
        }),
      );
    },
    [composeProgramExercise, nextId],
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

          const trimmed = label.trim();
          const exercises = session.exercises.map((exercise) =>
            exercise.id === exerciseId ? { ...exercise, label: trimmed || exercise.label } : exercise,
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
            exercise.id === exerciseId ? { ...exercise, description } : exercise,
          );

          return { ...session, exercises };
        }),
      );
    },
    [],
  );

  const handleUpdateProgramExercise = React.useCallback(
    (sessionId: string, exerciseId: string, patch: ProgramExercisePatch) => {
      setSessions((prev) =>
        prev.map((session) => {
          if (session.id !== sessionId) {
            return session;
          }

          const exercises = session.exercises.map((exercise) => {
            if (exercise.id !== exerciseId) {
              return exercise;
            }

            const nextExercise: ProgramExercise = { ...exercise };

            if (Object.prototype.hasOwnProperty.call(patch, 'label') && patch.label !== undefined) {
              nextExercise.label = patch.label;
            }

            if (
              Object.prototype.hasOwnProperty.call(patch, 'description') &&
              patch.description !== undefined
            ) {
              nextExercise.description = patch.description;
            }

            if (
              Object.prototype.hasOwnProperty.call(patch, 'instructions') &&
              patch.instructions !== undefined
            ) {
              nextExercise.instructions = patch.instructions;
            }

            if (Object.prototype.hasOwnProperty.call(patch, 'level') && patch.level) {
              nextExercise.level = patch.level;
            }

            if (Object.prototype.hasOwnProperty.call(patch, 'series') && patch.series !== undefined) {
              nextExercise.series = patch.series;
              const parsed = parseSeriesCount(patch.series);
              if (Number.isFinite(parsed) && parsed) {
                nextExercise.sets = Math.max(1, Math.trunc(parsed));
              }
            }

            if (
              Object.prototype.hasOwnProperty.call(patch, 'repetitions') &&
              patch.repetitions !== undefined
            ) {
              nextExercise.repetitions = patch.repetitions;
              nextExercise.reps = patch.repetitions;
            }

            if (Object.prototype.hasOwnProperty.call(patch, 'sets') && patch.sets !== undefined) {
              const parsedSets = Number.isFinite(patch.sets) ? Math.trunc(Number(patch.sets)) : NaN;
              if (!Number.isNaN(parsedSets) && parsedSets > 0) {
                nextExercise.sets = parsedSets;
              }
            }

            if (Object.prototype.hasOwnProperty.call(patch, 'reps') && patch.reps !== undefined) {
              nextExercise.reps = patch.reps;
            }

            if (Object.prototype.hasOwnProperty.call(patch, 'charge') && patch.charge !== undefined) {
              nextExercise.charge = patch.charge;
            }

            if (
              Object.prototype.hasOwnProperty.call(patch, 'restSeconds') &&
              patch.restSeconds !== undefined
            ) {
              nextExercise.restSeconds = patch.restSeconds;
              nextExercise.rest =
                patch.restSeconds != null && Number.isFinite(patch.restSeconds)
                  ? `${Math.max(0, Math.trunc(patch.restSeconds))}s`
                  : '-';
            }

            if (Object.prototype.hasOwnProperty.call(patch, 'rest') && patch.rest !== undefined) {
              nextExercise.rest = patch.rest;
            }

            if (Object.prototype.hasOwnProperty.call(patch, 'videoUrl') && patch.videoUrl !== undefined) {
              nextExercise.videoUrl = patch.videoUrl;
            }

            if (Object.prototype.hasOwnProperty.call(patch, 'categoryIds') && patch.categoryIds) {
              nextExercise.categoryIds = [...patch.categoryIds];
            }

            if (
              Object.prototype.hasOwnProperty.call(patch, 'categoryLabels') &&
              patch.categoryLabels
            ) {
              nextExercise.categoryLabels = [...patch.categoryLabels];
            }

            if (Object.prototype.hasOwnProperty.call(patch, 'muscleIds') && patch.muscleIds) {
              nextExercise.muscleIds = [...patch.muscleIds];
            }

            if (Object.prototype.hasOwnProperty.call(patch, 'muscles') && patch.muscles) {
              nextExercise.muscles = patch.muscles.map((item) => ({ ...item }));
            }

            if (Object.prototype.hasOwnProperty.call(patch, 'equipmentIds') && patch.equipmentIds) {
              nextExercise.equipmentIds = [...patch.equipmentIds];
            }

            if (Object.prototype.hasOwnProperty.call(patch, 'equipment') && patch.equipment) {
              nextExercise.equipment = patch.equipment.map((item) => ({ ...item }));
            }

            if (Object.prototype.hasOwnProperty.call(patch, 'tagIds') && patch.tagIds) {
              nextExercise.tagIds = [...patch.tagIds];
            }

            if (Object.prototype.hasOwnProperty.call(patch, 'tags') && patch.tags) {
              nextExercise.tags = patch.tags.map((item) => ({ ...item }));
            }

            return nextExercise;
          });

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
    idCountersRef.current.session = 0;
    idCountersRef.current.exercise = 0;
    usedIdsRef.current.session.clear();
    usedIdsRef.current.exercise.clear();
    exerciseMapRef.current = new Map();
    setExerciseOverrides(() => new Map());
  }, [
    builderCopy.structure.header_description,
    builderCopy.structure.title,
    setExerciseOverrides,
  ]);

  const handleSubmit = React.useCallback(
    async (event?: React.SyntheticEvent) => {
      event?.preventDefault();
      event?.stopPropagation();

      const name = trimmedProgramName;
      const duration = parsedDuration;
      const frequency = parsedFrequency;

      if (!name || !duration || !frequency) {
        flashError(t('programs-coatch.builder.errors.missing_required_fields'));
        return;
      }

      try {
        const sessionSnapshots = sessions.map((session) => ({
          id: session.id,
          templateSessionId: session.sessionId,
          label: session.label,
          durationMin: session.duration,
          description: session.description ? session.description : undefined,
          exercises: session.exercises.map((exercise) => {
            const normalizedCategoryIds = Array.from(
              new Set(exercise.categoryIds.filter((id) => Boolean(id))),
            );
            const normalizedMuscleIds = Array.from(
              new Set(exercise.muscleIds.filter((id) => Boolean(id))),
            );
            const normalizedEquipmentIds = Array.from(
              new Set(exercise.equipmentIds.filter((id) => Boolean(id))),
            );
            const normalizedTagIds = Array.from(
              new Set(exercise.tagIds.filter((id) => Boolean(id))),
            );
            const restSeconds =
              exercise.restSeconds != null
                ? exercise.restSeconds
                : parseRestSecondsValue(exercise.rest);
            const trimmedSeries = exercise.series.trim();

            return {
              id: exercise.id,
              templateExerciseId: exercise.exerciseId,
              label: exercise.label,
              series: trimmedSeries || String(exercise.sets),
              repetitions: exercise.repetitions,
              restSeconds,
              description: exercise.description ? exercise.description : undefined,
              instructions: exercise.instructions ? exercise.instructions : undefined,
              charge: exercise.charge ? exercise.charge : undefined,
              videoUrl: exercise.videoUrl ? exercise.videoUrl : undefined,
              level: exercise.level,
              categoryIds: normalizedCategoryIds.length ? normalizedCategoryIds : undefined,
              muscleIds: normalizedMuscleIds.length ? normalizedMuscleIds : undefined,
              equipmentIds: normalizedEquipmentIds.length
                ? normalizedEquipmentIds
                : undefined,
              tagIds: normalizedTagIds.length ? normalizedTagIds : undefined,
            };
          }),
        }));

        if (mode === 'edit' && program) {
          await updateProgram({
            id: program.id,
            slug: program.slug,
            locale: program.locale,
            label: name,
            duration,
            frequency,
            description: programDescription.trim() || '',
            sessionIds: sessions.map((session) => session.sessionId),
            sessions: sessionSnapshots,
            userId: form.athlete || null,
          });
          onUpdated?.();
        } else {
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
          onCreated?.();
        }

        resetBuilder();
        onCancel();
      } catch (_error: unknown) {
        flashError(t('common.unexpected_error'));
      }
    },
    [
      createProgram,
      flashError,
      form.athlete,
      i18n.language,
      mode,
      onCancel,
      onCreated,
      onUpdated,
      parsedDuration,
      parsedFrequency,
      program,
      programDescription,
      resetBuilder,
      sessions,
      t,
      trimmedProgramName,
      updateProgram,
    ],
  );

  React.useEffect(() => {
    if (program) {
      return;
    }
    resetBuilder();
  }, [program, resetBuilder]);

  const programSignatureRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (!program) {
      programSignatureRef.current = null;
      return;
    }

    const signature = `${program.id}|${program.updatedAt}`;
    if (programSignatureRef.current === signature) {
      return;
    }
    programSignatureRef.current = signature;

    setUsersQ('');
    setSessionSearch('');
    setExerciseSearch('');
    setExerciseCategory('all');
    setExerciseType('all');

    setForm({
      athlete: program.userId ?? '',
      programName: program.label,
      duration: program.duration != null ? String(program.duration) : '',
      frequency: program.frequency != null ? String(program.frequency) : '',
    });
    setProgramDescription(program.description ?? '');

    if (program.athlete) {
      setSelectedAthlete({
        id: program.athlete.id,
        type: UserType.Athlete,
        first_name: program.athlete.first_name ?? '',
        last_name: program.athlete.last_name ?? '',
        email: program.athlete.email,
        phone: null,
        address: null,
        company: null,
        createdAt: null,
        updatedAt: null,
        is_active: true,
        createdBy: program.createdBy,
      });
    } else {
      setSelectedAthlete(null);
    }

    exerciseMapRef.current = new Map();
    usedIdsRef.current.session.clear();
    usedIdsRef.current.exercise.clear();

    const placeholderExercises = new Map<string, Exercise>();
    const missingExerciseIds = new Set<string>();

    const normalizedSessions = program.sessions.map((sessionItem) => {
      const sessionId = sessionItem.id && sessionItem.id.length > 0 ? sessionItem.id : nextId('session');

      const normalizedExercises = sessionItem.exercises.map((exerciseItem) => {
        const builderExerciseId =
          exerciseItem.id && exerciseItem.id.length > 0 ? exerciseItem.id : nextId('exercise');
        const baseExerciseId =
          exerciseItem.templateExerciseId && exerciseItem.templateExerciseId.length > 0
            ? exerciseItem.templateExerciseId
            : exerciseItem.id && exerciseItem.id.length > 0
              ? exerciseItem.id
              : builderExerciseId;

        const baseExercise = getRawExerciseById(baseExerciseId);

        if (!baseExercise && !placeholderExercises.has(baseExerciseId)) {
          const categoryIds = Array.from(
            new Set((exerciseItem.categoryIds ?? []).filter((id): id is string => Boolean(id))),
          );
          const muscleIds = Array.from(
            new Set((exerciseItem.muscleIds ?? []).filter((id): id is string => Boolean(id))),
          );
          const equipmentIds = Array.from(
            new Set((exerciseItem.equipmentIds ?? []).filter((id): id is string => Boolean(id))),
          );
          const tagIds = Array.from(
            new Set((exerciseItem.tagIds ?? []).filter((id): id is string => Boolean(id))),
          );

          placeholderExercises.set(baseExerciseId, {
            id: baseExerciseId,
            slug: baseExerciseId,
            locale: program.locale,
            label: exerciseItem.label,
            description: exerciseItem.description ?? null,
            instructions: exerciseItem.instructions ?? null,
            level: normalizeExerciseLevel(exerciseItem.level),
            series: exerciseItem.series ?? '',
            repetitions: exerciseItem.repetitions ?? '',
            charge: exerciseItem.charge ?? null,
            rest: exerciseItem.restSeconds ?? null,
            videoUrl: exerciseItem.videoUrl ?? null,
            visibility: 'PRIVATE',
            categoryIds,
            createdBy: program.createdBy,
            createdAt: program.createdAt,
            updatedAt: program.updatedAt,
            creator: program.creator
              ? { id: program.creator.id, email: program.creator.email }
              : undefined,
            categories: categoryIds.map((id) => ({ id, label: id })),
            muscles: muscleIds.map((id) => ({ id, label: id })),
            equipment: equipmentIds.map((id) => ({ id, label: id })),
            tags: tagIds.map((id) => ({ id, label: id })),
          });
          if (shouldHydrateExerciseDetails(exerciseItem)) {
            missingExerciseIds.add(baseExerciseId);
          }
        }

        const fallbackExercise =
          baseExercise ?? placeholderExercises.get(baseExerciseId) ?? getRawExerciseById(baseExerciseId);

        const resolveLabeledItems = (
          primary:
            | ({ id?: string | null; label?: string | null } | null | undefined)[]
            | undefined,
          secondary:
            | ({ id?: string | null; label?: string | null } | null | undefined)[]
            | undefined,
        ) => {
          const dedup = new Map<string, string>();
          for (const item of [...(primary ?? []), ...(secondary ?? [])]) {
            if (!item?.id) {
              continue;
            }
            const label = (item.label ?? item.id).trim();
            if (!dedup.has(item.id)) {
              dedup.set(item.id, label.length > 0 ? label : item.id);
            }
          }
          return Array.from(dedup.entries()).map(([id, label]) => ({ id, label }));
        };

        const categoryIds = Array.from(
          new Set(
            (
              (exerciseItem.categoryIds as string[] | undefined) ??
              (fallbackExercise?.categoryIds ?? [])
            ).filter((id): id is string => Boolean(id)),
          ),
        );
        const categoryLabels = categoryIds.map((categoryId) => {
          const fromSession = exerciseItem.categories?.find((category) => category?.id === categoryId)?.label;
          if (fromSession) {
            return fromSession;
          }
          const fromFallback = fallbackExercise?.categories?.find((category) => category?.id === categoryId)?.label;
          if (fromFallback) {
            return fromFallback;
          }
          return categoryLabelById.get(categoryId) ?? categoryId;
        });

        const muscles = resolveLabeledItems(exerciseItem.muscles, fallbackExercise?.muscles);
        const equipment = resolveLabeledItems(exerciseItem.equipments, fallbackExercise?.equipment);
        const tags = resolveLabeledItems(exerciseItem.tags, fallbackExercise?.tags);

        const descriptionValue =
          exerciseItem.description ?? fallbackExercise?.description ?? '';
        const instructionsValue =
          exerciseItem.instructions ?? fallbackExercise?.instructions ?? '';
        const levelValue = normalizeExerciseLevel(exerciseItem.level ?? fallbackExercise?.level);
        const seriesValue = exerciseItem.series ?? fallbackExercise?.series ?? '';
        const repetitionsValue = exerciseItem.repetitions ?? fallbackExercise?.repetitions ?? '';
        const chargeValue = exerciseItem.charge ?? fallbackExercise?.charge ?? '';
        const restSecondsValue =
          exerciseItem.restSeconds ?? fallbackExercise?.rest ?? null;
        const restLabel =
          restSecondsValue != null && Number.isFinite(restSecondsValue)
            ? `${Math.max(0, Math.trunc(restSecondsValue))}s`
            : '-';
        const videoUrlValue = exerciseItem.videoUrl ?? fallbackExercise?.videoUrl ?? '';
        const parsedSets = parseSeriesCount(seriesValue ?? '');
        const sets = Number.isFinite(parsedSets) && parsedSets ? Math.max(1, Math.trunc(parsedSets)) : 1;

        return {
          id: builderExerciseId,
          exerciseId: baseExerciseId,
          label: exerciseItem.label ?? fallbackExercise?.label ?? baseExerciseId,
          description: descriptionValue ?? '',
          instructions: instructionsValue ?? '',
          level: levelValue,
          series: seriesValue ?? '',
          repetitions: repetitionsValue ?? '',
          charge: chargeValue ?? '',
          restSeconds: restSecondsValue ?? null,
          rest: restLabel,
          videoUrl: videoUrlValue ?? '',
          categoryIds,
          categoryLabels,
          muscleIds: muscles.map((item) => item.id),
          muscles,
          equipmentIds: equipment.map((item) => item.id),
          equipment,
          tagIds: tags.map((item) => item.id),
          tags,
          sets,
          reps: repetitionsValue ?? '',
        } satisfies ProgramExercise;
      });

      return {
        id: sessionId,
        sessionId: sessionItem.templateSessionId ?? sessionItem.id ?? sessionId,
        label: sessionItem.label,
        duration: sessionItem.durationMin,
        description: sessionItem.description ?? '',
        tags: [],
        exercises: normalizedExercises,
      } satisfies ProgramSession;
    });

    const sessionPattern = /^session-(\d+)$/;
    const exercisePattern = /^exercise-(\d+)$/;
    let maxSessionCounter = 0;
    let maxExerciseCounter = 0;

    normalizedSessions.forEach((sessionItem) => {
      usedIdsRef.current.session.add(sessionItem.id);
      const sessionMatch = sessionPattern.exec(sessionItem.id);
      if (sessionMatch) {
        maxSessionCounter = Math.max(maxSessionCounter, Number.parseInt(sessionMatch[1], 10));
      }

      sessionItem.exercises.forEach((exerciseItem) => {
        usedIdsRef.current.exercise.add(exerciseItem.id);
        const exerciseMatch = exercisePattern.exec(exerciseItem.id);
        if (exerciseMatch) {
          maxExerciseCounter = Math.max(
            maxExerciseCounter,
            Number.parseInt(exerciseMatch[1], 10),
          );
        }
      });
    });

    idCountersRef.current.session = maxSessionCounter;
    idCountersRef.current.exercise = maxExerciseCounter;

    setSessions(normalizedSessions);

    if (placeholderExercises.size > 0) {
      setExerciseOverrides((previous) => {
        let mutated = false;
        const next = new Map(previous);
        placeholderExercises.forEach((exercise, exerciseId) => {
          if (!next.has(exerciseId)) {
            next.set(exerciseId, exercise);
            mutated = true;
          }
        });
        return mutated ? next : previous;
      });
    }

    if (missingExerciseIds.size > 0) {
      let cancelled = false;
      const ids = Array.from(missingExerciseIds);
      void (async () => {
        const detailedExercises = await Promise.all(
          ids.map(async (exerciseId) => {
            try {
              const exercise = await getExerciseById(exerciseId);
              return exercise ?? null;
            } catch (_error) {
              return null;
            }
          }),
        );

        if (cancelled) {
          return;
        }

        setExerciseOverrides((previous) => {
          let mutated = false;
          const next = new Map(previous);
          detailedExercises.forEach((exercise) => {
            if (!exercise) {
              return;
            }
            next.set(exercise.id, exercise);
            mutated = true;
          });
          return mutated ? next : previous;
        });
      })();

      return () => {
        cancelled = true;
      };
    }

    return undefined;
  }, [
    program,
    nextId,
    normalizeExerciseLevel,
    getExerciseById,
    getRawExerciseById,
    setExerciseCategory,
    setExerciseOverrides,
    setExerciseSearch,
    setExerciseType,
    setForm,
    setProgramDescription,
    setSelectedAthlete,
    setSessionSearch,
    setUsersQ,
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
    handleUpdateProgramExercise,
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
    deleteExercise,
    registerExercise,
    getRawExerciseById,
    mode,
  };
}
