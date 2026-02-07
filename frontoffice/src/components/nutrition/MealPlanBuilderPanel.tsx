// src/components/nutrition/MealPlanBuilderPanel.tsx
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { alpha, useTheme } from '@mui/material/styles';
import {
  Autocomplete,
  Box,
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

import type { AthleteSearchOption } from '@hooks/athletes/useCoachAthleteSearch';
import type { MealDay } from '@hooks/nutrition/useMealDays';
import type { Meal } from '@hooks/nutrition/useMeals';
import type { MealType } from '@hooks/nutrition/useMealTypes';
import type { MealPlan } from '@hooks/nutrition/useMealPlans';
import { useMealPlanBuilder } from '@hooks/nutrition/useMealPlanBuilder';
import { session } from '@stores/session';
import { ResponsiveButton } from '@components/common/ResponsiveButton';

import type {
  MealPlanBuilderCopy,
  MealPlanBuilderDay,
  MealPlanBuilderMeal,
} from './mealPlanBuilderTypes';
import { MealPlanBuilderCreateMealDialog } from './MealPlanBuilderCreateMealDialog';
import { MealPlanBuilderDeleteDayDialog } from './MealPlanBuilderDeleteDayDialog';
import { MealPlanBuilderEditDraftMealDialog } from './MealPlanBuilderEditDraftMealDialog';
import { MealPlanBuilderEditDayDialog } from './MealPlanBuilderEditDayDialog';
import { MealPlanBuilderPanelDraftDay } from './MealPlanBuilderPanelDraftDay';
import { MealPlanBuilderPanelLibraryDay } from './MealPlanBuilderPanelLibraryDay';
import { MealPlanBuilderPanelLibraryMeal } from './MealPlanBuilderPanelLibraryMeal';
import { MealPlanBuilderSaveDayDialog } from './MealPlanBuilderSaveDayDialog';

interface MealPlanBuilderPanelProps {
  builderCopy: MealPlanBuilderCopy;
  onCancel: () => void;
  onCreated?: (plan: MealPlan) => void;
  onUpdated?: (plan: MealPlan) => void;
  mealPlan?: MealPlan;
}

function mergeUsers(
  users: AthleteSearchOption[],
  selected: AthleteSearchOption | null,
): AthleteSearchOption[] {
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
  const { t } = useTranslation();
  const theme = useTheme();

  const {
    form,
    selectedAthlete,
    users,
    athleteInputValue,
    usersLoading,
    handleAthleteInputChange,
    daySearch,
    setDaySearch,
    mealSearch,
    setMealSearch,
    dayLibrary,
    dayLibraryTotal,
    dayLibraryLoading,
    mealLibrary,
    mealLibraryTotal,
    mealLibraryLoading,
    mealTypes,
    mealTypesLoading,
    selectedMealTypeId,
    days,
    handleSelectAthlete,
    handleFormChange,
    handleAddDayFromTemplate,
    handleCreateEmptyDay,
    handleRemoveDay,
    handleMoveDayUp,
    handleMoveDayDown,
    handleUpdateDay,
    handleSaveDayTemplate,
    handleDeleteDayTemplate,
    handleEditDayTemplate,
    handleAddMealToDay,
    handleRemoveMeal,
    handleMoveMealUp,
    handleMoveMealDown,
    handleUpdateMeal,
    handleSelectMealType,
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
    dayVisibility,
    setDayVisibility,
    mealVisibility,
    setMealVisibility,
    visibilityOptions,
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
  const [saveDayTarget, setSaveDayTarget] = React.useState<MealPlanBuilderDay | null>(null);
  const [deleteDayTarget, setDeleteDayTarget] = React.useState<MealDay | null>(null);
  const [editDayTarget, setEditDayTarget] = React.useState<MealDay | null>(null);
  const [collapsedDays, setCollapsedDays] = React.useState<Record<string, boolean>>({});
  const collapseNextTemplateDayRef = React.useRef(false);
  const previousDayIdsRef = React.useRef<Set<string>>(new Set());

  const selectedMealType = React.useMemo<MealType | null>(
    () => mealTypes.find((type) => type.id === selectedMealTypeId) ?? null,
    [mealTypes, selectedMealTypeId],
  );

  const handleMealTypeFilterChange = React.useCallback(
    (_event: React.SyntheticEvent<Element, Event>, next: MealType | null) => {
      handleSelectMealType(next);
    },
    [handleSelectMealType],
  );

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
  const dayResultCountLabel = React.useMemo(
    () =>
      dayLibraryLoading
        ? undefined
        : t('nutrition-coach.builder.day_library.result_count', {
          count: dayLibrary.length,
          total: dayLibraryTotal,
        }),
    [dayLibrary.length, dayLibraryLoading, dayLibraryTotal, t],
  );
  const mealResultCountLabel = React.useMemo(
    () =>
      mealLibraryLoading
        ? undefined
        : t('nutrition-coach.builder.meal_library.result_count', {
          count: mealLibrary.length,
          total: mealLibraryTotal,
        }),
    [mealLibrary.length, mealLibraryLoading, mealLibraryTotal, t],
  );
  const macroFormatter = React.useMemo(
    () =>
      new Intl.NumberFormat(undefined, {
        maximumFractionDigits: 1,
        minimumFractionDigits: 0,
      }),
    [],
  );
  const totalDays = React.useMemo(
    () => Math.max(days.length, 1),
    [days.length],
  );
  const nutritionAverageEntries = React.useMemo(
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
          value: macroFormatter.format(nutritionSummary.calories / totalDays),
          unit: summaryCopy?.calories_unit ?? 'kcal',
          color: theme.palette.primary.main,
        },
        {
          key: 'protein' as const,
          label: proteinLabel,
          value: macroFormatter.format(nutritionSummary.proteinGrams / totalDays),
          unit: summaryCopy?.protein_unit ?? 'g',
          color: theme.palette.info.main,
        },
        {
          key: 'carbs' as const,
          label: carbsLabel,
          value: macroFormatter.format(nutritionSummary.carbGrams / totalDays),
          unit: summaryCopy?.carbs_unit ?? 'g',
          color: theme.palette.success.main,
        },
        {
          key: 'fats' as const,
          label: fatsLabel,
          value: macroFormatter.format(nutritionSummary.fatGrams / totalDays),
          unit: summaryCopy?.fats_unit ?? 'g',
          color: theme.palette.warning.main,
        },
      ];
    },
    [
      builderCopy.structure,
      builderCopy.summary,
      macroFormatter,
      nutritionSummary.calories,
      nutritionSummary.carbGrams,
      nutritionSummary.fatGrams,
      nutritionSummary.proteinGrams,
      totalDays,
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

  const handleAddDayFromTemplateClick = React.useCallback(
    (template: MealDay) => {
      collapseNextTemplateDayRef.current = true;
      handleAddDayFromTemplate(template);
    },
    [handleAddDayFromTemplate],
  );

  const handleToggleDayMeals = React.useCallback((dayId: string) => {
    setCollapsedDays((prev) => ({
      ...prev,
      [dayId]: !(prev[dayId] ?? false),
    }));
  }, []);

  React.useEffect(() => {
    setCollapsedDays((prev) => {
      const dayIds = new Set(days.map((day) => day.uiId));
      const next: Record<string, boolean> = {};
      let mutated = false;

      Object.entries(prev).forEach(([dayId, isCollapsed]) => {
        if (dayIds.has(dayId)) {
          next[dayId] = isCollapsed;
          return;
        }
        mutated = true;
      });

      if (!mutated && Object.keys(next).length === Object.keys(prev).length) {
        return prev;
      }

      return next;
    });
  }, [days]);

  React.useEffect(() => {
    const previousDayIds = previousDayIdsRef.current;
    const currentDayIds = new Set(days.map((day) => day.uiId));

    if (collapseNextTemplateDayRef.current) {
      const addedDays = days.filter((day) => !previousDayIds.has(day.uiId));

      if (addedDays.length > 0) {
        setCollapsedDays((prev) => {
          const next = { ...prev };
          addedDays.forEach((day) => {
            next[day.uiId] = true;
          });
          return next;
        });
      }

      collapseNextTemplateDayRef.current = false;
    }

    previousDayIdsRef.current = currentDayIds;
  }, [days]);

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

  const handleOpenSaveDayDialog = React.useCallback(
    (dayId: string) => {
      const target = days.find((dayItem) => dayItem.uiId === dayId);
      if (!target) {
        return;
      }
      setSaveDayTarget(target);
    },
    [days],
  );

  const handleCloseSaveDayDialog = React.useCallback(() => {
    setSaveDayTarget(null);
  }, []);

  const handleSaveDayDialog = React.useCallback(
    async (label: string) => {
      if (!saveDayTarget) {
        return;
      }
      await handleSaveDayTemplate(saveDayTarget.uiId, label);
      setSaveDayTarget(null);
    },
    [handleSaveDayTemplate, saveDayTarget],
  );

  const handleOpenDeleteDayDialog = React.useCallback((template: MealDay) => {
    setDeleteDayTarget(template);
  }, []);

  const handleCloseDeleteDayDialog = React.useCallback(() => {
    setDeleteDayTarget(null);
  }, []);

  const handleConfirmDeleteDay = React.useCallback(async () => {
    if (!deleteDayTarget) {
      return;
    }
    await handleDeleteDayTemplate(deleteDayTarget.id);
    setDeleteDayTarget(null);
  }, [deleteDayTarget, handleDeleteDayTemplate]);

  const handleOpenEditDayDialog = React.useCallback((template: MealDay) => {
    setEditDayTarget(template);
  }, []);

  const handleCloseEditDayDialog = React.useCallback(() => {
    setEditDayTarget(null);
  }, []);

  const handleSaveEditDayDialog = React.useCallback(
    async (label: string) => {
      if (!editDayTarget) {
        return;
      }
      await handleEditDayTemplate(editDayTarget.id, label);
      setEditDayTarget(null);
    },
    [editDayTarget, handleEditDayTemplate],
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
                  {/* Left Column: Plan Configuration & Day Library */}
                  <Grid size={{ xs: 12, md: 3 }} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Card variant="outlined">
                      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          {builderCopy.config.title}
                        </Typography>
                        <Autocomplete<AthleteSearchOption>
                          options={userOptions}
                          loading={usersLoading}
                          value={selectedAthlete}
                          onChange={handleSelectAthlete}
                          inputValue={athleteInputValue}
                          onInputChange={handleAthleteInputChange}
                          isOptionEqualToValue={(option, value) => option.id === value.id}
                          getOptionLabel={(option) =>
                            `${option.first_name ?? ''} ${option.last_name ?? ''}`.trim() || option.email
                          }
                          noOptionsText={t('nutrition-coach.list.clone_dialog.no_results')}
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
                        <Stack direction="row" spacing={1.5}>
                          <TextField
                            label={builderCopy.config.start_date_label}
                            size="small"
                            fullWidth
                            type="date"
                            value={form.startDate}
                            onChange={handleFormChange('startDate')}
                            InputLabelProps={{ shrink: true }}
                          />
                          <TextField
                            label={builderCopy.config.end_date_label}
                            size="small"
                            fullWidth
                            type="date"
                            value={form.endDate}
                            onChange={handleFormChange('endDate')}
                            InputLabelProps={{ shrink: true }}
                          />
                        </Stack>
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
                            endAdornment:
                              dayResultCountLabel && dayResultCountLabel.length > 0 ? (
                                <InputAdornment
                                  position="end"
                                  sx={{ pointerEvents: 'none', color: 'text.disabled' }}
                                >
                                  <Typography
                                    color="inherit"
                                    sx={{ fontSize: 13, whiteSpace: 'nowrap' }}
                                    variant="body2"
                                  >
                                    {dayResultCountLabel}
                                  </Typography>
                                </InputAdornment>
                              ) : undefined,
                          }}
                        />
                        {builderCopy.day_library.limit_hint ? (
                          <Typography variant="caption" color="text.secondary">
                            {builderCopy.day_library.limit_hint}
                          </Typography>
                        ) : null}

                        <TextField
                          select
                          fullWidth
                          size="small"
                          label={builderCopy.day_library.secondary_filter_label}
                          value={dayVisibility}
                          onChange={(event) => setDayVisibility(event.target.value as typeof dayVisibility)}
                          sx={{ backgroundColor: theme.palette.background.default }}
                        >
                          {visibilityOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </TextField>

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
                                onAdd={handleAddDayFromTemplateClick}
                                onEdit={() => handleOpenEditDayDialog(day)}
                                onDelete={() => handleOpenDeleteDayDialog(day)}
                              />
                            ))
                          )}
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Center Column: Plan Editor */}
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
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1.5,
                              }}
                            >
                              <Stack spacing={1}>
                                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                                  {t('nutrition-coach.builder.summary.average_title')}
                                </Typography>
                                <Stack
                                  direction={{ xs: 'column', sm: 'row' }}
                                  spacing={{ xs: 1.5, sm: 3 }}
                                  useFlexGap
                                  flexWrap="wrap"
                                >
                                  {nutritionAverageEntries.map((entry) => {
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
                                <Box
                                  sx={{
                                    border: `1px dashed ${alpha(theme.palette.text.primary, 0.2)}`,
                                    borderRadius: 2,
                                    p: 2,
                                    bgcolor: alpha(theme.palette.background.default, 0.4),
                                    width: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                  }}
                                >
                                  <Stack
                                    spacing={1}
                                    alignItems="center"
                                    justifyContent="center"
                                    sx={{ minHeight: 220, width: '100%' }}
                                  >
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                      textAlign="center"
                                    >
                                      {builderCopy.structure.empty}
                                    </Typography>
                                  </Stack>
                                </Box>
                                <ResponsiveButton
                                  onClick={handleCreateEmptyDay}
                                  size="small"
                                  variant="contained"
                                  fullWidth
                                >
                                  {builderCopy.structure.add_day_label}
                                </ResponsiveButton>
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
                                    isMealsCollapsed={collapsedDays[day.uiId] ?? false}
                                    onToggleMealsCollapse={handleToggleDayMeals}
                                    onUpdateDay={handleUpdateDay}
                                    onRemoveDay={handleRemoveDay}
                                    onMoveDayUp={handleMoveDayUp}
                                    onMoveDayDown={handleMoveDayDown}
                                    onRemoveMeal={handleRemoveMeal}
                                    onMoveMealUp={handleMoveMealUp}
                                    onMoveMealDown={handleMoveMealDown}
                                    onUpdateMeal={handleUpdateMeal}
                                    onEditMeal={handleOpenDraftMealEditor}
                                    onSaveDay={handleOpenSaveDayDialog}
                                  />
                                ))}
                                <ResponsiveButton
                                  onClick={handleCreateEmptyDay}
                                  size="small"
                                  variant="contained"
                                  fullWidth
                                >
                                  {builderCopy.structure.add_day_label}
                                </ResponsiveButton>
                              </Stack>
                            )}
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>

                  {/* Right Column: Meal Library */}
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
                            endAdornment:
                              mealResultCountLabel && mealResultCountLabel.length > 0 ? (
                                <InputAdornment
                                  position="end"
                                  sx={{ pointerEvents: 'none', color: 'text.disabled' }}
                                >
                                  <Typography
                                    color="inherit"
                                    sx={{ fontSize: 13, whiteSpace: 'nowrap' }}
                                    variant="body2"
                                  >
                                    {mealResultCountLabel}
                                  </Typography>
                                </InputAdornment>
                              ) : undefined,
                          }}
                        />

                        <ResponsiveButton
                          onClick={handleOpenMealDialog}
                          size="small"
                          variant="contained"
                          fullWidth
                        >
                          {builderCopy.meal_library.create_label}
                        </ResponsiveButton>

                        <Stack direction="row" spacing={2}>
                          <Autocomplete
                            options={mealTypes}
                            loading={mealTypesLoading}
                            value={selectedMealType}
                            onChange={handleMealTypeFilterChange}
                            getOptionLabel={(option) => option.label}
                            isOptionEqualToValue={(option, value) => option.id === value.id}
                            size="small"
                            fullWidth
                            sx={{ width: '50%' }}
                            noOptionsText={builderCopy.meal_library.type_filter_no_results ?? ''}
                            clearText={builderCopy.meal_library.type_filter_clear_label}
                            renderInput={(params) => (
                              <TextField
                                {...params}
                                label={builderCopy.meal_library.type_filter_label}
                                placeholder={builderCopy.meal_library.type_filter_placeholder}
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
                            select
                            fullWidth
                            size="small"
                            label={builderCopy.meal_library.secondary_filter_label}
                            value={mealVisibility}
                            onChange={(event) => setMealVisibility(event.target.value as typeof mealVisibility)}
                            sx={{ backgroundColor: theme.palette.background.default, width: '50%' }}
                          >
                            {visibilityOptions.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Stack>
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
                                  key={meal.id}
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
                      <ResponsiveButton variant="text" color="inherit" onClick={onCancel}>
                        {builderCopy.footer.cancel}
                      </ResponsiveButton>
                    </span>
                  </Tooltip>
                  <Tooltip title={submitLabel} arrow>
                    <span style={{ display: 'inline-flex' }}>
                      <ResponsiveButton
                        color="warning"
                        disabled={isSubmitDisabled || submitting}
                        type="submit"
                        variant="contained"
                      >
                        {submitLabel}
                      </ResponsiveButton>
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
      <MealPlanBuilderSaveDayDialog
        open={Boolean(saveDayTarget)}
        dayLabel={saveDayTarget?.label ?? ''}
        onClose={handleCloseSaveDayDialog}
        onSave={handleSaveDayDialog}
      />
      <MealPlanBuilderDeleteDayDialog
        open={Boolean(deleteDayTarget)}
        dayLabel={deleteDayTarget?.label ?? ''}
        onClose={handleCloseDeleteDayDialog}
        onConfirm={handleConfirmDeleteDay}
      />
      <MealPlanBuilderEditDayDialog
        open={Boolean(editDayTarget)}
        dayLabel={editDayTarget?.label ?? ''}
        onClose={handleCloseEditDayDialog}
        onSave={handleSaveEditDayDialog}
      />
    </>
  );
}
