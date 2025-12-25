// src/components/programs/ExerciseDialog.tsx
import * as React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  MenuItem,
  Stack,
  Autocomplete,
  Chip,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useDateFormatter } from '@hooks/useDateFormatter';
import type { Exercise, ExerciseVisibility } from '@hooks/useExercises';
import { VISIBILITY_OPTIONS } from '@src/commons/visibility';

// Minimal ref entity for selects
export interface RefEntity {
  id: string;
  slug: string;
  label?: string;
  locale?: string;
}

export interface ExerciseDialogValues {
  locale: string;
  label: string;
  series: string;
  repetitions: string;
  description?: string;
  instructions?: string;
  charge?: string;
  rest?: number | null;
  videoUrl?: string;
  visibility: ExerciseVisibility;
  categories: RefEntity[];
  muscles: RefEntity[];
  equipment: RefEntity[];
  tags: RefEntity[];
}

export interface ExerciseDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  title?: string;
  initial?: Exercise;
  categoryOptions: RefEntity[];
  muscleOptions: RefEntity[];
  tagOptions: RefEntity[];
  equipmentOptions: RefEntity[];
  onClose: () => void;
  onSubmit: (values: ExerciseDialogValues) => Promise<void> | void;
}

const DEFAULTS: ExerciseDialogValues = {
  locale: 'en',
  label: '',
  series: '3',
  repetitions: '10',
  description: '',
  instructions: '',
  charge: '',
  rest: null,
  videoUrl: '',
  visibility: 'PRIVATE',
  categories: [],
  muscles: [],
  equipment: [],
  tags: [],
};

