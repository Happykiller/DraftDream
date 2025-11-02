// src/components/meals/MealDialog.tsx
import * as React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

import type { Meal, MealVisibility } from '@hooks/useMeals';
import type { MealType } from '@hooks/useMealTypes';

export interface MealDialogSubmitValues {
  slug: string;
  label: string;
  locale: string;
  typeId: string;
  foods: string;
  calories: number;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
  visibility: MealVisibility;
}

export interface MealDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  initial?: Meal;
  mealTypes: MealType[];
  mealTypesLoading: boolean;
  onClose: () => void;
  onSubmit: (values: MealDialogSubmitValues) => Promise<void> | void;
}

interface MealDialogState {
  slug: string;
  label: string;
  locale: string;
  typeId: string;
  foods: string;
  calories: string;
  proteinGrams: string;
  carbGrams: string;
  fatGrams: string;
  visibility: MealVisibility;
}

const DEFAULT_STATE: MealDialogState = {
  slug: '',
  label: '',
  locale: 'en',
  typeId: '',
  foods: '',
  calories: '0',
  proteinGrams: '0',
  carbGrams: '0',
  fatGrams: '0',
  visibility: 'PRIVATE',
};

export function MealDialog({
  open,
  mode,
  initial,
  mealTypes,
  mealTypesLoading,
  onClose,
  onSubmit,
}: MealDialogProps): React.JSX.Element {
  const [values, setValues] = React.useState<MealDialogState>(() => ({ ...DEFAULT_STATE }));
  const { t } = useTranslation();
  const isEdit = mode === 'edit';

  React.useEffect(() => {
    if (isEdit && initial) {
      setValues({
        slug: initial.slug,
        label: initial.label,
        locale: initial.locale,
        typeId: initial.typeId,
        foods: initial.foods,
        calories: String(initial.calories ?? 0),
        proteinGrams: String(initial.proteinGrams ?? 0),
        carbGrams: String(initial.carbGrams ?? 0),
        fatGrams: String(initial.fatGrams ?? 0),
        visibility: initial.visibility,
      });
    } else {
      setValues(() => ({ ...DEFAULT_STATE }));
    }
  }, [initial, isEdit]);

  React.useEffect(() => {
    if (!isEdit && open && !values.typeId && mealTypes.length > 0) {
      setValues((prev) => ({ ...prev, typeId: prev.typeId || mealTypes[0].id }));
    }
  }, [isEdit, mealTypes, open, values.typeId]);

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setValues((prev) => ({
      ...prev,
      [name]:
        name === 'visibility'
          ? (value as MealVisibility)
          : value,
    }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    await onSubmit({
      slug: values.slug,
      label: values.label,
      locale: values.locale,
      typeId: values.typeId,
      foods: values.foods,
      calories: Number(values.calories || 0),
      proteinGrams: Number(values.proteinGrams || 0),
      carbGrams: Number(values.carbGrams || 0),
      fatGrams: Number(values.fatGrams || 0),
      visibility: values.visibility,
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="meal-dialog-title" fullWidth maxWidth="md">
      <DialogTitle id="meal-dialog-title">
        {isEdit ? t('meals.meals.dialog.edit_title') : t('meals.meals.dialog.create_title')}
      </DialogTitle>
      <DialogContent>
        <Stack component="form" onSubmit={submit} spacing={2} sx={{ mt: 1 }}>
          {/* General information */}
          <TextField
            label={t('common.labels.slug')}
            name="slug"
            value={values.slug}
            onChange={onChange}
            inputProps={{ 'aria-label': 'meal-slug' }}
            required
            fullWidth
          />
          <TextField
            label={t('common.labels.label')}
            name="label"
            value={values.label}
            onChange={onChange}
            inputProps={{ 'aria-label': 'meal-label' }}
            required
            fullWidth
          />
          <TextField
            select
            label={t('common.labels.locale')}
            name="locale"
            value={values.locale}
            onChange={onChange}
            required
            fullWidth
          >
            {['en', 'fr', 'es', 'de', 'it'].map((locale) => (
              <MenuItem key={locale} value={locale}>
                {locale.toUpperCase()}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label={t('common.labels.type')}
            name="typeId"
            value={values.typeId}
            onChange={onChange}
            required
            fullWidth
            disabled={mealTypesLoading && mealTypes.length === 0}
          >
            {mealTypes.map((type) => (
              <MenuItem key={type.id} value={type.id}>
                {`${type.label} (${type.locale.toUpperCase()})`}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label={t('common.labels.foods')}
            name="foods"
            value={values.foods}
            onChange={onChange}
            inputProps={{ 'aria-label': 'meal-foods' }}
            required
            fullWidth
            multiline
            minRows={3}
          />
          <TextField
            label={t('common.labels.calories')}
            name="calories"
            value={values.calories}
            onChange={onChange}
            inputProps={{ 'aria-label': 'meal-calories', min: 0 }}
            required
            fullWidth
            type="number"
          />
          <TextField
            label={t('common.labels.protein_grams')}
            name="proteinGrams"
            value={values.proteinGrams}
            onChange={onChange}
            inputProps={{ 'aria-label': 'meal-protein', min: 0 }}
            required
            fullWidth
            type="number"
          />
          <TextField
            label={t('common.labels.carb_grams')}
            name="carbGrams"
            value={values.carbGrams}
            onChange={onChange}
            inputProps={{ 'aria-label': 'meal-carbs', min: 0 }}
            required
            fullWidth
            type="number"
          />
          <TextField
            label={t('common.labels.fat_grams')}
            name="fatGrams"
            value={values.fatGrams}
            onChange={onChange}
            inputProps={{ 'aria-label': 'meal-fat', min: 0 }}
            required
            fullWidth
            type="number"
          />
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

          <DialogActions sx={{ px: 0 }}>
            <Button onClick={onClose} color="inherit">
              {t('common.buttons.cancel')}
            </Button>
            <Button type="submit" variant="contained" disabled={!values.typeId}>
              {isEdit ? t('common.buttons.save') : t('common.buttons.create')}
            </Button>
          </DialogActions>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
