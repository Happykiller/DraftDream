import * as React from 'react';
import { useTranslation } from 'react-i18next';
import Autocomplete, {
  createFilterOptions,
} from '@mui/material/Autocomplete';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { Add, Edit } from '@mui/icons-material';

import type {
  CreateExerciseInput,
  Exercise,
  ExerciseLevel,
  UpdateExerciseInput,
} from '@hooks/useExercises';
import { useMuscles } from '@hooks/useMuscles';
import { useEquipment } from '@hooks/useEquipment';
import { useTags } from '@hooks/useTags';
import type { ExerciseCategoryOption } from '@components/programs/programBuilderTypes';
import { slugify } from '@src/utils/slugify';

type Option = { id: string; label: string };

type CreatableOption = Option & {
  inputValue?: string;
  isCreateOption?: boolean;
};

type ProgramBuilderCreateExerciseDialogProps = {
  open: boolean;
  mode?: 'create' | 'edit';
  exercise?: Exercise;
  categoryOptions: ExerciseCategoryOption[];
  createExercise: (input: CreateExerciseInput) => Promise<Exercise | undefined>;
  updateExercise?: (input: UpdateExerciseInput) => Promise<Exercise | undefined>;
  onClose: () => void;
  onCreated?: (exercise: Exercise) => void;
  onUpdated?: (exercise: Exercise) => void;
};

