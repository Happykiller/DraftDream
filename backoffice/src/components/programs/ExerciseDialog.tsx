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
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import type { Exercise, ExerciseLevel, ExerciseVisibility } from '@hooks/useExercises';

// Minimal ref entity for selects
export interface RefEntity { id: string; slug: string; label?: string; }

export interface ExerciseDialogValues {
  slug: string;
  locale: string;
  label: string;
  level: ExerciseLevel;
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
  initial?: Exercise;
  categoryOptions: RefEntity[];
  muscleOptions: RefEntity[];
  tagOptions: RefEntity[];
  equipmentOptions: RefEntity[];
  onClose: () => void;
  onSubmit: (values: ExerciseDialogValues) => Promise<void> | void;
}

const DEFAULTS: ExerciseDialogValues = {
  slug: '',
  locale: 'en',
  label: '',
  level: 'BEGINNER',
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

  const toRefs = (entities?: Array<{ id: string; slug: string; label?: string | null }> | null): RefEntity[] => {
    return entities?.map((item) => ({ id: item.id, slug: item.slug, label: item.label ?? item.slug })) ?? [];
  };

  React.useEffect(() => {
    if (isEdit && initial) {
      setValues(() => ({
        ...DEFAULTS,
        slug: initial.slug,
        locale: initial.locale,
        label: initial.label,
        level: initial.level,
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
  }, [isEdit, initial]);

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setValues((prev) => ({
      ...prev,
      [name]: name === 'rest' ? (value === '' ? null : Number(value)) : value,
    }));
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
      <DialogTitle id="exercise-dialog-title">
        {isEdit ? t('programs.exercises.dialog.edit_title') : t('programs.exercises.dialog.create_title')}
      </DialogTitle>
      <DialogContent>
        <Stack component="form" onSubmit={submit} spacing={2} sx={{ mt: 1 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            {/* Slug locks the video mapping, so editors must control it explicitly. */}
            <TextField
              label={t('common.labels.slug')}
              name="slug"
              value={values.slug}
              onChange={onChange}
              required
              fullWidth
              inputProps={{ 'aria-label': 'exercise-slug' }}
            />
            {/* Label is what trainees see, hence the dedicated field rather than inferring from slug. */}
            <TextField
              label={t('common.labels.label')}
              name="label"
              value={values.label}
              onChange={onChange}
              required
              fullWidth
            />
          </Stack>

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
            <TextField
              select
              label={t('common.labels.level')}
              name="level"
              value={values.level}
              onChange={onChange}
              required
              fullWidth
            >
              {(['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as ExerciseLevel[]).map((level) => (
                <MenuItem key={level} value={level}>
                  {t(`programs.exercises.levels.${level}`)}
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

          {/* Visibility becomes immutable post creation so historical sharing rules stay auditable. */}
          {!isEdit && (
            <TextField
              select
              label={t('common.labels.visibility')}
              name="visibility"
              value={values.visibility}
              onChange={onChange}
              required
              fullWidth
            >
              <MenuItem value="PRIVATE">{t('common.visibility.private')}</MenuItem>
              <MenuItem value="PUBLIC">{t('common.visibility.public')}</MenuItem>
            </TextField>
          )}

          {/* Category anchors taxonomy, so we fail submission when it is missing. */}
          <Autocomplete
            multiple
            options={categoryOptions}
            getOptionLabel={(option) => option.label || option.slug}
            value={values.categories}
            onChange={(_, value) => setValues((prev) => ({ ...prev, categories: value }))}
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
            options={muscleOptions}
            getOptionLabel={(option) => option.label || option.slug}
            value={values.muscles}
            onChange={(_, value) => setValues((prev) => ({ ...prev, muscles: value }))}
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
            options={equipmentOptions}
            getOptionLabel={(option) => option.label || option.slug}
            value={values.equipment}
            onChange={(_, value) => setValues((prev) => ({ ...prev, equipment: value }))}
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
            options={tagOptions}
            getOptionLabel={(option) => option.label || option.slug}
            value={values.tags}
            onChange={(_, value) => setValues((prev) => ({ ...prev, tags: value }))}
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
