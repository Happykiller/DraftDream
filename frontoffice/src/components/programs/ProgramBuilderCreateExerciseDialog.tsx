import * as React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Autocomplete,
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
import { Add } from '@mui/icons-material';

import type {
  CreateExerciseInput,
  Exercise,
  ExerciseLevel,
} from '@hooks/useExercises';
import { useMuscles } from '@hooks/useMuscles';
import { useEquipment } from '@hooks/useEquipment';
import { useTags } from '@hooks/useTags';
import type { ExerciseCategoryOption } from '@components/programs/programBuilderTypes';
import { slugify } from '@src/utils/slugify';

type Option = { id: string; label: string };

type ProgramBuilderCreateExerciseDialogProps = {
  open: boolean;
  categoryOptions: ExerciseCategoryOption[];
  createExercise: (input: CreateExerciseInput) => Promise<Exercise | undefined>;
  onClose: () => void;
  onCreated?: (exercise: Exercise) => void;
};

export function ProgramBuilderCreateExerciseDialog({
  open,
  categoryOptions,
  createExercise,
  onClose,
  onCreated,
}: ProgramBuilderCreateExerciseDialogProps): React.JSX.Element {
  const { t, i18n } = useTranslation();
  const locale = i18n.language || 'fr';
  const collator = React.useMemo(
    () => new Intl.Collator(locale, { sensitivity: 'base' }),
    [locale],
  );

  const { items: muscles, loading: musclesLoading } = useMuscles({
    page: 1,
    limit: 100,
    q: '',
  });
  const { items: equipment, loading: equipmentLoading } = useEquipment({
    page: 1,
    limit: 100,
    q: '',
  });
  const { items: tags, loading: tagsLoading } = useTags({
    page: 1,
    limit: 100,
    q: '',
  });

  const categoryOptionsByLocale = React.useMemo(() => {
    return categoryOptions
      .filter((option) => option.label)
      .sort((a, b) => collator.compare(a.label, b.label));
  }, [categoryOptions, collator]);

  const muscleOptions = React.useMemo<Option[]>(() => {
    return muscles
      .filter((muscle) => !muscle.locale || muscle.locale === locale)
      .map((muscle) => ({ id: muscle.id, label: muscle.label || muscle.slug }))
      .sort((a, b) => collator.compare(a.label, b.label));
  }, [collator, locale, muscles]);

  const equipmentOptions = React.useMemo<Option[]>(() => {
    return equipment
      .filter((item) => !item.locale || item.locale === locale)
      .map((item) => ({ id: item.id, label: item.label || item.slug }))
      .sort((a, b) => collator.compare(a.label, b.label));
  }, [collator, equipment, locale]);

  const tagOptions = React.useMemo<Option[]>(() => {
    return tags
      .filter((item) => !item.locale || item.locale === locale)
      .map((item) => ({ id: item.id, label: item.label || item.slug }))
      .sort((a, b) => collator.compare(a.label, b.label));
  }, [collator, locale, tags]);

  const [label, setLabel] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [instructions, setInstructions] = React.useState('');
  const [series, setSeries] = React.useState('3');
  const [repetitions, setRepetitions] = React.useState('12');
  const [rest, setRest] = React.useState('');
  const [charge, setCharge] = React.useState('');
  const [videoUrl, setVideoUrl] = React.useState('');
  const [categoryId, setCategoryId] = React.useState('');
  const [level, setLevel] = React.useState<ExerciseLevel>('BEGINNER');
  const [primaryMuscleIds, setPrimaryMuscleIds] = React.useState<string[]>([]);
  const [secondaryMuscleIds, setSecondaryMuscleIds] = React.useState<string[]>([]);
  const [equipmentIds, setEquipmentIds] = React.useState<string[]>([]);
  const [tagIds, setTagIds] = React.useState<string[]>([]);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!open) {
      setLabel('');
      setDescription('');
      setInstructions('');
      setSeries('3');
      setRepetitions('12');
      setRest('');
      setCharge('');
      setVideoUrl('');
      setCategoryId('');
      setLevel('BEGINNER');
      setPrimaryMuscleIds([]);
      setSecondaryMuscleIds([]);
      setEquipmentIds([]);
      setTagIds([]);
      setSubmitting(false);
    }
  }, [open]);

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

  const isSubmitDisabled =
    submitting ||
    !label.trim() ||
    !series.trim() ||
    !repetitions.trim() ||
    !categoryId ||
    primaryMuscleIds.length === 0;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitDisabled) {
      return;
    }

    setSubmitting(true);
    try {
      const payload: CreateExerciseInput = {
        slug: slugify(label.trim()),
        locale,
        label: label.trim(),
        level,
        series: series.trim(),
        repetitions: repetitions.trim(),
        visibility: 'PRIVATE',
        categoryId,
        primaryMuscleIds,
      };

      if (description.trim()) {
        payload.description = description.trim();
      }
      if (instructions.trim()) {
        payload.instructions = instructions.trim();
      }
      if (charge.trim()) {
        payload.charge = charge.trim();
      }
      if (videoUrl.trim()) {
        payload.videoUrl = videoUrl.trim();
      }
      if (secondaryMuscleIds.length > 0) {
        payload.secondaryMuscleIds = secondaryMuscleIds;
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
      }
    } catch (error) {
      // Flash messaging is already handled by the hook; nothing more to do here.
    } finally {
      setSubmitting(false);
    }
  };

  const categoryValue = React.useMemo(() => {
    return categoryOptionsByLocale.find((option) => option.id === categoryId) ?? null;
  }, [categoryId, categoryOptionsByLocale]);

  const selectedPrimaryMuscles = React.useMemo<Option[]>(() => {
    const map = new Map(primaryMuscleIds.map((id) => [id, id]));
    return muscleOptions.filter((option) => map.has(option.id));
  }, [muscleOptions, primaryMuscleIds]);

  const selectedSecondaryMuscles = React.useMemo<Option[]>(() => {
    const map = new Map(secondaryMuscleIds.map((id) => [id, id]));
    return muscleOptions.filter((option) => map.has(option.id));
  }, [muscleOptions, secondaryMuscleIds]);

  const selectedEquipment = React.useMemo<Option[]>(() => {
    const map = new Map(equipmentIds.map((id) => [id, id]));
    return equipmentOptions.filter((option) => map.has(option.id));
  }, [equipmentIds, equipmentOptions]);

  const selectedTags = React.useMemo<Option[]>(() => {
    const map = new Map(tagIds.map((id) => [id, id]));
    return tagOptions.filter((option) => map.has(option.id));
  }, [tagIds, tagOptions]);

  const title = t('programs-coatch.builder.library.create_dialog.title', {
    defaultValue: 'Create an exercise template',
  });
  const descriptionCopy = t('programs-coatch.builder.library.create_dialog.description', {
    defaultValue: 'Define a private exercise to reuse in your programs.',
  });

  const cancelLabel = t('programs-coatch.builder.library.create_dialog.actions.cancel', {
    defaultValue: 'Cancel',
  });
  const submitLabel = submitting
    ? t('programs-coatch.builder.library.create_dialog.actions.submitting', {
        defaultValue: 'Creating...'
      })
    : t('programs-coatch.builder.library.create_dialog.actions.submit', {
        defaultValue: 'Create',
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
      primaryMuscles: t('programs-coatch.builder.library.create_dialog.fields.primary_muscles', {
        defaultValue: 'Primary muscles',
      }),
      secondaryMuscles: t('programs-coatch.builder.library.create_dialog.fields.secondary_muscles', {
        defaultValue: 'Secondary muscles (optional)',
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

  const helperCopy = React.useMemo(
    () => ({
      primaryMuscles: t('programs-coatch.builder.library.create_dialog.helper.primary_muscles', {
        defaultValue: 'Select at least one primary muscle.',
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
        <DialogTitle>
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              aria-hidden
              sx={{
                width: 56,
                height: 56,
                borderRadius: 2,
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Add fontSize="large" />
            </Box>
            <Typography variant="h6" component="span" sx={{ fontWeight: 700 }}>
              {title}
            </Typography>
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3}>
            <Typography variant="body2" color="text.secondary">
              {descriptionCopy}
            </Typography>

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
                  fullWidth
                  options={categoryOptionsByLocale}
                  value={categoryValue}
                  onChange={(_event, option) => setCategoryId(option?.id ?? '')}
                  getOptionLabel={(option) => option.label}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  renderInput={(params) => (
                    <TextField {...params} required label={fieldCopy.category} />
                  )}
                />
              </Stack>

              <Autocomplete
                multiple
                options={muscleOptions}
                value={selectedPrimaryMuscles}
                onChange={(_event, next) => setPrimaryMuscleIds(next.map((option) => option.id))}
                loading={musclesLoading}
                getOptionLabel={(option) => option.label}
                isOptionEqualToValue={(option, value) => option.id === value.id}
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
                    label={fieldCopy.primaryMuscles}
                    helperText={helperCopy.primaryMuscles}
                  />
                )}
              />

              <Autocomplete
                multiple
                options={muscleOptions}
                value={selectedSecondaryMuscles}
                onChange={(_event, next) => setSecondaryMuscleIds(next.map((option) => option.id))}
                loading={musclesLoading}
                getOptionLabel={(option) => option.label}
                isOptionEqualToValue={(option, value) => option.id === value.id}
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
                  <TextField {...params} label={fieldCopy.secondaryMuscles} />
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
                onChange={(_event, next) => setEquipmentIds(next.map((option) => option.id))}
                loading={equipmentLoading}
                getOptionLabel={(option) => option.label}
                isOptionEqualToValue={(option, value) => option.id === value.id}
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
                onChange={(_event, next) => setTagIds(next.map((option) => option.id))}
                loading={tagsLoading}
                getOptionLabel={(option) => option.label}
                isOptionEqualToValue={(option, value) => option.id === value.id}
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
        <DialogActions>
          <Button onClick={onClose} disabled={submitting} color="inherit">
            {cancelLabel}
          </Button>
          <Button
            type="submit"
            variant="outlined"
            startIcon={<Add />}
            disabled={isSubmitDisabled}
          >
            {submitLabel}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
