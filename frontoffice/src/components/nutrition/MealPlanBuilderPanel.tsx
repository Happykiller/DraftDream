// src/components/nutrition/MealPlanBuilderPanel.tsx
import * as React from 'react';
import { alpha, useTheme } from '@mui/material/styles';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Skeleton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { Add, Edit, Replay, Search } from '@mui/icons-material';

import type { Meal } from '@hooks/nutrition/useMeals';
import type { MealPlan } from '@hooks/nutrition/useMealPlans';

import { useMealPlanBuilder } from '@hooks/nutrition/useMealPlanBuilder';

import { session } from '@stores/session';

import type {
  MealPlanBuilderCopy,
  MealPlanBuilderDay,
  MealPlanBuilderMeal,
} from './mealPlanBuilderTypes';
import { MealPlanBuilderCreateMealDialog } from './MealPlanBuilderCreateMealDialog';
import { MealPlanBuilderEditDraftMealDialog } from './MealPlanBuilderEditDraftMealDialog';
import { MealPlanBuilderPanelDraftDay } from './MealPlanBuilderPanelDraftDay';
import { MealPlanBuilderPanelLibraryDay } from './MealPlanBuilderPanelLibraryDay';
import { MealPlanBuilderPanelLibraryMeal } from './MealPlanBuilderPanelLibraryMeal';

import type { User } from '@src/hooks/useUsers';

interface MealPlanBuilderPanelProps {
  builderCopy: MealPlanBuilderCopy;
  onCancel: () => void;
  onCreated?: (plan: MealPlan) => void;
  onUpdated?: (plan: MealPlan) => void;
  mealPlan?: MealPlan;
}

function mergeUsers(users: User[], selected: User | null): User[] {
  if (!selected) {
    return users;
  }

  const alreadyIncluded = users.some((user) => user.id === selected.id);
  if (alreadyIncluded) {
    return users;
  }

  return [selected, ...users];
}