export function ExerciseDialog({
  open,
  mode,
  title,
  initial,
  categoryOptions,
  muscleOptions,
  tagOptions,
  equipmentOptions,
  onClose,
  onSubmit,
}: ExerciseDialogProps): React.JSX.Element {
  const [values, setValues] = React.useState<ExerciseDialogValues>(DEFAULTS);
  const isEdit = mode === 'edit';
  const { t } = useTranslation();
  const formatDate = useDateFormatter();

  const creatorEmail = React.useMemo(() => initial?.creator?.email || '-', [initial?.creator?.email]);
  const formattedCreatedAt = React.useMemo(
    () => (initial?.createdAt ? formatDate(initial.createdAt) : '-'),
    [initial?.createdAt, formatDate],
  );
  const formattedUpdatedAt = React.useMemo(
    () => (initial?.updatedAt ? formatDate(initial.updatedAt) : '-'),
    [initial?.updatedAt, formatDate],
  );


  const toRefs = (
    entities?: Array<{ id: string; slug: string; label?: string | null; locale?: string | null }> | null,
  ): RefEntity[] => {
    return (
      entities?.map((item) => ({
        id: item.id,
        slug: item.slug,
        label: item.label ?? item.slug,
        locale: item.locale ?? undefined,
      })) ?? []
    );
  };

  const filterOptionsByLocale = React.useCallback(
    (option: RefEntity) => option.locale === values.locale,
    [values.locale],
  );

  const categoryChoices = React.useMemo(
    () => categoryOptions.filter(filterOptionsByLocale),
    [categoryOptions, filterOptionsByLocale],
  );
  const muscleChoices = React.useMemo(
    () => muscleOptions.filter(filterOptionsByLocale),
    [muscleOptions, filterOptionsByLocale],
  );
  const equipmentChoices = React.useMemo(
    () => equipmentOptions.filter(filterOptionsByLocale),
    [equipmentOptions, filterOptionsByLocale],
  );
  const tagChoices = React.useMemo(
    () => tagOptions.filter(filterOptionsByLocale),
    [tagOptions, filterOptionsByLocale],
  );

  React.useEffect(() => {
    if (initial) {
      setValues(() => ({
        ...DEFAULTS,
        locale: initial.locale,
        label: initial.label,
        series: initial.series,
        repetitions: initial.repetitions,
        description: initial.description ?? '',
        instructions: initial.instructions ?? '',
        charge: initial.charge ?? '',
        rest: initial.rest ?? null,
        videoUrl: initial.videoUrl ?? '',
        visibility: initial.visibility,
        categories: toRefs(initial.categories),
        muscles: toRefs(initial.muscles),
        equipment: toRefs(initial.equipment),
        tags: toRefs(initial.tags),
      }));
    } else {
      setValues(() => ({ ...DEFAULTS }));
    }
  }, [initial]);

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setValues((prev) => {
      if (name === 'rest') {
        return {
          ...prev,
          rest: value === '' ? null : Number(value),
        };
      }

      if (name === 'locale') {
        const nextLocale = value;
        const filterByLocale = (items: RefEntity[]) => items.filter((item) => item.locale === nextLocale);
        return {
          ...prev,
          locale: nextLocale,
          categories: filterByLocale(prev.categories),
          muscles: filterByLocale(prev.muscles),
          equipment: filterByLocale(prev.equipment),
          tags: filterByLocale(prev.tags),
        };
      }

      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (values.categories.length === 0) return;
    if (!isEdit && values.muscles.length === 0) return;
    await onSubmit(values);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="exercise-dialog-title" fullWidth maxWidth="md">
      {/* General information */}
      <DialogTitle id="exercise-dialog-title">
        {title ?? (isEdit ? t('programs.exercises.dialog.edit_title') : t('programs.exercises.dialog.create_title'))}
      </DialogTitle>
      <DialogContent>
        <Stack component="form" onSubmit={submit} spacing={2} sx={{ mt: 1 }}>
          {isEdit && initial ? (
            <Stack spacing={1.5}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Stack flex={1} spacing={0.25}>
                  <Typography variant="caption" color="text.secondary">
                    {t('common.labels.slug')}
                  </Typography>
                  <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                    {initial.slug || '-'}
                  </Typography>
                </Stack>
                <Stack flex={1} spacing={0.25}>
                  <Typography variant="caption" color="text.secondary">
                    {t('common.labels.creator')}
                  </Typography>
                  <Typography variant="body2">{creatorEmail}</Typography>
                </Stack>
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Stack flex={1} spacing={0.25}>
                  <Typography variant="caption" color="text.secondary">
                    {t('common.labels.created')}
                  </Typography>
                  <Typography variant="body2">{formattedCreatedAt}</Typography>
                </Stack>
                <Stack flex={1} spacing={0.25}>
                  <Typography variant="caption" color="text.secondary">
                    {t('common.labels.updated')}
                  </Typography>
                  <Typography variant="body2">{formattedUpdatedAt}</Typography>
                </Stack>
              </Stack>
            </Stack>
          ) : null}

          <TextField
            label={t('common.labels.label')}
            name="label"
            value={values.label}
            onChange={onChange}
            required
            fullWidth
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              select
              label={t('common.labels.locale')}
              name="locale"
              value={values.locale}
              onChange={onChange}
              required
              fullWidth
            >
              {['en', 'fr', 'es', 'de', 'it'].map((loc) => (
                <MenuItem key={loc} value={loc}>
                  {loc.toUpperCase()}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label={t('common.labels.series')}
              name="series"
              value={values.series}
              onChange={onChange}
              required
              fullWidth
            />
            <TextField
              label={t('common.labels.repetitions')}
              name="repetitions"
              value={values.repetitions}
              onChange={onChange}
              required
              fullWidth
            />
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label={t('common.labels.charge')}
              name="charge"
              value={values.charge ?? ''}
              onChange={onChange}
              fullWidth
            />
            <TextField
              type="number"
              label={t('common.labels.rest_seconds')}
              name="rest"
              value={values.rest ?? ''}
              onChange={onChange}
              fullWidth
            />
            <TextField
              label={t('common.labels.video_url')}
              name="videoUrl"
              value={values.videoUrl ?? ''}
              onChange={onChange}
              fullWidth
            />
          </Stack>

          <TextField
            label={t('common.labels.description')}
            name="description"
            value={values.description ?? ''}
            onChange={onChange}
            multiline
            minRows={2}
            fullWidth
          />
          <TextField
            label={t('common.labels.instructions')}
            name="instructions"
            value={values.instructions ?? ''}
            onChange={onChange}
            multiline
            minRows={3}
            fullWidth
          />

          {/* Visibility governs sharing scope, so keep it editable during creation and updates. */}
          <TextField
            select
            label={t('common.labels.visibility')}
            name="visibility"
            value={values.visibility}
            onChange={onChange}
            required
            fullWidth
          >
            {VISIBILITY_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {t(option.label)}
              </MenuItem>
            ))}
          </TextField>

          {/* Category anchors taxonomy, so we fail submission when it is missing. */}
          <Autocomplete
            multiple
            options={categoryChoices}
            getOptionLabel={(option) => option.label || option.slug}
            value={values.categories}
            onChange={(_, value) => setValues((prev) => ({ ...prev, categories: value }))}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderTags={(tagValue, getTagProps) =>
              tagValue.map((option, index) => (
                <Chip {...getTagProps({ index })} key={option.id} label={option.label || option.slug} />
              ))
            }
            renderInput={(params) => <TextField {...params} label={t('common.labels.category')} />}
          />

          {/* Muscles drive programming logic; coaches must confirm at least one target group. */}
          <Autocomplete
            multiple
            options={muscleChoices}
            getOptionLabel={(option) => option.label || option.slug}
            value={values.muscles}
            onChange={(_, value) => setValues((prev) => ({ ...prev, muscles: value }))}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderTags={(tagValue, getTagProps) =>
              tagValue.map((option, index) => (
                <Chip {...getTagProps({ index })} key={option.id} label={option.label || option.slug} />
              ))
            }
            renderInput={(params) => <TextField {...params} label={t('common.labels.muscles')} />}
          />

          {/* Equipment mapping ensures coaches only pick gear available in the gym inventory. */}
          <Autocomplete
            multiple
            options={equipmentChoices}
            getOptionLabel={(option) => option.label || option.slug}
            value={values.equipment}
            onChange={(_, value) => setValues((prev) => ({ ...prev, equipment: value }))}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderTags={(tagValue, getTagProps) =>
              tagValue.map((option, index) => (
                <Chip {...getTagProps({ index })} key={option.id} label={option.label || option.slug} />
              ))
            }
            renderInput={(params) => <TextField {...params} label={t('common.labels.equipment_optional')} />}
          />

          {/* Tags feed search filters, so we expose them despite being optional. */}
          <Autocomplete
            multiple
            options={tagChoices}
            getOptionLabel={(option) => option.label || option.slug}
            value={values.tags}
            onChange={(_, value) => setValues((prev) => ({ ...prev, tags: value }))}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderTags={(tagValue, getTagProps) =>
              tagValue.map((option, index) => (
                <Chip {...getTagProps({ index })} key={option.id} label={option.label || option.slug} />
              ))
            }
            renderInput={(params) => <TextField {...params} label={t('common.labels.tags_optional')} />}
          />

          <DialogActions sx={{ px: 0 }}>
            <Button onClick={onClose} color="inherit">
              {t('common.buttons.cancel')}
            </Button>
            <Button type="submit" variant="contained">
              {isEdit ? t('common.buttons.save') : t('common.buttons.create')}
            </Button>
          </DialogActions>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
