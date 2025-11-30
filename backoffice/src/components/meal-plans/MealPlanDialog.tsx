// src/components/meal-plans/MealPlanDialog.tsx
import * as React from 'react';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import {
  Autocomplete,
  Box,
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

import type {
  MealPlan,
  MealPlanDaySnapshot,
  MealPlanMealSnapshot,
  MealPlanMealTypeSnapshot,
} from '@hooks/useMealPlans';
import { VISIBILITY_OPTIONS, type Visibility } from '@src/commons/visibility';

function generateClientId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `tmp-${Math.random().toString(36).slice(2, 11)}`;
}

export interface MealPlanDialogUserOption {
  id: string;
  email: string;
}

export interface MealPlanDialogMealOption {
  id: string;
  slug: string;
  label: string;
  locale: string;
  foods: string;
  calories: number;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
  description?: string | null;
  type?: MealPlanMealTypeSnapshot | null;
}

export interface MealPlanDialogDayOption {
  id: string;
  slug: string;
  label: string;
  locale: string;
  description?: string | null;
  meals: MealPlanDialogMealOption[];
}

export interface MealPlanDialogMeal extends MealPlanMealSnapshot {
  clientId: string;
}

export interface MealPlanDialogDay extends MealPlanDaySnapshot {
  clientId: string;
  meals: MealPlanDialogMeal[];
}

export interface MealPlanDialogValues {
  locale: string;
  label: string;
  description: string;
  calories: number;
  proteinGrams: number;
  carbGrams: number;
  fatGrams: number;
  days: MealPlanDialogDay[];
  user: MealPlanDialogUserOption | null;
  visibility: Visibility;
}

export interface MealPlanDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  initial?: MealPlan | null;
  mealDayOptions: MealPlanDialogDayOption[];
  mealDayOptionsLoading: boolean;
  mealOptions: MealPlanDialogMealOption[];
  mealOptionsLoading: boolean;
  userOptions: MealPlanDialogUserOption[];
  onClose: () => void;
  onSubmit: (values: MealPlanDialogValues) => Promise<void> | void;
  onRefreshMealDays?: () => void;
  onRefreshMeals?: () => void;
}

const DEFAULT_VALUES: MealPlanDialogValues = {
  locale: 'en',
  label: '',
  description: '',
  calories: 0,
  proteinGrams: 0,
  carbGrams: 0,
  fatGrams: 0,
  days: [],
  user: null,
  visibility: 'PRIVATE',
};

function cloneMeal(option: MealPlanDialogMealOption): MealPlanDialogMeal {
  return {
    clientId: generateClientId(),
    templateMealId: option.id,
    slug: option.slug,
    locale: option.locale,
    label: option.label,
    description: option.description ?? null,
    foods: option.foods,
    calories: option.calories,
    proteinGrams: option.proteinGrams,
    carbGrams: option.carbGrams,
    fatGrams: option.fatGrams,
    type: option.type
      ? {
        templateMealTypeId: option.type.templateMealTypeId ?? option.type.id,
        slug: option.type.slug,
        locale: option.type.locale,
        label: option.type.label,
        visibility: option.type.visibility ?? null,
      }
      : {
        label: option.label,
      },
  };
}

function cloneDay(option: MealPlanDialogDayOption): MealPlanDialogDay {
  return {
    clientId: generateClientId(),
    templateMealDayId: option.id,
    slug: option.slug,
    locale: option.locale,
    label: option.label,
    description: option.description ?? null,
    meals: option.meals.map(cloneMeal),
  };
}

function toDialogValues(initial: MealPlan, userOptions: MealPlanDialogUserOption[]): MealPlanDialogValues {
  const user: MealPlanDialogUserOption | null = (() => {
    if (initial.athlete) {
      const match = userOptions.find((candidate) => candidate.id === initial.athlete?.id);
      return match ?? { id: initial.athlete.id, email: initial.athlete.email };
    }
    if (!initial.userId) return null;
    const match = userOptions.find((candidate) => candidate.id === initial.userId);
    return match ?? { id: initial.userId, email: initial.userId };
  })();

  return {
    locale: initial.locale,
    label: initial.label,
    description: initial.description ?? '',
    calories: initial.calories,
    proteinGrams: initial.proteinGrams,
    carbGrams: initial.carbGrams,
    fatGrams: initial.fatGrams,
    user,
    visibility: initial.visibility ?? 'PRIVATE',
    days: initial.days.map((day) => ({
      clientId: generateClientId(),
      id: day.id,
      templateMealDayId: day.templateMealDayId ?? null,
      slug: day.slug ?? null,
      locale: day.locale ?? initial.locale,
      label: day.label,
      description: day.description ?? null,
      meals: (day.meals ?? []).map((meal) => ({
        clientId: generateClientId(),
        id: meal.id,
        templateMealId: meal.templateMealId ?? null,
        slug: meal.slug ?? null,
        locale: meal.locale ?? initial.locale,
        label: meal.label,
        description: meal.description ?? null,
        foods: meal.foods,
        calories: meal.calories,
        proteinGrams: meal.proteinGrams,
        carbGrams: meal.carbGrams,
        fatGrams: meal.fatGrams,
        type: meal.type ?? { label: meal.label },
      })),
    })),
  };
}

