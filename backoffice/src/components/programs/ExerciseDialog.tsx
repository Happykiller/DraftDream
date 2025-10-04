// src/components/programs/ExerciseDialog.tsx
import * as React from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, MenuItem, Stack, Autocomplete, Chip
} from '@mui/material';
import type { Exercise, ExerciseLevel, ExerciseVisibility } from '@hooks/useExercises';

// Minimal ref entity for selects
export interface RefEntity { id: string; slug: string; }

export interface ExerciseDialogValues {
  // scalars
  slug: string;
  locale: string;
  name: string;
  level: ExerciseLevel;
  series: string;
  repetitions: string;
  description?: string;
  instructions?: string;
  charge?: string;
  rest?: number | null;
  videoUrl?: string;
  visibility: ExerciseVisibility;
  // relations
  category: RefEntity | null;
  primaryMuscles: RefEntity[];
  secondaryMuscles: RefEntity[];
  equipment: RefEntity[];
  tags: RefEntity[];
}

export interface ExerciseDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  initial?: Exercise; // relations not provided by API (see assumptions)
  categoryOptions: RefEntity[];
  muscleOptions: RefEntity[];
  tagOptions: RefEntity[];
  equipmentOptions: RefEntity[];
  onClose: () => void;
  onSubmit: (values: ExerciseDialogValues) => Promise<void> | void;
}

const DEFAULTS: ExerciseDialogValues = {
  slug: '', locale: 'en', name: '', level: 'BEGINNER',
  series: '3', repetitions: '10', description: '', instructions: '', charge: '', rest: null, videoUrl: '',
  visibility: 'PRIVATE',
  category: null, primaryMuscles: [], secondaryMuscles: [], equipment: [], tags: [],
};

