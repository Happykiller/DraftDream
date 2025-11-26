// src/components/nutrition/MealPlanBuilderCreateMealDialog.tsx
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Add, Edit } from '@mui/icons-material';
import {
  Box,
  Button,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';

import { useMealTypes } from '@hooks/nutrition/useMealTypes';
import type { Meal, UseMealsResult } from '@hooks/nutrition/useMeals';

import { slugify } from '@src/utils/slugify';
import { ProgramDialogLayout } from '@components/programs/ProgramDialogLayout';

interface MealPlanBuilderCreateMealDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
  createMeal: UseMealsResult['create'];
  onUpdated?: () => void;
  updateMeal: UseMealsResult['update'];
  meal?: Meal | null;
}

interface MealFormState {
  label: string;
  typeId: string;
  foods: string;
  calories: string;
  proteinGrams: string;
  carbGrams: string;
  fatGrams: string;
}

const INITIAL_FORM_STATE: MealFormState = {
  label: '',
  typeId: '',
  foods: '',
  calories: '',
  proteinGrams: '',
  carbGrams: '',
  fatGrams: '',
};

export function MealPlanBuilderCreateMealDialog({
  open,
  onClose,
  onCreated,
  onUpdated,
  createMeal,
  updateMeal,
  meal,
}: MealPlanBuilderCreateMealDialogProps): React.JSX.Element {
  const { t, i18n } = useTranslation();
  const [form, setForm] = React.useState<MealFormState>(INITIAL_FORM_STATE);
  const [submitting, setSubmitting] = React.useState(false);

  const isEditMode = Boolean(meal);

  const { items: mealTypes, loading: mealTypesLoading } = useMealTypes({
    page: 1,
    limit: 50,
    q: '',
    locale: i18n.language,
  });

  // Keep the local form state aligned with the selected meal when editing.
  React.useEffect(() => {
    if (!open) {
      return;
    }

    if (meal) {
      setForm({
        label: meal.label,
        typeId: meal.typeId,
        foods: meal.foods,
        calories: String(meal.calories ?? ''),
        proteinGrams: String(meal.proteinGrams ?? ''),
        carbGrams: String(meal.carbGrams ?? ''),
        fatGrams: String(meal.fatGrams ?? ''),
      });
      return;
    }

    setForm(INITIAL_FORM_STATE);
  }, [meal, open]);

  const handleClose = React.useCallback(() => {
    if (submitting) {
      return;
    }
    setForm(INITIAL_FORM_STATE);
    onClose();
  }, [onClose, submitting]);

  const handleChange = React.useCallback(
    (field: keyof MealFormState) =>
      (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { value } = event.target;
        setForm((prev) => ({ ...prev, [field]: value }));
      },
    [],
  );

  const handleSubmit = React.useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!form.label.trim() || !form.typeId.trim()) {
        return;
      }

      setSubmitting(true);
      try {
        if (isEditMode && meal) {
          // Persist updates to the existing meal template.
          await updateMeal({
            id: meal.id,
            slug: meal.slug,
            label: form.label.trim(),
            typeId: form.typeId,
            foods: form.foods.trim(),
            calories: Number(form.calories || 0),
            proteinGrams: Number(form.proteinGrams || 0),
            carbGrams: Number(form.carbGrams || 0),
            fatGrams: Number(form.fatGrams || 0),
            visibility: meal.visibility,
            locale: meal.locale,
          });
          setForm(INITIAL_FORM_STATE);
          onUpdated?.();
          onClose();
          return;
        }

        await createMeal({
          slug: slugify(form.label, `${Date.now()}`),
          label: form.label.trim(),
          locale: i18n.language,
          typeId: form.typeId,
          foods: form.foods.trim(),
          calories: Number(form.calories || 0),
          proteinGrams: Number(form.proteinGrams || 0),
          carbGrams: Number(form.carbGrams || 0),
          fatGrams: Number(form.fatGrams || 0),
          visibility: 'PRIVATE',
        });
        setForm(INITIAL_FORM_STATE);
        onCreated?.();
        onClose();
      } catch (caught: unknown) {
        console.error('[MealPlanBuilderCreateMealDialog] Failed to submit meal', caught);
      } finally {
        setSubmitting(false);
      }
    },
    [createMeal, form, i18n.language, isEditMode, meal, onClose, onCreated, onUpdated, updateMeal],
  );

  const actions = (
    <>
      <Button onClick={handleClose} disabled={submitting} color="inherit">
        {t('common.actions.cancel')}
      </Button>
      <Button
        color="warning"
        disabled={submitting || !form.label.trim() || !form.typeId.trim()}
        startIcon={isEditMode ? <Edit /> : <Add />}
        type="submit"
        variant="contained"
      >
        {t(isEditMode ? 'common.actions.save' : 'common.actions.create')}
      </Button>
    </>
  );

  return (
    <ProgramDialogLayout
      open={open}
      onClose={submitting ? undefined : handleClose}
      icon={isEditMode ? <Edit fontSize="large" /> : <Add fontSize="large" />}
      tone="warning"
      title={t(
        isEditMode ? 'nutrition-coach.builder.meal_library.edit_title' : 'nutrition-coach.builder.meal_library.create_title',
      )}
      actions={actions}
      dialogProps={{ maxWidth: 'sm' }}
      formComponent="form"
      formProps={{ onSubmit: handleSubmit, noValidate: true }}
    >
      <Stack spacing={2} sx={{ mt: 1 }}>
        {/* General information */}
        <TextField
          label={t('nutrition-coach.builder.meal_library.name_label')}
          value={form.label}
          onChange={handleChange('label')}
          required
          autoFocus
        />
        <TextField
          select
          label={t('nutrition-coach.builder.meal_library.type_label')}
          value={form.typeId}
          onChange={handleChange('typeId')}
          required
          disabled={mealTypesLoading}
        >
          {mealTypes.map((type) => (
            <MenuItem key={type.id} value={type.id}>
              {type.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label={t('nutrition-coach.builder.meal_library.foods_label')}
          value={form.foods}
          onChange={handleChange('foods')}
          multiline
          minRows={3}
        />
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
            gap: 2,
          }}
        >
          <TextField
            label={t('nutrition-coach.builder.meal_library.calories_label')}
            value={form.calories}
            onChange={handleChange('calories')}
            type="number"
            inputProps={{ min: 0 }}
          />
          <TextField
            label={t('nutrition-coach.builder.meal_library.protein_label')}
            value={form.proteinGrams}
            onChange={handleChange('proteinGrams')}
            type="number"
            inputProps={{ min: 0 }}
          />
          <TextField
            label={t('nutrition-coach.builder.meal_library.carbs_label')}
            value={form.carbGrams}
            onChange={handleChange('carbGrams')}
            type="number"
            inputProps={{ min: 0 }}
          />
          <TextField
            label={t('nutrition-coach.builder.meal_library.fats_label')}
            value={form.fatGrams}
            onChange={handleChange('fatGrams')}
            type="number"
            inputProps={{ min: 0 }}
          />
        </Box>
      </Stack>
    </ProgramDialogLayout>
  );
}
