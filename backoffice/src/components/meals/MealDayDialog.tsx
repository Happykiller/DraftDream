// src/components/meals/MealDayDialog.tsx
import * as React from 'react';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

import type { MealVisibility } from '@hooks/useMeals';
import type { MealDay, MealDayVisibility } from '@hooks/useMealDays';

export interface MealDayDialogMealOption {
  id: string;
  slug: string;
  label: string;
  locale: string;
  visibility: MealVisibility;
}

export interface MealDayDialogValues {
  slug: string;
  locale: string;
  label: string;
  description: string;
  visibility: MealDayVisibility;
  meals: MealDayDialogMealOption[];
}

export interface MealDayDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  initial?: MealDay | null;
  mealOptions: MealDayDialogMealOption[];
  mealOptionsLoading: boolean;
  onClose: () => void;
  onSubmit: (values: MealDayDialogValues) => Promise<void> | void;
  onRefreshMeals?: () => void;
}

const DEFAULT_VALUES: MealDayDialogValues = {
  slug: '',
  locale: 'en',
  label: '',
  description: '',
  visibility: 'PRIVATE',
  meals: [],
};

function ensureMealOptions(
  snapshots: MealDay['meals'] | undefined | null,
  fallbackIds: string[] | undefined,
  options: MealDayDialogMealOption[],
  defaultLocale: string,
): MealDayDialogMealOption[] {
  const base = new Map(options.map((item) => [item.id, item]));
  const resolved: MealDayDialogMealOption[] = [];

  const ids = snapshots?.map((meal) => meal.id) ?? fallbackIds ?? [];

  ids.forEach((mealId) => {
    if (base.has(mealId)) {
      resolved.push(base.get(mealId)!);
      return;
    }

    const snapshot = snapshots?.find((item) => item.id === mealId);
    if (snapshot) {
      const enriched: MealDayDialogMealOption = {
        id: snapshot.id,
        slug: snapshot.slug,
        label: snapshot.label,
        locale: snapshot.locale ?? defaultLocale,
        visibility: snapshot.visibility,
      };
      resolved.push(enriched);
      base.set(snapshot.id, enriched);
      return;
    }

    const fallback: MealDayDialogMealOption = {
      id: mealId,
      slug: mealId,
      label: mealId,
      locale: defaultLocale,
      visibility: 'PRIVATE',
    };
    resolved.push(fallback);
  });

  return resolved;
}