export function ProgramBuilderCreateExerciseDialog({
  open,
  mode = 'create',
  exercise,
  categoryOptions,
  createExercise,
  updateExercise,
  onClose,
  onCreated,
  onUpdated,
}: ProgramBuilderCreateExerciseDialogProps): React.JSX.Element {
  const { t, i18n } = useTranslation();
  const theme = useTheme();
  const locale = i18n.language || 'fr';
  const collator = React.useMemo(
    () => new Intl.Collator(locale, { sensitivity: 'base' }),
    [locale],
  );
  const isEditMode = mode === 'edit';
  const dialogNamespace = isEditMode
    ? 'programs-coatch.builder.library.edit_dialog'
    : 'programs-coatch.builder.library.create_dialog';

  const { items: muscles, loading: musclesLoading, create: createMuscle } = useMuscles({
    page: 1,
    limit: 100,
    q: '',
  });
  const { items: equipment, loading: equipmentLoading, create: createEquipment } = useEquipment({
    page: 1,
    limit: 100,
    q: '',
  });
  const { items: tags, loading: tagsLoading, create: createTag } = useTags({
    page: 1,
    limit: 100,
    q: '',
  });

  const categoryOptionsByLocale = React.useMemo(() => {
    return categoryOptions
      .filter((option) => option.label)
      .sort((a, b) => collator.compare(a.label, b.label));
  }, [categoryOptions, collator]);

  const muscleOptions = React.useMemo<CreatableOption[]>(() => {
    return muscles
      .filter((muscle) => !muscle.locale || muscle.locale === locale)
      .map((muscle) => ({ id: muscle.id, label: muscle.label || muscle.slug }))
      .sort((a, b) => collator.compare(a.label, b.label));
  }, [collator, locale, muscles]);

  const equipmentOptions = React.useMemo<CreatableOption[]>(() => {
    return equipment
      .filter((item) => !item.locale || item.locale === locale)
      .map((item) => ({ id: item.id, label: item.label || item.slug }))
      .sort((a, b) => collator.compare(a.label, b.label));
  }, [collator, equipment, locale]);

  const tagOptions = React.useMemo<CreatableOption[]>(() => {
    return tags
      .filter((item) => !item.locale || item.locale === locale)
      .map((item) => ({ id: item.id, label: item.label || item.slug }))
      .sort((a, b) => collator.compare(a.label, b.label));
  }, [collator, locale, tags]);

  const creatableFilter = React.useMemo(
    () => createFilterOptions<CreatableOption>(),
    [],
  );

  const filterCreatableOptions = React.useCallback(
    (options: CreatableOption[], params: any) => {
      const filtered = creatableFilter(options, params);
      const trimmed = params.inputValue.trim();
      if (!trimmed) {
        return filtered;
      }
      const alreadyExists = options.some(
        (option) => collator.compare(option.label, trimmed) === 0,
      );
      const alreadyInFiltered = filtered.some(
        (option) => collator.compare(option.label, trimmed) === 0,
      );
      if (!alreadyExists && !alreadyInFiltered) {
        filtered.push({
          inputValue: trimmed,
          label: trimmed,
          isCreateOption: true,
          id: ''
        });
      }
      return filtered;
    },
    [collator, creatableFilter],
  );

  const [label, setLabel] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [instructions, setInstructions] = React.useState('');
  const [series, setSeries] = React.useState('3');
  const [repetitions, setRepetitions] = React.useState('12');
  const [rest, setRest] = React.useState('');
  const [charge, setCharge] = React.useState('');
  const [videoUrl, setVideoUrl] = React.useState('');
  const [categoryIds, setCategoryIds] = React.useState<string[]>([]);
  const [level, setLevel] = React.useState<ExerciseLevel>('BEGINNER');
  const [muscleIds, setMuscleIds] = React.useState<string[]>([]);
  const [equipmentIds, setEquipmentIds] = React.useState<string[]>([]);
  const [tagIds, setTagIds] = React.useState<string[]>([]);
  const [creatingMuscle, setCreatingMuscle] = React.useState(false);
  const [creatingEquipment, setCreatingEquipment] = React.useState(false);
  const [creatingTag, setCreatingTag] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const previousExerciseIdRef = React.useRef<string | null>(null);

  const handleCreatableSelection = React.useCallback(
    async (
      next: CreatableOption[],
      setIds: React.Dispatch<React.SetStateAction<string[]>>,
      setPending: React.Dispatch<React.SetStateAction<boolean>>,
      createItem: (label: string) => Promise<Option | undefined>,
    ) => {
      const sanitized = next.filter((option) => !option.isCreateOption);
      const sanitizedIds = Array.from(new Set(sanitized.map((option) => option.id)));
      const candidate = next.find((option) => option.isCreateOption && option.inputValue);
      if (!candidate) {
        setIds(sanitizedIds);
        return;
      }
      const trimmed = candidate.inputValue?.trim();
      if (!trimmed) {
        setIds(sanitizedIds);
        return;
      }
      setPending(true);
      try {
        const created = await createItem(trimmed);
        if (!created) {
          setIds(sanitizedIds);
          return;
        }
        const updated = Array.from(new Set([...sanitizedIds, created.id]));
        setIds(updated);
      } catch (_error: unknown) {
        setIds(sanitizedIds);
      } finally {
        setPending(false);
      }
    },
    [],
  );

  const createMuscleOption = React.useCallback(
    async (nextLabel: string) => {
      const trimmed = nextLabel.trim();
      if (!trimmed) {
        return undefined;
      }
      try {
        const created = await createMuscle({
          slug: slugify(trimmed),
          locale,
          label: trimmed,
          visibility: 'PRIVATE',
        });
        return { id: created.id, label: created.label || trimmed };
      } catch (_error: unknown) {
        return undefined;
      }
    },
    [createMuscle, locale],
  );

  const createEquipmentOption = React.useCallback(
    async (nextLabel: string) => {
      const trimmed = nextLabel.trim();
      if (!trimmed) {
        return undefined;
      }
      try {
        const created = await createEquipment({
          slug: slugify(trimmed),
          locale,
          label: trimmed,
          visibility: 'PRIVATE',
        });
        return { id: created.id, label: created.label || trimmed };
      } catch (_error: unknown) {
        return undefined;
      }
    },
    [createEquipment, locale],
  );

  const createTagOption = React.useCallback(
    async (nextLabel: string) => {
      const trimmed = nextLabel.trim();
      if (!trimmed) {
        return undefined;
      }
      try {
        const created = await createTag({
          slug: slugify(trimmed),
          locale,
          label: trimmed,
          visibility: 'PRIVATE',
        });
        return { id: created.id, label: created.label || trimmed };
      } catch (_error: unknown) {
        return undefined;
      }
    },
    [createTag, locale],
  );

  const handleMusclesChange = React.useCallback(
    (_event: React.SyntheticEvent<Element, Event>, next: CreatableOption[]) => {
      void handleCreatableSelection(next, setMuscleIds, setCreatingMuscle, createMuscleOption);
    },
    [createMuscleOption, handleCreatableSelection, setMuscleIds],
  );

  const handleEquipmentChange = React.useCallback(
    (_event: React.SyntheticEvent<Element, Event>, next: CreatableOption[]) => {
      void handleCreatableSelection(next, setEquipmentIds, setCreatingEquipment, createEquipmentOption);
    },
    [createEquipmentOption, handleCreatableSelection, setEquipmentIds],
  );

  const handleTagsChange = React.useCallback(
    (_event: React.SyntheticEvent<Element, Event>, next: CreatableOption[]) => {
      void handleCreatableSelection(next, setTagIds, setCreatingTag, createTagOption);
    },
    [createTagOption, handleCreatableSelection, setTagIds],
  );

  React.useEffect(() => {
    if (open) {
      return;
    }
    setLabel('');
    setDescription('');
    setInstructions('');
    setSeries('3');
    setRepetitions('12');
    setRest('');
    setCharge('');
    setVideoUrl('');
    setCategoryIds([]);
    setLevel('BEGINNER');
    setMuscleIds([]);
    setEquipmentIds([]);
    setTagIds([]);
    setCreatingMuscle(false);
    setCreatingEquipment(false);
    setCreatingTag(false);
    setSubmitting(false);
    previousExerciseIdRef.current = null;
  }, [open]);

  React.useEffect(() => {
    if (!open || !isEditMode || !exercise) {
      return;
    }
    if (previousExerciseIdRef.current === exercise.id) {
      return;
    }
    previousExerciseIdRef.current = exercise.id;
    setLabel(exercise.label ?? '');
    setDescription(exercise.description ?? '');
    setInstructions(exercise.instructions ?? '');
    setSeries(exercise.series ?? '');
    setRepetitions(exercise.repetitions ?? '');
    setRest(exercise.rest != null ? String(exercise.rest) : '');
    setCharge(exercise.charge ?? '');
    setVideoUrl(exercise.videoUrl ?? '');
    setCategoryIds(exercise.categoryIds ?? []);
    setLevel(exercise.level);
    setMuscleIds(
      (exercise.muscles ?? [])
        .filter((muscle): muscle is NonNullable<typeof muscle> => Boolean(muscle?.id))
        .map((muscle) => muscle!.id),
    );
    setEquipmentIds(
      (exercise.equipment ?? [])
        .filter((item): item is NonNullable<typeof item> => Boolean(item?.id))
        .map((item) => item!.id),
    );
    setTagIds(
      (exercise.tags ?? [])
        .filter((item): item is NonNullable<typeof item> => Boolean(item?.id))
        .map((item) => item!.id),
    );
  }, [exercise, isEditMode, open]);

  const levelOptions = React.useMemo<{ value: ExerciseLevel; label: string }[]>(
    () => [
      {
        value: 'BEGINNER',
        label: t('programs-coatch.builder.library.create_dialog.levels.beginner', {
          defaultValue: 'Beginner',
        }),
      },
      {
        value: 'INTERMEDIATE',
        label: t('programs-coatch.builder.library.create_dialog.levels.intermediate', {
          defaultValue: 'Intermediate',
        }),
      },
      {
        value: 'ADVANCED',
        label: t('programs-coatch.builder.library.create_dialog.levels.advanced', {
          defaultValue: 'Advanced',
        }),
      },
    ],
    [t],
  );

  const normalizedCategoryIds = React.useMemo(
    () => Array.from(new Set(categoryIds.map((id) => id.trim()).filter(Boolean))),
    [categoryIds],
  );

  const isSubmitDisabled =
    submitting ||
    creatingMuscle ||
    creatingEquipment ||
    creatingTag ||
    !label.trim() ||
    !series.trim() ||
    !repetitions.trim() ||
    normalizedCategoryIds.length === 0 ||
    muscleIds.length === 0;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitDisabled) {
      return;
    }
    if (isEditMode && (!updateExercise || !exercise)) {
      return;
    }

    setSubmitting(true);
    try {
      if (isEditMode && updateExercise && exercise) {
        const trimmedLabel = label.trim();
        const trimmedSeries = series.trim();
        const trimmedRepetitions = repetitions.trim();
        const nextCategoryIds = [...normalizedCategoryIds];
        const payload: UpdateExerciseInput = {
          id: exercise.id,
          label: trimmedLabel,
          level,
          series: trimmedSeries,
          repetitions: trimmedRepetitions,
          visibility: exercise.visibility,
          muscleIds,
          equipmentIds,
          tagIds,
          categoryIds: nextCategoryIds,
        };

        if (exercise.locale) {
          payload.locale = exercise.locale;
        }
        if (!exercise.locale && locale) {
          payload.locale = locale;
        }

        const nextSlug = slugify(trimmedLabel);
        if (nextSlug !== exercise.slug) {
          payload.slug = nextSlug;
        }

        const trimmedDescription = description.trim();
        payload.description = trimmedDescription ? trimmedDescription : null;
        const trimmedInstructions = instructions.trim();
        payload.instructions = trimmedInstructions ? trimmedInstructions : null;
        const trimmedCharge = charge.trim();
        payload.charge = trimmedCharge ? trimmedCharge : null;
        const trimmedVideoUrl = videoUrl.trim();
        payload.videoUrl = trimmedVideoUrl ? trimmedVideoUrl : null;

        const parsedRest = Number.parseInt(rest, 10);
        payload.rest = Number.isNaN(parsedRest) || parsedRest < 0 ? null : parsedRest;

        const updated = await updateExercise(payload);
        if (updated) {
          onUpdated?.(updated);
          onClose();
        }
      } else {
        const payload: CreateExerciseInput = {
          slug: slugify(label.trim()),
          locale,
          label: label.trim(),
          level,
          series: series.trim(),
          repetitions: repetitions.trim(),
          visibility: 'PRIVATE',
          categoryIds: [...normalizedCategoryIds],
          muscleIds,
        };

        const trimmedDescription = description.trim();
        if (trimmedDescription) {
          payload.description = trimmedDescription;
        }
        const trimmedInstructions = instructions.trim();
        if (trimmedInstructions) {
          payload.instructions = trimmedInstructions;
        }
        const trimmedCharge = charge.trim();
        if (trimmedCharge) {
          payload.charge = trimmedCharge;
        }
        const trimmedVideoUrl = videoUrl.trim();
        if (trimmedVideoUrl) {
          payload.videoUrl = trimmedVideoUrl;
        }
        if (equipmentIds.length > 0) {
          payload.equipmentIds = equipmentIds;
        }
        if (tagIds.length > 0) {
          payload.tagIds = tagIds;
        }

        const parsedRest = Number.parseInt(rest, 10);
        if (!Number.isNaN(parsedRest) && parsedRest >= 0) {
          payload.rest = parsedRest;
        }

        const created = await createExercise(payload);
        if (created) {
          onCreated?.(created);
          onClose();
        }
      }
    } catch (_error: unknown) {
      // Flash messaging is already handled by the hook; nothing more to do here.
    } finally {
      setSubmitting(false);
    }
  };

  const fallbackCategoryLookup = React.useMemo(() => {
    return new Map(
      (exercise?.categories ?? [])
        .filter((category): category is NonNullable<typeof category> => Boolean(category?.id))
        .map((category) => [category.id, { id: category.id, label: category.label ?? category.id }]),
    );
  }, [exercise?.categories]);

  const selectedCategories = React.useMemo(() => {
    const lookup = new Map(categoryOptionsByLocale.map((option) => [option.id, option]));
    return normalizedCategoryIds
      .map((id) => lookup.get(id) ?? fallbackCategoryLookup.get(id))
      .filter((option): option is ExerciseCategoryOption => Boolean(option));
  }, [categoryOptionsByLocale, fallbackCategoryLookup, normalizedCategoryIds]);

  const selectedMuscles = React.useMemo<CreatableOption[]>(() => {
    const map = new Map(muscleIds.map((id) => [id, id]));
    return muscleOptions.filter((option) => map.has(option.id));
  }, [muscleIds, muscleOptions]);

  const selectedEquipment = React.useMemo<CreatableOption[]>(() => {
    const map = new Map(equipmentIds.map((id) => [id, id]));
    return equipmentOptions.filter((option) => map.has(option.id));
  }, [equipmentIds, equipmentOptions]);

  const selectedTags = React.useMemo<CreatableOption[]>(() => {
    const map = new Map(tagIds.map((id) => [id, id]));
    return tagOptions.filter((option) => map.has(option.id));
  }, [tagIds, tagOptions]);

  const title = t(`${dialogNamespace}.title`, {
    defaultValue: isEditMode ? 'Edit exercise template' : 'Create an exercise template',
  });
  const subtitle = t(`${dialogNamespace}.subtitle`, {
    defaultValue: isEditMode
      ? 'Update your reusable exercise.'
      : 'Create a reusable exercise for your programs.',
  });

  const cancelLabel = t(`${dialogNamespace}.actions.cancel`, {
    defaultValue: 'Cancel',
  });
  const submitLabel = submitting
    ? t(`${dialogNamespace}.actions.submitting`, {
      defaultValue: isEditMode ? 'Saving...' : 'Creating...',
    })
    : t(`${dialogNamespace}.actions.submit`, {
      defaultValue: isEditMode ? 'Save' : 'Create',
    });

  const fieldCopy = React.useMemo(
    () => ({
      label: t('programs-coatch.builder.library.create_dialog.fields.label', {
        defaultValue: 'Exercise name',
      }),
      description: t('programs-coatch.builder.library.create_dialog.fields.description', {
        defaultValue: 'Description (optional)',
      }),
      instructions: t('programs-coatch.builder.library.create_dialog.fields.instructions', {
        defaultValue: 'Instructions (optional)',
      }),
      level: t('programs-coatch.builder.library.create_dialog.fields.level', {
        defaultValue: 'Level',
      }),
      series: t('programs-coatch.builder.library.create_dialog.fields.series', {
        defaultValue: 'Series',
      }),
      repetitions: t('programs-coatch.builder.library.create_dialog.fields.repetitions', {
        defaultValue: 'Repetitions',
      }),
      rest: t('programs-coatch.builder.library.create_dialog.fields.rest', {
        defaultValue: 'Rest (sec)',
      }),
      charge: t('programs-coatch.builder.library.create_dialog.fields.charge', {
        defaultValue: 'Weight / Load (optional)',
      }),
      videoUrl: t('programs-coatch.builder.library.create_dialog.fields.video_url', {
        defaultValue: 'Video URL (optional)',
      }),
      category: t('programs-coatch.builder.library.create_dialog.fields.category', {
        defaultValue: 'Category',
      }),
      muscles: t('programs-coatch.builder.library.create_dialog.fields.muscles', {
        defaultValue: 'Muscles',
      }),
      equipment: t('programs-coatch.builder.library.create_dialog.fields.equipment', {
        defaultValue: 'Equipment (optional)',
      }),
      tags: t('programs-coatch.builder.library.create_dialog.fields.tags', {
        defaultValue: 'Tags (optional)',
      }),
    }),
    [t],
  );
  const categoryLabel = fieldCopy.category;

  const helperCopy = React.useMemo(
    () => ({
      muscles: t('programs-coatch.builder.library.create_dialog.helper.muscles', {
        defaultValue: 'Select at least one muscle.',
      }),
    }),
    [t],
  );

  const creationOptionCopy = React.useMemo(
    () => ({
      muscle: (value: string) =>
        t('programs-coatch.builder.library.create_dialog.create_option.muscle', {
          defaultValue: `Create muscle "${value}"`,
          label: value,
        }),
      equipment: (value: string) =>
        t('programs-coatch.builder.library.create_dialog.create_option.equipment', {
          defaultValue: `Create equipment "${value}"`,
          label: value,
        }),
      tag: (value: string) =>
        t('programs-coatch.builder.library.create_dialog.create_option.tag', {
          defaultValue: `Create tag "${value}"`,
          label: value,
        }),
    }),
    [t],
  );

  return (
    <Dialog
      open={open}
      onClose={submitting ? undefined : onClose}
      fullWidth
      maxWidth="md"
    >
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <DialogTitle sx={{ backgroundColor: alpha(theme.palette.success.main, 0.20) }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              aria-hidden
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                bgcolor: 'success.main',
                color: 'primary.contrastText',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {isEditMode ? <Edit fontSize="large" /> : <Add fontSize="large" />}
            </Box>
            <Stack spacing={0.5}>
              <Typography variant="h6" component="span" sx={{ fontWeight: 700 }}>
                {title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            </Stack>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3}>
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField
                  required
                  fullWidth
                  label={fieldCopy.label}
                  value={label}
                  onChange={(event) => setLabel(event.target.value)}
                />

                <Autocomplete
                  multiple
                  fullWidth
                  options={categoryOptionsByLocale}
                  value={selectedCategories}
                  onChange={(_event, options) => setCategoryIds(options.map((option) => option.id))}
                  getOptionLabel={(option) => option.label}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  renderInput={(params) => (
                    <TextField {...params} required label={categoryLabel} />
                  )}
                />
              </Stack>

              <Autocomplete
                multiple
                options={muscleOptions}
                value={selectedMuscles}
                onChange={handleMusclesChange}
                filterOptions={filterCreatableOptions}
                loading={musclesLoading || creatingMuscle}
                getOptionLabel={(option) => option.inputValue ?? option.label}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderOption={(props, option) => {
                  const { key, ...optionProps } = props as typeof props & {
                    key: React.Key;
                  };
                  const optionLabel =
                    option.isCreateOption && option.inputValue
                      ? creationOptionCopy.muscle(option.inputValue)
                      : option.label;

                  return (
                    <li {...optionProps} key={(option.id as React.Key) ?? key}>
                      {optionLabel}
                    </li>
                  );
                }}
                renderTags={(tagValue, getTagProps) =>
                  tagValue.map((option, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={option.id}
                      label={option.label}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    label={fieldCopy.muscles}
                    helperText={helperCopy.muscles}
                  />
                )}
              />

              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <TextField
                  select
                  fullWidth
                  label={fieldCopy.level}
                  value={level}
                  onChange={(event) => setLevel(event.target.value as ExerciseLevel)}
                >
                  {levelOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  fullWidth
                  label={fieldCopy.videoUrl}
                  value={videoUrl}
                  onChange={(event) => setVideoUrl(event.target.value)}
                />
              </Stack>

              <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2}>
                <TextField
                  required
                  fullWidth
                  label={fieldCopy.series}
                  value={series}
                  onChange={(event) => setSeries(event.target.value)}
                />
                <TextField
                  required
                  fullWidth
                  label={fieldCopy.repetitions}
                  value={repetitions}
                  onChange={(event) => setRepetitions(event.target.value)}
                />
                <TextField
                  fullWidth
                  label={fieldCopy.charge}
                  value={charge}
                  onChange={(event) => setCharge(event.target.value)}
                />
                <TextField
                  fullWidth
                  label={fieldCopy.rest}
                  type="number"
                  value={rest}
                  onChange={(event) => setRest(event.target.value)}
                  inputProps={{ min: 0 }}
                />
              </Stack>

              <TextField
                fullWidth
                multiline
                minRows={3}
                label={fieldCopy.description}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />

              <TextField
                fullWidth
                multiline
                minRows={3}
                label={fieldCopy.instructions}
                value={instructions}
                onChange={(event) => setInstructions(event.target.value)}
              />

              <Autocomplete
                multiple
                options={equipmentOptions}
                value={selectedEquipment}
                onChange={handleEquipmentChange}
                filterOptions={filterCreatableOptions}
                loading={equipmentLoading || creatingEquipment}
                getOptionLabel={(option) => option.inputValue ?? option.label}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderOption={(props, option) => {
                  const { key, ...optionProps } = props as typeof props & {
                    key: React.Key;
                  };
                  const optionLabel =
                    option.isCreateOption && option.inputValue
                      ? creationOptionCopy.equipment(option.inputValue)
                      : option.label;

                  return (
                    <li {...optionProps} key={(option.id as React.Key) ?? key}>
                      {optionLabel}
                    </li>
                  );
                }}
                renderTags={(tagValue, getTagProps) =>
                  tagValue.map((option, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={option.id}
                      label={option.label}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField {...params} label={fieldCopy.equipment} />
                )}
              />

              <Autocomplete
                multiple
                options={tagOptions}
                value={selectedTags}
                onChange={handleTagsChange}
                filterOptions={filterCreatableOptions}
                loading={tagsLoading || creatingTag}
                getOptionLabel={(option) => option.inputValue ?? option.label}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderOption={(props, option) => {
                  const { key, ...optionProps } = props as typeof props & {
                    key: React.Key;
                  };
                  const optionLabel =
                    option.isCreateOption && option.inputValue
                      ? creationOptionCopy.tag(option.inputValue)
                      : option.label;

                  return (
                    <li {...optionProps} key={(option.id as React.Key) ?? key}>
                      {optionLabel}
                    </li>
                  );
                }}
                renderTags={(tagValue, getTagProps) =>
                  tagValue.map((option, index) => (
                    <Chip
                      {...getTagProps({ index })}
                      key={option.id}
                      label={option.label}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField {...params} label={fieldCopy.tags} />
                )}
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ backgroundColor: '#e0dcdce0' }}>
          <Button onClick={onClose} disabled={submitting} color="inherit">
            {cancelLabel}
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={isEditMode ? <Edit /> : <Add />}
            disabled={isSubmitDisabled}
            color="success"
          >
            {submitLabel}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