export function MealPlanDialog({
  open,
  mode,
  initial,
  mealDayOptions,
  mealDayOptionsLoading,
  mealOptions,
  mealOptionsLoading,
  userOptions,
  onClose,
  onSubmit,
  onRefreshMealDays,
  onRefreshMeals,
}: MealPlanDialogProps): React.JSX.Element {
  const isEdit = mode === 'edit';
  const { t } = useTranslation();
  const [values, setValues] = React.useState<MealPlanDialogValues>(DEFAULT_VALUES);
  const [selectedDay, setSelectedDay] = React.useState<MealPlanDialogDayOption | null>(null);
  const [selectedMeals, setSelectedMeals] = React.useState<Record<string, MealPlanDialogMealOption | null>>({});
  const filteredMealDayOptions = React.useMemo(
    () => mealDayOptions.filter((option) => option.locale === values.locale),
    [mealDayOptions, values.locale],
  );
  const mealOptionsByLocale = React.useMemo(() => {
    return mealOptions.reduce<Record<string, MealPlanDialogMealOption[]>>((acc, option) => {
      if (!acc[option.locale]) {
        acc[option.locale] = [];
      }
      acc[option.locale].push(option);
      return acc;
    }, {} as Record<string, MealPlanDialogMealOption[]>);
  }, [mealOptions]);

  React.useEffect(() => {
    if (open && isEdit && initial) {
      setValues(toDialogValues(initial, userOptions));
      setSelectedDay(null);
      setSelectedMeals({});
      return;
    }

    if (open && !isEdit) {
      setValues(DEFAULT_VALUES);
      setSelectedDay(null);
      setSelectedMeals({});
    }
  }, [initial, isEdit, open, userOptions]);

  React.useEffect(() => {
    setSelectedDay((prev) => {
      if (!prev) return prev;
      return prev.locale === values.locale ? prev : null;
    });
  }, [values.locale]);

  React.useEffect(() => {
    setSelectedMeals((prev) => {
      let changed = false;
      const copy = { ...prev };
      values.days.forEach((day) => {
        const dayLocale = day.locale ?? values.locale;
        const selected = prev[day.clientId];
        if (selected && selected.locale !== dayLocale) {
          copy[day.clientId] = null;
          changed = true;
        }
      });
      return changed ? copy : prev;
    });
  }, [values.days, values.locale]);

  const handleFieldChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setValues((prev) => ({
      ...prev,
      [name]:
        name === 'calories' ||
          name === 'proteinGrams' ||
          name === 'carbGrams' ||
          name === 'fatGrams'
          ? Number(value)
          : value,
    }));
  };

  const handleUserChange = (_: any, option: MealPlanDialogUserOption | null) => {
    setValues((prev) => ({
      ...prev,
      user: option,
    }));
  };

  const handleAddDay = () => {
    if (!selectedDay) return;
    setValues((prev) => ({
      ...prev,
      days: [...prev.days, cloneDay(selectedDay)],
    }));
    setSelectedDay(null);
  };

  const handleAddEmptyDay = () => {
    setValues((prev) => ({
      ...prev,
      days: [
        ...prev.days,
        {
          clientId: generateClientId(),
          label: '',
          description: null,
          locale: prev.locale,
          slug: null,
          templateMealDayId: null,
          meals: [],
        },
      ],
    }));
  };

  const handleDayFieldChange = (clientId: string, field: keyof MealPlanDialogDay, value: any) => {
    setValues((prev) => ({
      ...prev,
      days: prev.days.map((day) => {
        if (day.clientId !== clientId) return day;
        return {
          ...day,
          [field]: value,
        };
      }),
    }));
  };

  const handleMoveDay = (index: number, direction: 'up' | 'down') => {
    setValues((prev) => {
      const days = [...prev.days];
      const target = direction === 'up' ? index - 1 : index + 1;
      if (target < 0 || target >= days.length) return prev;
      const temp = days[target];
      days[target] = days[index];
      days[index] = temp;
      return { ...prev, days };
    });
  };

  const handleRemoveDay = (clientId: string) => {
    setValues((prev) => ({
      ...prev,
      days: prev.days.filter((day) => day.clientId !== clientId),
    }));
    setSelectedMeals((prev) => {
      const copy = { ...prev };
      delete copy[clientId];
      return copy;
    });
  };

  const handleSelectedMealChange = (clientId: string, option: MealPlanDialogMealOption | null) => {
    setSelectedMeals((prev) => ({
      ...prev,
      [clientId]: option,
    }));
  };

  const handleAddMealToDay = (clientId: string) => {
    const option = selectedMeals[clientId];
    if (!option) return;
    setValues((prev) => ({
      ...prev,
      days: prev.days.map((day) => {
        if (day.clientId !== clientId) return day;
        return {
          ...day,
          meals: [...day.meals, cloneMeal(option)],
        };
      }),
    }));
    setSelectedMeals((prev) => ({
      ...prev,
      [clientId]: null,
    }));
  };

  const handleRemoveMeal = (clientId: string, index: number) => {
    setValues((prev) => ({
      ...prev,
      days: prev.days.map((day) => {
        if (day.clientId !== clientId) return day;
        return {
          ...day,
          meals: day.meals.filter((_, position) => position !== index),
        };
      }),
    }));
  };

  const handleMoveMeal = (clientId: string, index: number, direction: 'up' | 'down') => {
    setValues((prev) => ({
      ...prev,
      days: prev.days.map((day) => {
        if (day.clientId !== clientId) return day;
        const meals = [...day.meals];
        const target = direction === 'up' ? index - 1 : index + 1;
        if (target < 0 || target >= meals.length) return day;
        const temp = meals[target];
        meals[target] = meals[index];
        meals[index] = temp;
        return {
          ...day,
          meals,
        };
      }),
    }));
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const label = values.label.trim();
    if (!label) return;
    if (values.calories < 0 || values.proteinGrams < 0 || values.carbGrams < 0 || values.fatGrams < 0) return;

    const sanitized: MealPlanDialogValues = {
      ...values,
      label,
      description: values.description.trim(),
      days: values.days.map((day) => ({
        ...day,
        label: day.label.trim(),
        description: day.description ? day.description.trim() : null,
        meals: day.meals.map((meal) => ({
          ...meal,
          label: meal.label.trim(),
          description: meal.description ? meal.description.trim() : null,
        })),
      })),
    };

    await onSubmit(sanitized);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} aria-labelledby="meal-plan-dialog-title" fullWidth maxWidth="lg">
      <DialogTitle id="meal-plan-dialog-title">
        {isEdit ? t('meals.mealPlans.dialog.edit_title') : t('meals.mealPlans.dialog.create_title')}
      </DialogTitle>
      <Box component="form" onSubmit={submit}>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {/* General information */}
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
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

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
              <TextField
                label={t('meals.mealPlans.fields.calories')}
                name="calories"
                type="number"
                value={values.calories}
                onChange={handleFieldChange}
                required
                fullWidth
                inputProps={{ min: 0 }}
              />
              <TextField
                label={t('meals.mealPlans.fields.protein')}
                name="proteinGrams"
                type="number"
                value={values.proteinGrams}
                onChange={handleFieldChange}
                required
                fullWidth
                inputProps={{ min: 0 }}
              />
              <TextField
                label={t('meals.mealPlans.fields.carb')}
                name="carbGrams"
                type="number"
                value={values.carbGrams}
                onChange={handleFieldChange}
                required
                fullWidth
                inputProps={{ min: 0 }}
              />
              <TextField
                label={t('meals.mealPlans.fields.fat')}
                name="fatGrams"
                type="number"
                value={values.fatGrams}
                onChange={handleFieldChange}
                required
                fullWidth
                inputProps={{ min: 0 }}
              />
            </Stack>

            <Autocomplete
              value={values.user}
              onChange={handleUserChange}
              options={userOptions}
              getOptionLabel={(option) => option.email}
              renderInput={(params) => <TextField {...params} label={t('meals.mealPlans.fields.user')} />}
              clearOnBlur
              isOptionEqualToValue={(option, value) => option.id === value.id}
            />

            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }}>
                <Autocomplete
                  value={selectedDay}
                  onChange={(_, option) => setSelectedDay(option)}
                  options={filteredMealDayOptions}
                  loading={mealDayOptionsLoading}
                  getOptionLabel={(option) => option.label}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={t('meals.mealPlans.dialog.day_placeholder')}
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <React.Fragment>
                            {params.InputProps.endAdornment}
                            <IconButton
                              size="small"
                              aria-label="refresh-meal-days"
                              onMouseDown={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                              }}
                              onClick={() => onRefreshMealDays?.()}
                            >
                              <RefreshIcon fontSize="small" />
                            </IconButton>
                          </React.Fragment>
                        ),
                      }}
                    />
                  )}
                />
                <Button variant="outlined" onClick={handleAddDay} disabled={!selectedDay}>
                  {t('meals.mealPlans.dialog.add_day')}
                </Button>
                <Button variant="text" onClick={handleAddEmptyDay}>
                  {t('meals.mealPlans.dialog.add_blank_day')}
                </Button>
              </Stack>

              {values.days.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  {t('meals.mealPlans.dialog.empty_days')}
                </Typography>
              ) : (
                values.days.map((day, dayIndex) => (
                  <Box key={day.clientId} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2 }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'flex-start' }}>
                      <Stack spacing={1} sx={{ flex: 1 }}>
                        <TextField
                          label={t('meals.mealPlans.dialog.day_label')}
                          value={day.label}
                          onChange={(event) => handleDayFieldChange(day.clientId, 'label', event.target.value)}
                          required
                        />
                        <TextField
                          label={t('common.labels.description')}
                          value={day.description ?? ''}
                          onChange={(event) => handleDayFieldChange(day.clientId, 'description', event.target.value)}
                          multiline
                          minRows={2}
                        />
                      </Stack>
                      <Stack direction="row" spacing={1}>
                        <IconButton
                          size="small"
                          aria-label={`move-day-up-${day.clientId}`}
                          onClick={() => handleMoveDay(dayIndex, 'up')}
                        >
                          <ArrowUpwardIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          aria-label={`move-day-down-${day.clientId}`}
                          onClick={() => handleMoveDay(dayIndex, 'down')}
                        >
                          <ArrowDownwardIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          aria-label={`remove-day-${day.clientId}`}
                          onClick={() => handleRemoveDay(day.clientId)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </Stack>

                    <List dense>
                      {day.meals.map((meal, mealIndex) => (
                        <ListItem
                          key={meal.clientId}
                          secondaryAction={
                            <Stack direction="row" spacing={0.5}>
                              <IconButton
                                size="small"
                                aria-label={`move-meal-up-${meal.clientId}`}
                                onClick={() => handleMoveMeal(day.clientId, mealIndex, 'up')}
                              >
                                <ArrowUpwardIcon fontSize="inherit" />
                              </IconButton>
                              <IconButton
                                size="small"
                                aria-label={`move-meal-down-${meal.clientId}`}
                                onClick={() => handleMoveMeal(day.clientId, mealIndex, 'down')}
                              >
                                <ArrowDownwardIcon fontSize="inherit" />
                              </IconButton>
                              <IconButton
                                size="small"
                                aria-label={`remove-meal-${meal.clientId}`}
                                onClick={() => handleRemoveMeal(day.clientId, mealIndex)}
                              >
                                <DeleteIcon fontSize="inherit" />
                              </IconButton>
                            </Stack>
                          }
                        >
                          <ListItemText
                            primary={
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Typography variant="subtitle2">{meal.label}</Typography>
                                <Chip size="small" label={`${meal.calories} kcal`} />
                                <Chip size="small" label={t('meals.mealPlans.dialog.macros', {
                                  protein: meal.proteinGrams,
                                  carb: meal.carbGrams,
                                  fat: meal.fatGrams,
                                })}
                                />
                              </Stack>
                            }
                            secondary={meal.foods}
                          />
                        </ListItem>
                      ))}
                    </List>

                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }}>
                      <Autocomplete
                        value={selectedMeals[day.clientId] ?? null}
                        onChange={(_, option) => handleSelectedMealChange(day.clientId, option)}
                        options={mealOptionsByLocale[day.locale ?? values.locale] ?? []}
                        loading={mealOptionsLoading}
                        getOptionLabel={(option) => option.label}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label={t('meals.mealPlans.dialog.meal_placeholder')}
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
                      />
                      <Button
                        variant="outlined"
                        onClick={() => handleAddMealToDay(day.clientId)}
                        disabled={!selectedMeals[day.clientId]}
                      >
                        {t('meals.mealPlans.dialog.add_meal')}
                      </Button>
                    </Stack>
                  </Box>
                ))
              )}
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>{t('common.buttons.cancel')}</Button>
          <Button type="submit" variant="contained">
            {isEdit ? t('common.buttons.save') : t('common.buttons.create')}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