export function MealPlanBuilderPanel({
  builderCopy,
  onCancel,
  onCreated,
  onUpdated,
  mealPlan,
}: MealPlanBuilderPanelProps): React.JSX.Element {
  const theme = useTheme();

  const {
    form,
    selectedAthlete,
    users,
    usersLoading,
    setUsersQ,
    daySearch,
    setDaySearch,
    mealSearch,
    setMealSearch,
    dayLibrary,
    dayLibraryLoading,
    mealLibrary,
    mealLibraryLoading,
    days,
    handleSelectAthlete,
    handleFormChange,
    handleAddDayFromTemplate,
    handleCreateEmptyDay,
    handleRemoveDay,
    handleMoveDayUp,
    handleMoveDayDown,
    handleUpdateDay,
    handleAddMealToDay,
    handleRemoveMeal,
    handleMoveMealUp,
    handleMoveMealDown,
    handleUpdateMeal,
    handleSubmit,
    isSubmitDisabled,
    submitting,
    mode,
    reloadMeals,
    createMeal,
    updateMeal,
    removeMeal,
    reloadMealDays,
    updatePlanName,
    nutritionSummary,
    totalMeals,
  } = useMealPlanBuilder(builderCopy, {
    onCancel,
    onCreated,
    onUpdated,
    mealPlan,
  });

  const [isMealDialogOpen, setIsMealDialogOpen] = React.useState(false);
  const [mealDialogMode, setMealDialogMode] = React.useState<'create' | 'edit'>('create');
  const [mealToEdit, setMealToEdit] = React.useState<Meal | null>(null);
  const [deletingMealId, setDeletingMealId] = React.useState<string | null>(null);
  const [draftMealEditor, setDraftMealEditor] = React.useState<{
    dayId: string;
    meal: MealPlanBuilderMeal;
    contextLabel: string;
  } | null>(null);

  const panelTitle = mode === 'edit' ? builderCopy.edit_title ?? builderCopy.title : builderCopy.title;
  const panelSubtitle =
    mode === 'edit' ? builderCopy.edit_subtitle ?? builderCopy.subtitle : builderCopy.subtitle;
  const submitLabel = mode === 'edit' ? builderCopy.footer.update ?? builderCopy.footer.submit : builderCopy.footer.submit;
  const editMealTitle = builderCopy.structure.edit_meal_title ?? builderCopy.structure.edit_meal_label;
  const editMealDescription = builderCopy.structure.edit_meal_description;
  const warningMain = theme.palette.warning.main;
  const currentUserId = session((state) => state.id);
  const totalMealsLabel = React.useMemo(() => {
    const summaryCopy = builderCopy.summary;
    if (!summaryCopy) {
      return null;
    }

    const template =
      totalMeals === 1
        ? summaryCopy.total_meals_one ?? summaryCopy.total_meals
        : totalMeals > 1
          ? summaryCopy.total_meals_other ?? summaryCopy.total_meals
          : summaryCopy.total_meals;

    if (!template) {
      return null;
    }

    return template.replace('{{count}}', String(totalMeals));
  }, [builderCopy, totalMeals]);

  const summaryBackground = React.useMemo(
    () => alpha(theme.palette.primary.main, 0.08),
    [theme.palette.primary.main],
  );
  const summaryBorder = React.useMemo(
    () => alpha(theme.palette.primary.main, 0.16),
    [theme.palette.primary.main],
  );
  const macroFormatter = React.useMemo(
    () =>
      new Intl.NumberFormat(undefined, {
        maximumFractionDigits: 1,
        minimumFractionDigits: 0,
      }),
    [],
  );
  const nutritionSummaryEntries = React.useMemo(
    () => {
      const summaryCopy = builderCopy.summary;
      const structureCopy = builderCopy.structure;

      const caloriesLabel = summaryCopy?.calories_label ?? structureCopy.calories_label;
      const proteinLabel = summaryCopy?.protein_label ?? structureCopy.protein_label;
      const carbsLabel = summaryCopy?.carbs_label ?? structureCopy.carbs_label;
      const fatsLabel = summaryCopy?.fats_label ?? structureCopy.fats_label;

      return [
        {
          key: 'calories' as const,
          label: caloriesLabel,
          value: macroFormatter.format(nutritionSummary.calories),
          unit: summaryCopy?.calories_unit ?? 'kcal',
          color: theme.palette.primary.main,
        },
        {
          key: 'protein' as const,
          label: proteinLabel,
          value: macroFormatter.format(nutritionSummary.proteinGrams),
          unit: summaryCopy?.protein_unit ?? 'g',
          color: theme.palette.info.main,
        },
        {
          key: 'carbs' as const,
          label: carbsLabel,
          value: macroFormatter.format(nutritionSummary.carbGrams),
          unit: summaryCopy?.carbs_unit ?? 'g',
          color: theme.palette.success.main,
        },
        {
          key: 'fats' as const,
          label: fatsLabel,
          value: macroFormatter.format(nutritionSummary.fatGrams),
          unit: summaryCopy?.fats_unit ?? 'g',
          color: theme.palette.warning.main,
        },
      ];
    },
    [
      builderCopy.structure,
      builderCopy.summary,
      macroFormatter,
      nutritionSummary.carbGrams,
      nutritionSummary.calories,
      nutritionSummary.fatGrams,
      nutritionSummary.proteinGrams,
      theme.palette.info.main,
      theme.palette.primary.main,
      theme.palette.success.main,
      theme.palette.warning.main,
    ],
  );

  const interactiveSurfaceSx = React.useMemo(
    () => ({
      cursor: 'pointer',
      borderRadius: 1,
      px: 0.75,
      py: 0.25,
      transition: 'background-color 120ms ease',
      '&:hover': {
        backgroundColor: alpha(warningMain, 0.08),
      },
      '&:focus-visible': {
        outline: `2px solid ${alpha(warningMain, 0.32)}`,
        outlineOffset: 2,
      },
    }),
    [warningMain],
  );

  const [isEditingPlanName, setIsEditingPlanName] = React.useState(false);
  const planNameInputRef = React.useRef<HTMLInputElement | null>(null);
  const planNameBeforeEditRef = React.useRef(form.planName);
  React.useEffect(() => {
    if (isEditingPlanName && planNameInputRef.current) {
      planNameInputRef.current.focus();
      planNameInputRef.current.select();
    }
  }, [isEditingPlanName]);

  React.useEffect(() => {
    if (!isEditingPlanName) {
      planNameBeforeEditRef.current = form.planName;
    }
  }, [form.planName, isEditingPlanName]);

  const handlePlanNameEdit = React.useCallback(() => {
    planNameBeforeEditRef.current = form.planName;
    setIsEditingPlanName(true);
  }, [form.planName]);

  const handlePlanNameCommit = React.useCallback(() => {
    if (!isEditingPlanName) {
      return;
    }

    const trimmed = form.planName.trim();
    updatePlanName(trimmed.length > 0 ? trimmed : builderCopy.config.plan_name_default);
    setIsEditingPlanName(false);
  }, [builderCopy.config.plan_name_default, form.planName, isEditingPlanName, updatePlanName]);

  const handlePlanNameCancel = React.useCallback(() => {
    const previous = planNameBeforeEditRef.current.trim();
    const fallback = previous.length > 0 ? previous : builderCopy.config.plan_name_default;
    updatePlanName(fallback);
    setIsEditingPlanName(false);
  }, [builderCopy.config.plan_name_default, updatePlanName]);

  const handlePlanNameInputKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        handlePlanNameCommit();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        handlePlanNameCancel();
      }
    },
    [handlePlanNameCancel, handlePlanNameCommit],
  );

  const handlePlanNameDisplayKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handlePlanNameEdit();
      }
    },
    [handlePlanNameEdit],
  );

  const userOptions = React.useMemo(() => mergeUsers(users, selectedAthlete), [selectedAthlete, users]);

  const handleOpenMealDialog = React.useCallback(() => {
    setMealDialogMode('create');
    setMealToEdit(null);
    setIsMealDialogOpen(true);
  }, []);

  const handleOpenEditMealDialog = React.useCallback((meal: Meal) => {
    // Surface the creation dialog in edit mode for owned meals.
    setMealDialogMode('edit');
    setMealToEdit(meal);
    setIsMealDialogOpen(true);
  }, []);

  const handleCloseMealDialog = React.useCallback(() => {
    setIsMealDialogOpen(false);
    setMealDialogMode('create');
    setMealToEdit(null);
  }, []);

  const handleDeleteMealTemplate = React.useCallback(
    async (mealId: string) => {
      setDeletingMealId(mealId);
      try {
        await removeMeal(mealId);
      } catch {
        // Feedback handled inside removeMeal via flash store.
      } finally {
        setDeletingMealId((current) => (current === mealId ? null : current));
      }
    },
    [removeMeal],
  );

  const handleMealCreated = React.useCallback(async () => {
    await reloadMeals();
  }, [reloadMeals]);

  const handleMealUpdated = React.useCallback(async () => {
    await reloadMeals();
  }, [reloadMeals]);

  const handleDaySearchChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setDaySearch(event.target.value);
    },
    [setDaySearch],
  );

  const handleMealSearchChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setMealSearch(event.target.value);
    },
    [setMealSearch],
  );

  const handleUsersSearchChange = React.useCallback(
    (_event: React.SyntheticEvent, value: string) => {
      setUsersQ(value);
    },
    [setUsersQ],
  );

  const [mealMenuAnchor, setMealMenuAnchor] = React.useState<{
    meal: Meal;
    anchor: HTMLElement;
  } | null>(null);

  const handleOpenMealMenu = React.useCallback(
    (meal: Meal) => (event: React.MouseEvent<HTMLButtonElement>) => {
      setMealMenuAnchor({ meal, anchor: event.currentTarget });
    },
    [],
  );

  const handleCloseMealMenu = React.useCallback(() => {
    setMealMenuAnchor(null);
  }, []);

  const handleAddMealFromMenu = React.useCallback(
    (dayId: string) => {
      if (!mealMenuAnchor) {
        return;
      }

      handleAddMealToDay(dayId, mealMenuAnchor.meal);
      handleCloseMealMenu();
    },
    [handleAddMealToDay, handleCloseMealMenu, mealMenuAnchor],
  );

  const handleOpenDraftMealEditor = React.useCallback(
    (day: MealPlanBuilderDay, meal: MealPlanBuilderMeal, position: number) => {
      const trimmedDayLabel = day.label.trim();
      const fallbackDayLabel = builderCopy.structure.title;
      const displayDayLabel = trimmedDayLabel.length > 0 ? day.label : fallbackDayLabel;

      setDraftMealEditor({
        dayId: day.uiId,
        meal,
        contextLabel: `${builderCopy.structure.day_prefix} ${position} • ${displayDayLabel}`,
      });
    },
    [builderCopy.structure.day_prefix, builderCopy.structure.title],
  );

  const handleCloseDraftMealEditor = React.useCallback(() => {
    setDraftMealEditor(null);
  }, []);

  const handleSubmitDraftMeal = React.useCallback(
    (patch: Partial<MealPlanBuilderMeal>) => {
      if (!draftMealEditor) {
        return;
      }

      handleUpdateMeal(draftMealEditor.dayId, draftMealEditor.meal.uiId, patch);
      setDraftMealEditor(null);
    },
    [draftMealEditor, handleUpdateMeal],
  );

  const mealDialog = (
    <MealPlanBuilderCreateMealDialog
      open={isMealDialogOpen}
      onClose={handleCloseMealDialog}
      onCreated={handleMealCreated}
      onUpdated={handleMealUpdated}
      createMeal={createMeal}
      updateMeal={updateMeal}
      meal={mealDialogMode === 'edit' ? mealToEdit : null}
    />
  );

  const draftMealDialog = (
    <MealPlanBuilderEditDraftMealDialog
      open={Boolean(draftMealEditor)}
      meal={draftMealEditor?.meal ?? null}
      title={editMealTitle}
      description={editMealDescription}
      contextLabel={draftMealEditor?.contextLabel}
      onClose={handleCloseDraftMealEditor}
      onSubmit={handleSubmitDraftMeal}
    />
  );

  return (
    <>
      {/* General information */}
      <Stack
        component="form"
        onSubmit={handleSubmit}
        sx={{
          minHeight: { xs: 'calc(100dvh - 56px)', sm: 'calc(100dvh - 64px)' },
          maxHeight: { xs: 'calc(100dvh - 56px)', sm: 'calc(100dvh - 64px)' },
          overflow: 'hidden',
          bgcolor: theme.palette.backgroundColor,
        }}
      >
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            minHeight: 0,
            px: { xs: 1.5, md: 2.5 },
            py: { xs: 2, md: 3 },
          }}
        >
          <Card
            variant="outlined"
            sx={{
              flexGrow: 1,
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
              bgcolor: theme.palette.backgroundColor,
            }}
          >
            <Box
              component="header"
              sx={{
                backgroundColor: alpha(theme.palette.warning.main, 0.08),
                borderBottom: `1px solid ${alpha(theme.palette.warning.main, 0.24)}`,
                p: 1.5,
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  aria-hidden
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: 'warning.main',
                    color: theme.palette.getContrastText(theme.palette.warning.main),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {mode === 'edit' ? <Edit fontSize="large" /> : <Add fontSize="large" />}
                </Box>
                <Stack spacing={0.5}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {panelTitle}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {panelSubtitle}
                  </Typography>
                </Stack>
              </Stack>
            </Box>

            <CardContent
              sx={{
                flexGrow: 1,
                minHeight: 0,
                display: 'flex',
                flexDirection: 'column',
                p: 0,
                '&:last-child': {
                  paddingBottom: 0,
                },
              }}
            >
              <Box sx={{ flexGrow: 1, minHeight: 0, overflow: 'auto', p: { xs: 2, md: 3 } }}>
                <Grid container columnSpacing={{ xs: 0, md: 2 }} rowSpacing={{ xs: 2, md: 0 }} sx={{ minHeight: '100%' }}>
                  <Grid size={{ xs: 12, md: 3 }} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Card variant="outlined">
                      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {builderCopy.config.title}
                        </Typography>
                        <Autocomplete<User>
                          options={userOptions}
                          loading={usersLoading}
                          value={selectedAthlete}
                          onChange={handleSelectAthlete}
                          onInputChange={handleUsersSearchChange}
                          isOptionEqualToValue={(option, value) => option.id === value.id}
                          getOptionLabel={(option) => `${option.first_name ?? ''} ${option.last_name ?? ''}`.trim() || option.email}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label={builderCopy.config.client_label}
                              placeholder={builderCopy.config.client_placeholder}
                              size="small"
                              InputProps={{
                                ...params.InputProps,
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <Search fontSize="small" color="disabled" />
                                  </InputAdornment>
                                ),
                              }}
                            />
                          )}
                        />
                        <TextField
                          label={builderCopy.config.plan_description_label}
                          value={form.description}
                          onChange={handleFormChange('description')}
                          placeholder={builderCopy.config.plan_description_placeholder}
                          multiline
                          minRows={3}
                        />
                      </CardContent>
                    </Card>

                    <Card variant="outlined" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flexGrow: 1 }}>
                        <Stack direction="row" spacing={1} alignItems="flex-start">
                          <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {builderCopy.day_library.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {builderCopy.day_library.subtitle}
                            </Typography>
                          </Box>
                          <Tooltip title={builderCopy.day_library.refresh_label ?? ''}>
                            <span>
                              <IconButton onClick={reloadMealDays} size="small" aria-label="reload-meal-days">
                                <Replay fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Stack>
                        <TextField
                          value={daySearch}
                          onChange={handleDaySearchChange}
                          placeholder={builderCopy.day_library.search_placeholder}
                          size="small"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Search fontSize="small" color="disabled" />
                              </InputAdornment>
                            ),
                          }}
                        />
                        {builderCopy.day_library.limit_hint ? (
                          <Typography variant="caption" color="text.secondary">
                            {builderCopy.day_library.limit_hint}
                          </Typography>
                        ) : null}
                        <Stack spacing={1.5} sx={{ overflow: 'auto' }}>
                          {dayLibraryLoading ? (
                            <Stack spacing={1}>
                              {Array.from({ length: 3 }).map((_, index) => (
                                <Skeleton key={index} variant="rounded" height={72} />
                              ))}
                            </Stack>
                          ) : dayLibrary.length === 0 ? (
                            <Typography color="text.secondary" variant="body2">
                              {builderCopy.day_library.empty_state}
                            </Typography>
                          ) : (
                            dayLibrary.map((day) => (
                              <MealPlanBuilderPanelLibraryDay
                                key={day.id}
                                day={day}
                                builderCopy={builderCopy}
                                onAdd={handleAddDayFromTemplate}
                              />
                            ))
                          )}
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Card variant="outlined" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, flexGrow: 1 }}>
                        <Stack spacing={2} sx={{ flexGrow: 1, minHeight: 0 }}>
                          <Stack spacing={1.5}>
                            <Stack direction="row" alignItems="center" spacing={1}>
                              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                {isEditingPlanName ? (
                                  <TextField
                                    inputRef={planNameInputRef}
                                    value={form.planName}
                                    onChange={handleFormChange('planName')}
                                    onBlur={handlePlanNameCommit}
                                    onKeyDown={handlePlanNameInputKeyDown}
                                    size="small"
                                    variant="standard"
                                    fullWidth
                                    required
                                    inputProps={{ 'aria-label': builderCopy.config.plan_name_label }}
                                  />
                                ) : (
                                  <Box
                                    sx={{
                                      ...interactiveSurfaceSx,
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: 0.75,
                                      width: 'fit-content',
                                    }}
                                    onClick={handlePlanNameEdit}
                                    onKeyDown={handlePlanNameDisplayKeyDown}
                                    tabIndex={0}
                                    role="button"
                                    aria-label={builderCopy.config.plan_name_label}
                                  >
                                    <Edit fontSize="small" color="disabled" />
                                    <Typography variant="h6" component="h2" sx={{ fontWeight: 700 }}>
                                      {form.planName}
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                              {totalMealsLabel ? (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ fontWeight: 600, whiteSpace: 'nowrap', flexShrink: 0 }}
                                >
                                  {totalMealsLabel}
                                </Typography>
                              ) : null}
                            </Stack>
                            <Box
                              sx={{
                                borderRadius: 2,
                                backgroundColor: summaryBackground,
                                border: `1px solid ${summaryBorder}`,
                                px: { xs: 1.25, md: 1.5 },
                                py: { xs: 1.25, md: 1.5 },
                              }}
                            >
                              <Stack spacing={1}>
                                {builderCopy.summary?.nutrition_title ? (
                                  <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                                    {builderCopy.summary.nutrition_title}
                                  </Typography>
                                ) : null}
                                <Stack
                                  direction={{ xs: 'column', sm: 'row' }}
                                  spacing={{ xs: 1.5, sm: 3 }}
                                  useFlexGap
                                  flexWrap="wrap"
                                >
                                  {nutritionSummaryEntries.map((entry) => {
                                    const displayValue = entry.unit
                                      ? `${entry.value}\u00a0${entry.unit}`
                                      : entry.value;

                                    return (
                                      <Stack key={entry.key} spacing={0.25} sx={{ minWidth: { sm: 88 } }}>
                                        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: entry.color }}>
                                          {displayValue}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                          {entry.label}
                                        </Typography>
                                      </Stack>
                                    );
                                  })}
                                </Stack>
                              </Stack>
                            </Box>
                          </Stack>
                          <Box sx={{ flexGrow: 1, minHeight: 0 }}>
                            {days.length === 0 ? (
                              <Stack spacing={2}>
                                <Alert severity="info">{builderCopy.structure.empty}</Alert>
                                <Button
                                  onClick={handleCreateEmptyDay}
                                  startIcon={<Add fontSize="small" />}
                                  size="small"
                                  variant="contained"
                                  fullWidth
                                >
                                  {builderCopy.structure.add_day_label}
                                </Button>
                              </Stack>
                            ) : (
                              <Stack spacing={2} sx={{ overflow: 'auto', maxHeight: '100%' }}>
                                {days.map((day, index) => (
                                  <MealPlanBuilderPanelDraftDay
                                    key={day.uiId}
                                    day={day}
                                    index={index}
                                    totalDays={days.length}
                                    builderCopy={builderCopy}
                                    onUpdateDay={handleUpdateDay}
                                    onRemoveDay={handleRemoveDay}
                                    onMoveDayUp={handleMoveDayUp}
                                    onMoveDayDown={handleMoveDayDown}
                                    onRemoveMeal={handleRemoveMeal}
                                    onMoveMealUp={handleMoveMealUp}
                                    onMoveMealDown={handleMoveMealDown}
                                    onUpdateMeal={handleUpdateMeal}
                                    onEditMeal={handleOpenDraftMealEditor}
                                  />
                                ))}
                                <Button
                                  onClick={handleCreateEmptyDay}
                                  startIcon={<Add fontSize="small" />}
                                  size="small"
                                  variant="contained"
                                  fullWidth
                                >
                                  {builderCopy.structure.add_day_label}
                                </Button>
                              </Stack>
                            )}
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>

                  <Grid size={{ xs: 12, md: 3 }} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Card variant="outlined" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, flexGrow: 1 }}>
                        <Stack direction="row" spacing={1} alignItems="flex-start">
                          <Stack spacing={0.5} sx={{ flexGrow: 1 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {builderCopy.meal_library.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {builderCopy.meal_library.subtitle}
                            </Typography>
                          </Stack>
                          <Tooltip title={builderCopy.meal_library.refresh_label ?? ''}>
                            <span>
                              <IconButton onClick={reloadMeals} size="small" aria-label="reload-meals">
                                <Replay fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Stack>
                        <TextField
                          value={mealSearch}
                          onChange={handleMealSearchChange}
                          placeholder={builderCopy.meal_library.search_placeholder}
                          size="small"
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                <Search fontSize="small" color="disabled" />
                              </InputAdornment>
                            ),
                          }}
                        />
                        <Button
                          onClick={handleOpenMealDialog}
                          size="small"
                          startIcon={<Add fontSize="small" />}
                          variant="contained"
                          fullWidth
                        >
                          {builderCopy.meal_library.create_label}
                        </Button>
                        {builderCopy.meal_library.limit_hint ? (
                          <Typography variant="caption" color="text.secondary">
                            {builderCopy.meal_library.limit_hint}
                          </Typography>
                        ) : null}
                        <Stack spacing={1.5} sx={{ overflow: 'auto' }}>
                          {mealLibraryLoading ? (
                            <Stack spacing={1}>
                              {Array.from({ length: 4 }).map((_, index) => (
                                <Skeleton key={index} variant="rounded" height={96} />
                              ))}
                            </Stack>
                          ) : mealLibrary.length === 0 ? (
                            <Typography color="text.secondary" variant="body2">
                              {builderCopy.meal_library.empty_state}
                            </Typography>
                          ) : (
                            mealLibrary.map((meal) => {
                              const isMealPublic = meal.visibility === 'PUBLIC';
                              const isMealOwnedByCurrentUser =
                                !isMealPublic && currentUserId !== null && meal.createdBy === currentUserId;
                              const isDeletingThisMeal = deletingMealId === meal.id;

                              return (
                                <MealPlanBuilderPanelLibraryMeal
                                  key={meal.id ?? meal.uiId}
                                  meal={meal}
                                  builderCopy={builderCopy}
                                  disableAdd={days.length === 0}
                                  isDeleting={isDeletingThisMeal}
                                  isPublic={isMealPublic}
                                  isOwnedByCurrentUser={isMealOwnedByCurrentUser}
                                  onOpenMenu={handleOpenMealMenu(meal)}
                                  onDelete={isMealOwnedByCurrentUser ? handleDeleteMealTemplate : undefined}
                                  onEdit={isMealOwnedByCurrentUser ? handleOpenEditMealDialog : undefined}
                                />
                              );
                            })
                          )}
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Box>

              <Divider />

              <Box component="footer" sx={{ p: 2, backgroundColor: '#e0dcdce0' }}>
                <Stack direction="row" justifyContent="flex-end" spacing={2}>
                  <Tooltip title={builderCopy.footer.cancel} arrow>
                    <span style={{ display: 'inline-flex' }}>
                      <Button variant="text" color="inherit" onClick={onCancel}>
                        {builderCopy.footer.cancel}
                      </Button>
                    </span>
                  </Tooltip>
                  <Tooltip title={submitLabel} arrow>
                    <span style={{ display: 'inline-flex' }}>
                      <Button
                        color="warning"
                        disabled={isSubmitDisabled || submitting}
                        type="submit"
                        variant="contained"
                      >
                        {submitLabel}
                      </Button>
                    </span>
                  </Tooltip>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Stack>

      <Menu
        anchorEl={mealMenuAnchor?.anchor ?? null}
        open={Boolean(mealMenuAnchor)}
        onClose={handleCloseMealMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {days.length === 0 ? (
          <MenuItem disabled>{builderCopy.meal_library.menu_empty}</MenuItem>
        ) : (
          days.map((day) => (
            <MenuItem key={day.uiId} onClick={() => handleAddMealFromMenu(day.uiId)}>
              {day.label}
            </MenuItem>
          ))
        )}
      </Menu>

      {mealDialog}
      {draftMealDialog}
    </>
  );
}