export function MealDayDialog({
  open,
  mode,
  initial,
  mealOptions,
  mealOptionsLoading,
  onClose,
  onSubmit,
  onRefreshMeals,
}: MealDayDialogProps): React.JSX.Element {
  const [values, setValues] = React.useState<MealDayDialogValues>(DEFAULT_VALUES);
  const [selectedOption, setSelectedOption] = React.useState<MealDayDialogMealOption | null>(null);
  const { t } = useTranslation();
  const isEdit = mode === 'edit';

  const filteredMealOptions = React.useMemo(
    () => mealOptions.filter((option) => option.locale === values.locale),
    [mealOptions, values.locale],
  );

  React.useEffect(() => {
    if (open && isEdit && initial) {
      setValues({
        slug: initial.slug,
        locale: initial.locale,
        label: initial.label,
        description: initial.description ?? '',
        visibility: initial.visibility,
        meals: ensureMealOptions(initial.meals, initial.mealIds, mealOptions, initial.locale),
      });
      setSelectedOption(null);
      return;
    }

    if (open && !isEdit) {
      setValues(DEFAULT_VALUES);
      setSelectedOption(null);
    }
  }, [initial, isEdit, mealOptions, open]);

  const handleFieldChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setValues((prev) => ({
      ...prev,
      [name]: name === 'visibility' ? (value as MealDayVisibility) : value,
    }));
  };

  React.useEffect(() => {
    setValues((prev) => {
      const filteredMeals = prev.meals.filter((meal) => meal.locale === prev.locale);
      if (filteredMeals.length === prev.meals.length) return prev;
      return { ...prev, meals: filteredMeals };
    });
    setSelectedOption((prev) => {
      if (!prev) return prev;
      return prev.locale === values.locale ? prev : null;
    });
  }, [values.locale]);

  const handleAddMeal = () => {
    if (!selectedOption) return;
    setValues((prev) => ({
      ...prev,
      meals: [...prev.meals, selectedOption],
    }));
    setSelectedOption(null);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    setValues((prev) => {
      const next = [...prev.meals];
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= next.length) return prev;
      const temp = next[targetIndex];
      next[targetIndex] = next[index];
      next[index] = temp;
      return { ...prev, meals: next };
    });
  };

  const handleRemove = (index: number) => {
    setValues((prev) => ({
      ...prev,
      meals: prev.meals.filter((_, position) => position !== index),
    }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedSlug = values.slug.trim();
    const trimmedLabel = values.label.trim();
    if (!trimmedSlug || !trimmedLabel) return;

    await onSubmit({
      ...values,
      slug: trimmedSlug,
      label: trimmedLabel,
      description: values.description.trim(),
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="meal-day-dialog-title" fullWidth maxWidth="md">
      <DialogTitle id="meal-day-dialog-title">
        {isEdit ? t('meals.mealDays.dialog.edit_title') : t('meals.mealDays.dialog.create_title')}
      </DialogTitle>
      <DialogContent>
        <Stack component="form" spacing={3} sx={{ mt: 1 }} onSubmit={submit}>
          {/* General information */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              label={t('common.labels.slug')}
              name="slug"
              value={values.slug}
              onChange={handleFieldChange}
              required
              fullWidth
            />
            <TextField
              label={t('common.labels.label')}
              name="label"
              value={values.label}
              onChange={handleFieldChange}
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
              onChange={handleFieldChange}
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
              label={t('common.labels.visibility')}
              name="visibility"
              value={values.visibility}
              onChange={handleFieldChange}
              required
              fullWidth
            >
              <MenuItem value="PRIVATE">{t('common.visibility.private')}</MenuItem>
              <MenuItem value="PUBLIC">{t('common.visibility.public')}</MenuItem>
            </TextField>
          </Stack>

          <TextField
            label={t('common.labels.description')}
            name="description"
            value={values.description}
            onChange={handleFieldChange}
            multiline
            minRows={3}
            fullWidth
          />

          <Stack spacing={1}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'stretch', sm: 'center' }}>
              <Autocomplete
                fullWidth
                options={filteredMealOptions}
                value={selectedOption}
                loading={mealOptionsLoading}
                onChange={(_, option) => setSelectedOption(option)}
                getOptionLabel={(option) => option.label || option.slug}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t('common.labels.meals')}
                    placeholder={t('meals.mealDays.dialog.search_placeholder')}
                  />
                )}
              />

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <Button variant="outlined" onClick={handleAddMeal} disabled={!selectedOption}>
                  {t('meals.mealDays.dialog.add_meal')}
                </Button>
                {onRefreshMeals ? (
                  <Button variant="text" onClick={onRefreshMeals} disabled={mealOptionsLoading}>
                    {t('meals.mealDays.dialog.refresh_meals')}
                  </Button>
                ) : null}
              </Stack>
            </Stack>

            <Box sx={{ border: (theme) => `1px solid ${theme.palette.divider}`, borderRadius: 1, p: 1 }}>
              {values.meals.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  {t('meals.mealDays.dialog.empty_list')}
                </Typography>
              ) : (
                <List dense disablePadding>
                  {values.meals.map((meal, index) => (
                    <ListItem
                      key={`${meal.id}-${index}`}
                      secondaryAction={
                        <Stack direction="row" spacing={0.5}>
                          <IconButton
                            size="small"
                            aria-label={`move-meal-up-${index}`}
                            onClick={() => handleMove(index, 'up')}
                            disabled={index === 0}
                          >
                            <ArrowUpwardIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            aria-label={`move-meal-down-${index}`}
                            onClick={() => handleMove(index, 'down')}
                            disabled={index === values.meals.length - 1}
                          >
                            <ArrowDownwardIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            aria-label={`remove-meal-${index}`}
                            onClick={() => handleRemove(index)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      }
                    >
                      <ListItemText
                        primary={`${index + 1}. ${meal.label || meal.slug}`}
                        secondary={`${meal.slug}${meal.locale ? ` · ${meal.locale.toUpperCase()}` : ''}`}
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Box>
          </Stack>

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