export function ExerciseDialog({
  open, mode, initial,
  categoryOptions, muscleOptions, tagOptions, equipmentOptions,
  onClose, onSubmit,
}: ExerciseDialogProps): React.JSX.Element {
  const [values, setValues] = React.useState<ExerciseDialogValues>(DEFAULTS);
  const isEdit = mode === 'edit';

  React.useEffect(() => {
    if (isEdit && initial) {
      // ⚠ Relations cannot be pre-filled (not returned by ExerciseGql)
      setValues((v) => ({
        ...v,
        slug: initial.slug,
        locale: initial.locale,
        name: initial.name,
        level: initial.level,
        series: initial.series,
        repetitions: initial.repetitions,
        description: initial.description ?? '',
        instructions: initial.instructions ?? '',
        charge: initial.charge ?? '',
        rest: initial.rest ?? null,
        videoUrl: initial.videoUrl ?? '',
        visibility: initial.visibility,
        // relations remain empty unless you enhance API
        category: null,
        primaryMuscles: [],
        secondaryMuscles: [],
        equipment: [],
        tags: [],
      }));
    } else {
      setValues(DEFAULTS);
    }
  }, [isEdit, initial]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: name === 'rest' ? Number(value) : value }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    // simple guard for required relations on Create
    if (!isEdit) {
      if (!values.category) return;
      if (values.primaryMuscles.length === 0) return;
    }
    await onSubmit(values);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="exercise-dialog-title" fullWidth maxWidth="md">
      <DialogTitle id="exercise-dialog-title">{isEdit ? 'Edit Exercise' : 'New Exercise'}</DialogTitle>
      <DialogContent>
        <Stack component="form" onSubmit={submit} spacing={2} sx={{ mt: 1 }}>
          {/* Basic row */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label="Slug" name="slug" value={values.slug} onChange={onChange} required fullWidth inputProps={{ 'aria-label': 'exercise-slug' }} />
            <TextField label="Name" name="name" value={values.name} onChange={onChange} required fullWidth />
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField select label="Locale" name="locale" value={values.locale} onChange={onChange} required fullWidth>
              {['en', 'fr', 'es', 'de', 'it'].map(loc => <MenuItem key={loc} value={loc}>{loc}</MenuItem>)}
            </TextField>
            <TextField select label="Level" name="level" value={values.level} onChange={onChange} required fullWidth>
              {['BEGINNER', 'INTERMEDIATE', 'ADVANCED'].map(l => <MenuItem key={l} value={l}>{l}</MenuItem>)}
            </TextField>
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label="Series" name="series" value={values.series} onChange={onChange} required fullWidth />
            <TextField label="Repetitions" name="repetitions" value={values.repetitions} onChange={onChange} required fullWidth />
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField label="Charge" name="charge" value={values.charge ?? ''} onChange={onChange} fullWidth />
            <TextField type="number" label="Rest (sec)" name="rest" value={values.rest ?? ''} onChange={onChange} fullWidth />
            <TextField label="Video URL" name="videoUrl" value={values.videoUrl ?? ''} onChange={onChange} fullWidth />
          </Stack>

          <TextField label="Description" name="description" value={values.description ?? ''} onChange={onChange} multiline minRows={2} fullWidth />
          <TextField label="Instructions" name="instructions" value={values.instructions ?? ''} onChange={onChange} multiline minRows={3} fullWidth />

          {!isEdit && (
            <TextField select label="Visibility" name="visibility" value={values.visibility} onChange={onChange} required fullWidth>
              <MenuItem value="PRIVATE">PRIVATE</MenuItem>
              <MenuItem value="PUBLIC">PUBLIC</MenuItem>
            </TextField>
          )}

          {/* Relations */}
          <Autocomplete
            options={categoryOptions}
            getOptionLabel={(o) => o.slug}
            value={values.category}
            onChange={(_, v) => setValues(s => ({ ...s, category: v }))}
            renderInput={(params) => <TextField {...params} label="Category" />}
          />

          <Autocomplete
            multiple
            options={muscleOptions}
            getOptionLabel={(o) => o.slug}
            value={values.primaryMuscles}
            onChange={(_, v) => setValues(s => ({ ...s, primaryMuscles: v }))}
            renderTags={(tagValue, getTagProps) =>
              tagValue.map((option, index) => <Chip {...getTagProps({ index })} key={option.id} label={option.slug} />)
            }
            renderInput={(params) => <TextField {...params} label="Primary muscles" />}
          />

          <Autocomplete
            multiple
            options={muscleOptions}
            getOptionLabel={(o) => o.slug}
            value={values.secondaryMuscles}
            onChange={(_, v) => setValues(s => ({ ...s, secondaryMuscles: v }))}
            renderTags={(tagValue, getTagProps) =>
              tagValue.map((option, index) => <Chip {...getTagProps({ index })} key={option.id} label={option.slug} />)
            }
            renderInput={(params) => <TextField {...params} label="Secondary muscles (optional)" />}
          />

          <Autocomplete
            multiple
            options={equipmentOptions}
            getOptionLabel={(o) => o.slug}
            value={values.equipment}
            onChange={(_, v) => setValues(s => ({ ...s, equipment: v }))}
            renderTags={(tagValue, getTagProps) =>
              tagValue.map((option, index) => <Chip {...getTagProps({ index })} key={option.id} label={option.slug} />)
            }
            renderInput={(params) => <TextField {...params} label="Equipment (optional)" />}
          />

          <Autocomplete
            multiple
            options={tagOptions}
            getOptionLabel={(o) => o.slug}
            value={values.tags}
            onChange={(_, v) => setValues(s => ({ ...s, tags: v }))}
            renderTags={(tagValue, getTagProps) =>
              tagValue.map((option, index) => <Chip {...getTagProps({ index })} key={option.id} label={option.slug} />)
            }
            renderInput={(params) => <TextField {...params} label="Tags (optional)" />}
          />

          <DialogActions sx={{ px: 0 }}>
            <Button onClick={onClose} color="inherit">Cancel</Button>
            <Button type="submit" variant="contained">{isEdit ? 'Save' : 'Create'}</Button>
          </DialogActions>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
