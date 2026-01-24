// src/components/nutrition/MealPlanBuilderEditDraftMealDialog.tsx
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Edit } from '@mui/icons-material';
import { Box, MenuItem, Stack, TextField, Typography } from '@mui/material';

import { useMealTypes } from '@hooks/nutrition/useMealTypes';

import { ResponsiveButton } from '@components/common/ResponsiveButton';
import { StandardDialog } from '@components/common/StandardDialog';

import type { MealPlanMealTypeSnapshot } from '@hooks/nutrition/useMealPlans';

import type { MealPlanBuilderMeal } from './mealPlanBuilderTypes';

interface MealPlanBuilderEditDraftMealDialogProps {
  open: boolean;
  meal: MealPlanBuilderMeal | null;
  title: string;
  description?: string;
  contextLabel?: string;
  onClose: () => void;
  onSubmit: (patch: Partial<MealPlanBuilderMeal>) => void;
}

interface MealDraftFormState {
  label: string;
  typeId: string;
  foods: string;
  calories: string;
  proteinGrams: string;
  carbGrams: string;
  fatGrams: string;
}

const INITIAL_FORM_STATE: MealDraftFormState = {
  label: '',
  typeId: '',
  foods: '',
  calories: '',
  proteinGrams: '',
  carbGrams: '',
  fatGrams: '',
};

function resolveMealTypeId(meal: MealPlanBuilderMeal | null): string {
  if (!meal?.type) {
    return '';
  }

  return (
    meal.type.templateMealTypeId ?? meal.type.id ?? ''
  );
}

function buildTypeSnapshot(source: MealPlanMealTypeSnapshot | undefined, fallback: MealPlanBuilderMeal | null): MealPlanMealTypeSnapshot | undefined {
  if (source) {
    return {
      id: source.id ?? undefined,
      templateMealTypeId: source.templateMealTypeId ?? undefined,

      locale: source.locale ?? undefined,
      label: source.label,
      visibility: source.visibility ?? undefined,
      icon: source.icon ?? undefined,
    };
  }

  if (fallback?.type) {
    return {
      id: fallback.type.id ?? undefined,
      templateMealTypeId: fallback.type.templateMealTypeId ?? undefined,

      locale: fallback.type.locale ?? undefined,
      label: fallback.type.label,
      visibility: fallback.type.visibility ?? undefined,
      icon: fallback.type.icon ?? undefined,
    };
  }

  return undefined;
}

export function MealPlanBuilderEditDraftMealDialog({
  open,
  meal,
  title,
  description,
  contextLabel,
  onClose,
  onSubmit,
}: MealPlanBuilderEditDraftMealDialogProps): React.JSX.Element {
  const { t, i18n } = useTranslation();
  const [form, setForm] = React.useState<MealDraftFormState>(INITIAL_FORM_STATE);

  const { items: mealTypes, loading: mealTypesLoading } = useMealTypes({
    page: 1,
    limit: 50,
    q: '',
    locale: i18n.language,
  });

  React.useEffect(() => {
    if (!open) {
      return;
    }

    if (!meal) {
      setForm(INITIAL_FORM_STATE);
      return;
    }

    setForm({
      label: meal.label,
      typeId: resolveMealTypeId(meal),
      foods: meal.foods,
      calories: String(meal.calories ?? ''),
      proteinGrams: String(meal.proteinGrams ?? ''),
      carbGrams: String(meal.carbGrams ?? ''),
      fatGrams: String(meal.fatGrams ?? ''),
    });
  }, [meal, open]);

  const handleClose = React.useCallback(() => {
    setForm(INITIAL_FORM_STATE);
    onClose();
  }, [onClose]);

  const handleChange = React.useCallback(
    (field: keyof MealDraftFormState) =>
      (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { value } = event.target;
        setForm((prev) => ({ ...prev, [field]: value }));
      },
    [],
  );

  const handleSubmit = React.useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!meal) {
        return;
      }

      const trimmedLabel = form.label.trim();
      const trimmedTypeId = form.typeId.trim();
      if (!trimmedLabel || !trimmedTypeId) {
        return;
      }

      const selectedType = mealTypes.find((type) => type.id === trimmedTypeId);
      const nextTypeSnapshot = buildTypeSnapshot(
        selectedType
          ? {
            id: selectedType.id,
            templateMealTypeId: selectedType.id,
            locale: selectedType.locale,
            label: selectedType.label,
            visibility: selectedType.visibility ?? undefined,
            icon: selectedType.icon ?? undefined,
          }
          : undefined,
        meal,
      );

      onSubmit({
        label: trimmedLabel,
        foods: form.foods.trim(),
        calories: Number(form.calories || 0),
        proteinGrams: Number(form.proteinGrams || 0),
        carbGrams: Number(form.carbGrams || 0),
        fatGrams: Number(form.fatGrams || 0),
        type: nextTypeSnapshot,
      });

      handleClose();
    },
    [form, handleClose, meal, mealTypes, onSubmit],
  );

  const isSubmitDisabled = !form.label.trim() || !form.typeId.trim();

  return (
    <StandardDialog
      open={open}
      onClose={handleClose}
      icon={<Edit fontSize="large" />}
      tone="warning"
      title={title}
      description={description}
      actions={
        <>
          <ResponsiveButton onClick={handleClose} color="inherit">
            {t('common.actions.cancel')}
          </ResponsiveButton>
          <ResponsiveButton color="warning" type="submit" variant="contained" disabled={isSubmitDisabled}>
            {t('common.actions.save')}
          </ResponsiveButton>
        </>
      }
      dialogProps={{ maxWidth: 'sm' }}
      formComponent="form"
      formProps={{ onSubmit: handleSubmit, noValidate: true }}
    >
      <Stack spacing={2} sx={{ mt: 1 }}>
        {/* General information */}
        {contextLabel ? (
          <Typography variant="body2" color="text.secondary">
            {contextLabel}
          </Typography>
        ) : null}
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
    </StandardDialog>
  );
}
