// src/components/meals/MealDayDialog.tsx
import * as React from 'react';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Autocomplete,
  Button,
  Chip,
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
import { useDateFormatter } from '@src/hooks/useDateFormatter';

import type { MealDay } from '@hooks/useMealDays';
import { VISIBILITY_OPTIONS, type Visibility } from '@src/commons/visibility';

export interface MealDayDialogMealOption {
  id: string;
  slug: string;
  label: string;
  locale: string;
  visibility: Visibility;
}

export interface MealDayDialogValues {
  locale: string;
  label: string;
  description: string;
  visibility: Visibility;
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

  const filteredMealOptions = React.useMemo(
    () => mealOptions.filter((option) => option.locale === values.locale),
    [mealOptions, values.locale],
  );

  React.useEffect(() => {
    if (open && isEdit && initial) {
      setValues({
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
      [name]: name === 'visibility' ? (value as Visibility) : value,
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
    const trimmedLabel = values.label.trim();
    if (!trimmedLabel) return;

    await onSubmit({
      ...values,
      label: trimmedLabel,
      description: values.description.trim(),
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="meal-day-dialog-title" fullWidth maxWidth="md">
      {/* General information */}
      <DialogTitle id="meal-day-dialog-title">
        {isEdit ? t('meals.mealDays.dialog.edit_title') : t('meals.mealDays.dialog.create_title')}
      </DialogTitle>
      <DialogContent>
        <Stack component="form" spacing={3} sx={{ mt: 1 }} onSubmit={submit}>
          {/* Metadata */}
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
              {VISIBILITY_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {t(option.label)}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          <TextField
            label={t('common.labels.label')}
            name="label"
            value={values.label}
            onChange={handleFieldChange}
            required
            fullWidth
          />

          <TextField
            label={t('common.labels.description')}
            name="description"
            value={values.description}
            onChange={handleFieldChange}
            multiline
            minRows={2}
            fullWidth
          />

          <Stack spacing={1.5}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center">
              <Autocomplete
                value={selectedOption}
                onChange={(_, option) => setSelectedOption(option)}
                options={filteredMealOptions}
                loading={mealOptionsLoading}
                getOptionLabel={(option) => option.label}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderOption={(props, option) => (
                  <li {...props} key={option.id}>
                    {option.label} ({option.locale.toUpperCase()})
                  </li>
                )}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label={t('meals.mealDays.dialog.meal_placeholder')}
                    InputProps={{
                      ...params.InputProps,
                      endAdornment: (
                        <React.Fragment>
                          {params.InputProps.endAdornment}
                          <IconButton
                            size="small"
                            aria-label="refresh-meals"
                            onMouseDown={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                            }}
                            onClick={() => onRefreshMeals?.()}
                          >
                            <RefreshIcon fontSize="small" />
                          </IconButton>
                        </React.Fragment>
                      ),
                    }}
                  />
                )}
                sx={{ flex: 1 }}
              />
              <Button
                variant="outlined"
                onClick={handleAddMeal}
                disabled={!selectedOption}
                sx={{ alignSelf: { xs: 'stretch', sm: 'center' }, whiteSpace: 'nowrap' }}
              >
                {t('common.buttons.add')}
              </Button>
            </Stack>

            {values.meals.length === 0 ? (
              <Chip label={t('meals.mealDays.dialog.empty_meals')} variant="outlined" size="small" />
            ) : (
              <List dense sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                {values.meals.map((meal, index) => (
                  <ListItem
                    key={`${meal.id}-${index}`}
                    secondaryAction={
                      <Stack direction="row" spacing={0.5}>
                        <Button
                          size="small"
                          onClick={() => handleMove(index, 'up')}
                          aria-label={`move-meal-up-${meal.id}`}
                          startIcon={<ArrowUpwardIcon fontSize="inherit" />}
                          disabled={index === 0}
                        >
                          {t('common.labels.up')}
                        </Button>
                        <Button
                          size="small"
                          onClick={() => handleMove(index, 'down')}
                          aria-label={`move-meal-down-${meal.id}`}
                          startIcon={<ArrowDownwardIcon fontSize="inherit" />}
                          disabled={index === values.meals.length - 1}
                        >
                          {t('common.labels.down')}
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => handleRemove(index)}
                          aria-label={`remove-meal-${meal.id}`}
                          startIcon={<DeleteIcon fontSize="inherit" />}
                        >
                          {t('common.buttons.delete')}
                        </Button>
                      </Stack>
                    }
                  >
                    <ListItemText
                      primary={meal.label}
                      secondary={`${meal.slug} (${meal.locale.toUpperCase()})`}
                    />
                  </ListItem>
                ))}
              </List>
            )}
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

function RefreshIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 16h5v5" />
    </svg>
  );
}
