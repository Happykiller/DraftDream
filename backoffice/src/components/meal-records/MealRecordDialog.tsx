// src/components/meal-records/MealRecordDialog.tsx
import * as React from 'react';
import {
  Autocomplete,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

import { useDateFormatter } from '@hooks/useDateFormatter';
import type { MealPlan } from '@hooks/useMealPlans';
import type { MealRecord, MealRecordState } from '@hooks/useMealRecords';
import type { User } from '@hooks/useUsers';

interface Option {
  id: string;
  label: string;
}

export interface MealRecordDialogValues {
  userId: string;
  mealPlanId: string;
  mealDayId: string;
  mealId: string;
  state: MealRecordState;
}

export interface MealRecordDialogProps {
  open: boolean;
  mode: 'create' | 'edit';
  initial?: MealRecord | null;
  mealPlans: MealPlan[];
  users: User[];
  onClose: () => void;
  onSubmit: (values: MealRecordDialogValues) => Promise<void> | void;
}

const DEFAULT_VALUES: MealRecordDialogValues = {
  userId: '',
  mealPlanId: '',
  mealDayId: '',
  mealId: '',
  state: 'CREATE',
};

export function MealRecordDialog({
  open,
  mode,
  initial,
  mealPlans,
  users,
  onClose,
  onSubmit,
}: MealRecordDialogProps): React.JSX.Element {
  const [values, setValues] = React.useState<MealRecordDialogValues>(DEFAULT_VALUES);
  const [selectedMealPlanId, setSelectedMealPlanId] = React.useState<string | null>(null);
  const [selectedMealDayId, setSelectedMealDayId] = React.useState<string | null>(null);
  const [selectedMealId, setSelectedMealId] = React.useState<string | null>(null);
  const [selectedAthleteId, setSelectedAthleteId] = React.useState<string | null>(null);
  const isEdit = mode === 'edit';
  const { t } = useTranslation();
  const formatDate = useDateFormatter();

  const formattedCreatedAt = React.useMemo(
    () => (initial?.createdAt ? formatDate(initial.createdAt) : '-'),
    [formatDate, initial?.createdAt],
  );
  const formattedUpdatedAt = React.useMemo(
    () => (initial?.updatedAt ? formatDate(initial.updatedAt) : '-'),
    [formatDate, initial?.updatedAt],
  );

  const mealPlanOptions = React.useMemo<Option[]>(
    () => mealPlans.map((plan) => ({ id: plan.id, label: plan.label })),
    [mealPlans],
  );
  const athleteOptions = React.useMemo<Option[]>(
    () =>
      users.map((athlete) => ({
        id: athlete.id,
        label: `${athlete.first_name} ${athlete.last_name} (${athlete.email})`,
      })),
    [users],
  );

  const selectedMealPlan = React.useMemo(
    () => mealPlans.find((plan) => plan.id === selectedMealPlanId),
    [mealPlans, selectedMealPlanId],
  );

  const dayOptions = React.useMemo<Option[]>(() => {
    if (!selectedMealPlan) return [];
    return selectedMealPlan.days.map((day) => ({ id: day.id, label: day.label }));
  }, [selectedMealPlan]);

  const mealOptions = React.useMemo<Option[]>(() => {
    if (!selectedMealPlan || !selectedMealDayId) return [];
    const selectedDay = selectedMealPlan.days.find((day) => day.id === selectedMealDayId);
    return selectedDay?.meals.map((meal) => ({ id: meal.id, label: meal.label })) ?? [];
  }, [selectedMealDayId, selectedMealPlan]);

  const selectedMealPlanOption = React.useMemo<Option | null>(() => {
    if (!selectedMealPlanId) return null;
    return mealPlanOptions.find((option) => option.id === selectedMealPlanId)
      ?? { id: selectedMealPlanId, label: selectedMealPlanId };
  }, [mealPlanOptions, selectedMealPlanId]);

  const selectedMealDayOption = React.useMemo<Option | null>(() => {
    if (!selectedMealDayId) return null;
    return dayOptions.find((option) => option.id === selectedMealDayId)
      ?? { id: selectedMealDayId, label: selectedMealDayId };
  }, [dayOptions, selectedMealDayId]);

  const selectedMealOption = React.useMemo<Option | null>(() => {
    if (!selectedMealId) return null;
    return mealOptions.find((option) => option.id === selectedMealId)
      ?? { id: selectedMealId, label: selectedMealId };
  }, [mealOptions, selectedMealId]);

  const selectedAthleteOption = React.useMemo<Option | null>(() => {
    if (!selectedAthleteId) return null;
    return athleteOptions.find((option) => option.id === selectedAthleteId)
      ?? { id: selectedAthleteId, label: selectedAthleteId };
  }, [athleteOptions, selectedAthleteId]);

  React.useEffect(() => {
    if (!open) return;
    if (isEdit && initial) {
      setValues({
        userId: initial.userId,
        mealPlanId: initial.mealPlanId,
        mealDayId: initial.mealDayId,
        mealId: initial.mealId,
        state: initial.state,
      });
      setSelectedMealPlanId(initial.mealPlanId);
      setSelectedMealDayId(initial.mealDayId);
      setSelectedMealId(initial.mealId);
      setSelectedAthleteId(initial.userId);
      return;
    }
    setValues(DEFAULT_VALUES);
    setSelectedMealPlanId(null);
    setSelectedMealDayId(null);
    setSelectedMealId(null);
    setSelectedAthleteId(null);
  }, [initial, isEdit, open]);

  const stateOptions = React.useMemo(
    () => [
      { value: 'CREATE' as const, label: t('meals.records.states.create') },
      { value: 'DRAFT' as const, label: t('meals.records.states.draft') },
      { value: 'FINISH' as const, label: t('meals.records.states.finish') },
    ],
    [t],
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleMealPlanChange = (_: unknown, option: Option | null) => {
    setSelectedMealPlanId(option?.id ?? null);
    setSelectedMealDayId(null);
    setSelectedMealId(null);
    setValues((prev) => ({
      ...prev,
      mealPlanId: option?.id ?? '',
      mealDayId: '',
      mealId: '',
    }));
  };

  const handleMealDayChange = (_: unknown, option: Option | null) => {
    setSelectedMealDayId(option?.id ?? null);
    setSelectedMealId(null);
    setValues((prev) => ({
      ...prev,
      mealDayId: option?.id ?? '',
      mealId: '',
    }));
  };

  const handleMealChange = (_: unknown, option: Option | null) => {
    setSelectedMealId(option?.id ?? null);
    setValues((prev) => ({ ...prev, mealId: option?.id ?? '' }));
  };

  const handleAthleteChange = (_: unknown, option: Option | null) => {
    setSelectedAthleteId(option?.id ?? null);
    setValues((prev) => ({ ...prev, userId: option?.id ?? '' }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (
      !values.userId.trim()
      || !values.mealPlanId.trim()
      || !values.mealDayId.trim()
      || !values.mealId.trim()
    ) {
      return;
    }
    await onSubmit({
      ...values,
      userId: values.userId.trim(),
      mealPlanId: values.mealPlanId.trim(),
      mealDayId: values.mealDayId.trim(),
      mealId: values.mealId.trim(),
    });
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="meal-record-dialog-title"
      fullWidth
      maxWidth="md"
    >
      <DialogTitle id="meal-record-dialog-title">
        {isEdit
          ? t('meals.records.dialog.edit_title')
          : t('meals.records.dialog.create_title')}
      </DialogTitle>
      <DialogContent>
        {/* General information */}
        <Stack component="form" onSubmit={submit} spacing={2} sx={{ mt: 1 }}>
          {isEdit && initial ? (
            <Stack spacing={1.5}>
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
            select
            label={t('meals.records.labels.state')}
            name="state"
            value={values.state}
            onChange={handleChange}
            required
            fullWidth
          >
            {stateOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
          <Autocomplete
            options={mealPlanOptions}
            value={selectedMealPlanOption}
            onChange={handleMealPlanChange}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            disabled={isEdit}
            renderOption={(props, option) => (
              <li {...props} key={option.id}>
                {option.label}
              </li>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t('common.labels.meal_plan')}
                placeholder={t('meals.records.placeholders.meal_plan')}
                inputProps={{ ...params.inputProps, 'aria-label': 'meal-record-meal-plan' }}
                required
                fullWidth
              />
            )}
          />
          <Autocomplete
            options={dayOptions}
            value={selectedMealDayOption}
            onChange={handleMealDayChange}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            disabled={isEdit || !selectedMealPlanId}
            renderOption={(props, option) => (
              <li {...props} key={option.id}>
                {option.label}
              </li>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t('common.labels.meal_day')}
                placeholder={t('meals.records.placeholders.meal_day')}
                inputProps={{ ...params.inputProps, 'aria-label': 'meal-record-meal-day' }}
                required
                fullWidth
              />
            )}
          />
          <Autocomplete
            options={mealOptions}
            value={selectedMealOption}
            onChange={handleMealChange}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            disabled={isEdit || !selectedMealDayId}
            renderOption={(props, option) => (
              <li {...props} key={option.id}>
                {option.label}
              </li>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t('common.labels.meal')}
                placeholder={t('meals.records.placeholders.meal')}
                inputProps={{ ...params.inputProps, 'aria-label': 'meal-record-meal' }}
                required
                fullWidth
              />
            )}
          />
          <Autocomplete
            options={athleteOptions}
            value={selectedAthleteOption}
            onChange={handleAthleteChange}
            getOptionLabel={(option) => option.label}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            disabled={isEdit}
            renderOption={(props, option) => (
              <li {...props} key={option.id}>
                {option.label}
              </li>
            )}
            renderInput={(params) => (
              <TextField
                {...params}
                label={t('common.labels.athlete')}
                placeholder={t('meals.records.placeholders.athlete')}
                inputProps={{ ...params.inputProps, 'aria-label': 'meal-record-user' }}
                required
                fullWidth
              />
            )}
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
