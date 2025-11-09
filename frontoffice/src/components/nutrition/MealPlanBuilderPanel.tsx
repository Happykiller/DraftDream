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
  Chip,
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
import type { SvgIconComponent } from '@mui/icons-material';
import {
  Add,
  ArrowDownward,
  ArrowUpward,
  BrunchDining,
  CalendarMonth,
  Delete,
  DinnerDining,
  Edit,
  EggAlt,
  LunchDining,
  Public,
  RamenDining,
  Replay,
  Search,
  SoupKitchen,
} from '@mui/icons-material';

import type { Meal } from '@hooks/nutrition/useMeals';
import type { MealDay } from '@hooks/nutrition/useMealDays';
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

import type { User } from '@src/hooks/useUsers';

interface MealPlanBuilderPanelProps {
  builderCopy: MealPlanBuilderCopy;
  onCancel: () => void;
  onCreated?: (plan: MealPlan) => void;
  onUpdated?: (plan: MealPlan) => void;
  mealPlan?: MealPlan;
}

function formatMealSummary(meal: MealPlanBuilderMeal): string {
  return `${meal.calories} cal • ${meal.proteinGrams}g P • ${meal.carbGrams}g G • ${meal.fatGrams}g L`;
}

const MEAL_ICON_COMPONENTS: readonly SvgIconComponent[] = [
  BrunchDining,
  DinnerDining,
  EggAlt,
  LunchDining,
  RamenDining,
  SoupKitchen,
];

function computeMealIconIndex(reference: string): number {
  let hash = 0;

  for (let index = 0; index < reference.length; index += 1) {
    hash = (hash * 31 + reference.charCodeAt(index)) >>> 0;
  }

  return hash % MEAL_ICON_COMPONENTS.length;
}

function getMealIcon(reference: string): SvgIconComponent {
  return MEAL_ICON_COMPONENTS[computeMealIconIndex(reference)];
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
    selectedDayId,
    days,
    handleSelectAthlete,
    handleFormChange,
    handleSelectDay,
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
  const mealIconColor = alpha(theme.palette.secondary.main, 0.5);
  const warningMain = theme.palette.warning.main;
  const currentUserId = session((state) => state.id);

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
  const [editingDayField, setEditingDayField] = React.useState<{
    dayId: string;
    field: 'label' | 'description';
  } | null>(null);
  const dayFieldRefs = React.useRef(new Map<string, HTMLInputElement | HTMLTextAreaElement>());
  const dayFieldPreviousValues = React.useRef(new Map<string, string>());

  const getDayFieldKey = React.useCallback((dayId: string, field: 'label' | 'description') => `${dayId}:${field}`, []);

  const registerDayFieldRef = React.useCallback(
    (dayId: string, field: 'label' | 'description') =>
      (node: HTMLInputElement | HTMLTextAreaElement | null) => {
        const key = getDayFieldKey(dayId, field);

        if (node) {
          dayFieldRefs.current.set(key, node);
        } else {
          dayFieldRefs.current.delete(key);
        }
      },
    [getDayFieldKey],
  );

  React.useEffect(() => {
    if (isEditingPlanName && planNameInputRef.current) {
      planNameInputRef.current.focus();
      planNameInputRef.current.select();
    }
  }, [isEditingPlanName]);

  React.useEffect(() => {
    if (!editingDayField) {
      return;
    }

    const key = getDayFieldKey(editingDayField.dayId, editingDayField.field);
    const input = dayFieldRefs.current.get(key);

    if (input) {
      input.focus();
      input.select();
    }
  }, [editingDayField, getDayFieldKey]);

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

  const handleStartDayFieldEdit = React.useCallback(
    (dayId: string, field: 'label' | 'description', currentValue: string) => {
      const key = getDayFieldKey(dayId, field);
      dayFieldPreviousValues.current.set(key, currentValue);
      setEditingDayField({ dayId, field });
    },
    [getDayFieldKey],
  );

  const handleDayFieldCommit = React.useCallback(
    (dayId: string, field: 'label' | 'description', value: string) => {
      if (!editingDayField || editingDayField.dayId !== dayId || editingDayField.field !== field) {
        return;
      }

      const trimmedValue = value.trim();

      if (field === 'label') {
        handleUpdateDay(dayId, { label: trimmedValue });
      } else {
        handleUpdateDay(dayId, { description: trimmedValue });
      }

      const key = getDayFieldKey(dayId, field);
      dayFieldPreviousValues.current.delete(key);
      setEditingDayField(null);
    },
    [editingDayField, getDayFieldKey, handleUpdateDay],
  );

  const handleDayFieldCancel = React.useCallback(
    (dayId: string, field: 'label' | 'description') => {
      const key = getDayFieldKey(dayId, field);
      const previous = dayFieldPreviousValues.current.get(key);

      dayFieldPreviousValues.current.delete(key);

      if (typeof previous === 'string') {
        if (field === 'label') {
          handleUpdateDay(dayId, { label: previous });
        } else {
          handleUpdateDay(dayId, { description: previous });
        }
      }

      if (editingDayField && editingDayField.dayId === dayId && editingDayField.field === field) {
        setEditingDayField(null);
      }
    },
    [editingDayField, getDayFieldKey, handleUpdateDay],
  );

  const handleDayFieldDisplayKeyDown = React.useCallback(
    (dayId: string, field: 'label' | 'description', currentValue: string) =>
      (event: React.KeyboardEvent<HTMLElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleStartDayFieldEdit(dayId, field, currentValue);
        }
      },
    [handleStartDayFieldEdit],
  );

  const handleDayFieldBlur = React.useCallback(
    (dayId: string, field: 'label' | 'description') =>
      (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        handleDayFieldCommit(dayId, field, event.currentTarget.value);
      },
    [handleDayFieldCommit],
  );

  const handleDayFieldInputKeyDown = React.useCallback(
    (dayId: string, field: 'label' | 'description') =>
      (event: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          handleDayFieldCancel(dayId, field);
          return;
        }

        if (event.key === 'Enter' && (field === 'label' || !event.shiftKey)) {
          event.preventDefault();
          handleDayFieldCommit(dayId, field, event.currentTarget.value);
        }
      },
    [handleDayFieldCancel, handleDayFieldCommit],
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
    (mealId: string) =>
      async () => {
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

  const handleAddDay = React.useCallback(
    (day: MealDay) => () => {
      handleAddDayFromTemplate(day);
    },
    [handleAddDayFromTemplate],
  );

  const handleRemoveDayClick = React.useCallback(
    (dayId: string) => () => {
      handleRemoveDay(dayId);
    },
    [handleRemoveDay],
  );

  const handleMoveDay = React.useCallback(
    (direction: 'up' | 'down', dayId: string) => () => {
      if (direction === 'up') {
        handleMoveDayUp(dayId);
        return;
      }
      handleMoveDayDown(dayId);
    },
    [handleMoveDayDown, handleMoveDayUp],
  );

  const handleRemoveMealClick = React.useCallback(
    (dayId: string, mealId: string) => () => {
      handleRemoveMeal(dayId, mealId);
    },
    [handleRemoveMeal],
  );

  const handleMoveMeal = React.useCallback(
    (direction: 'up' | 'down', dayId: string, mealId: string) => () => {
      if (direction === 'up') {
        handleMoveMealUp(dayId, mealId);
        return;
      }
      handleMoveMealDown(dayId, mealId);
    },
    [handleMoveMealDown, handleMoveMealUp],
  );

  const handleOpenDraftMealEditor = React.useCallback(
    (day: MealPlanBuilderDay, meal: MealPlanBuilderMeal, position: number) => () => {
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

  const renderMealCard = React.useCallback(
    (day: MealPlanBuilderDay, meal: MealPlanBuilderMeal, index: number) => {
      const trimmedMealLabel = meal.label.trim();
      const displayMealLabel = trimmedMealLabel.length > 0 ? meal.label : builderCopy.structure.meal_prefix;

      return (
        <Card key={meal.uiId} variant="outlined">
          <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
            <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {builderCopy.structure.meal_prefix} {index + 1}
              </Typography>
              <Stack direction="row" spacing={0.5}>
              <Tooltip title={builderCopy.structure.move_meal_up_label}>
                <span>
                  <IconButton onClick={handleMoveMeal('up', day.uiId, meal.uiId)} size="small" disabled={index === 0}>
                    <ArrowUpward fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title={builderCopy.structure.move_meal_down_label}>
                <span>
                  <IconButton
                    onClick={handleMoveMeal('down', day.uiId, meal.uiId)}
                    size="small"
                    disabled={index === day.meals.length - 1}
                  >
                    <ArrowDownward fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title={builderCopy.structure.edit_meal_label}>
                <span>
                  <IconButton
                    onClick={handleOpenDraftMealEditor(day, meal, index + 1)}
                    size="small"
                    aria-label="edit-draft-meal"
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
              <Tooltip title={builderCopy.structure.remove_meal_label}>
                <span>
                  <IconButton onClick={handleRemoveMealClick(day.uiId, meal.uiId)} size="small">
                    <Delete fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
            </Stack>
          </Stack>

          <Stack spacing={0.75}>
            <Stack direction="row" spacing={0.75} alignItems="center" sx={{ minWidth: 0 }}>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {displayMealLabel}
              </Typography>
              {meal.type?.label ? <Chip label={meal.type.label} variant="outlined" size="small" /> : null}
            </Stack>
            {meal.foods ? (
              <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                {meal.foods}
              </Typography>
            ) : null}
            {meal.description ? (
              <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-line' }}>
                {meal.description}
              </Typography>
            ) : null}
            <Typography variant="caption" color="text.secondary">
              {formatMealSummary(meal)}
            </Typography>
          </Stack>
        </CardContent>
        </Card>
      );
    },
    [builderCopy, handleMoveMeal, handleOpenDraftMealEditor, handleRemoveMealClick],
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
              bgcolor: theme.palette.background.default,
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
                        <Box
                          sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: 'repeat(2, 1fr)' },
                            gap: 1,
                          }}
                        >
                          <TextField
                            label={builderCopy.config.calories_label}
                            value={form.calories}
                            onChange={handleFormChange('calories')}
                            size="small"
                            type="number"
                            inputProps={{ min: 0 }}
                          />
                          <TextField
                            label={builderCopy.config.protein_label}
                            value={form.proteinGrams}
                            onChange={handleFormChange('proteinGrams')}
                            size="small"
                            type="number"
                            inputProps={{ min: 0 }}
                          />
                          <TextField
                            label={builderCopy.config.carbs_label}
                            value={form.carbGrams}
                            onChange={handleFormChange('carbGrams')}
                            size="small"
                            type="number"
                            inputProps={{ min: 0 }}
                          />
                          <TextField
                            label={builderCopy.config.fats_label}
                            value={form.fatGrams}
                            onChange={handleFormChange('fatGrams')}
                            size="small"
                            type="number"
                            inputProps={{ min: 0 }}
                          />
                        </Box>
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
                              <Card
                                key={day.id}
                                variant="outlined"
                                sx={{
                                  cursor: 'pointer',
                                  transition: theme.transitions.create(
                                    ['background-color', 'border-color', 'box-shadow'],
                                    {
                                      duration: theme.transitions.duration.shortest,
                                    },
                                  ),
                                  '&:hover': {
                                    backgroundColor: alpha(theme.palette.warning.main, 0.08),
                                    borderColor: alpha(theme.palette.warning.main, 0.24),
                                  },
                                }}
                              >
                                <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                  <Stack direction="row" alignItems="flex-start" spacing={1}>
                                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                      <Stack direction="row" spacing={1} alignItems="center">
                                        <CalendarMonth
                                          fontSize="small"
                                          sx={{ color: alpha(theme.palette.secondary.main, 0.5) }}
                                        />
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }} noWrap>
                                          {day.label}
                                        </Typography>
                                      </Stack>
                                      <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                                        {day.description || builderCopy.structure.description_placeholder}
                                      </Typography>
                                    </Box>
                                    <Tooltip title={builderCopy.day_library.add_label} arrow>
                                      <span style={{ display: 'inline-flex' }}>
                                        <IconButton
                                          onClick={handleAddDay(day)}
                                          size="small"
                                          aria-label="add-meal-day-template"
                                        >
                                          <Add fontSize="small" />
                                        </IconButton>
                                      </span>
                                    </Tooltip>
                                  </Stack>
                                </CardContent>
                              </Card>
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
                              <Typography
                                variant="h6"
                                component="h2"
                                sx={{
                                  fontWeight: 700,
                                  ...interactiveSurfaceSx,
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 0.5,
                                  width: 'fit-content',
                                }}
                                onClick={handlePlanNameEdit}
                                onKeyDown={handlePlanNameDisplayKeyDown}
                                tabIndex={0}
                                role="button"
                                aria-label={builderCopy.config.plan_name_label}
                              >
                                <Edit fontSize="inherit" color="disabled" />
                                {form.planName}
                              </Typography>
                            )}
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
                                {days.map((day, index) => {
                                  const dayLabel = day.label ?? '';
                                  const dayDescription = day.description ?? '';
                                  const trimmedDayLabel = dayLabel.trim();
                                  const trimmedDayDescription = dayDescription.trim();
                                  const isEditingDayLabel =
                                    editingDayField?.dayId === day.uiId && editingDayField.field === 'label';
                                  const isEditingDayDescription =
                                    editingDayField?.dayId === day.uiId && editingDayField.field === 'description';

                                  return (
                                    <Card
                                      key={day.uiId}
                                      variant={selectedDayId === day.uiId ? 'outlined' : 'elevation'}
                                      onClick={() => handleSelectDay(day.uiId)}
                                      sx={{
                                        borderColor:
                                          selectedDayId === day.uiId ? theme.palette.warning.main : undefined,
                                        borderWidth: selectedDayId === day.uiId ? 1 : undefined,
                                        borderStyle: selectedDayId === day.uiId ? 'solid' : undefined,
                                        cursor: 'pointer',
                                        transition: theme.transitions.create(
                                          ['border-color', 'box-shadow'],
                                          {
                                            duration: theme.transitions.duration.shortest,
                                          },
                                        ),
                                        '&:hover': {
                                          borderColor: alpha(theme.palette.warning.main, 0.24),
                                          borderWidth: 1,
                                          borderStyle: 'solid',
                                        },
                                      }}
                                    >
                                      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                                          <Box
                                            sx={{
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: 1,
                                              flexGrow: 1,
                                              minWidth: 0,
                                            }}
                                          >
                                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                              {builderCopy.structure.day_prefix} {index + 1}
                                            </Typography>
                                            <Typography variant="subtitle1" color="text.disabled">
                                              -
                                            </Typography>
                                            {isEditingDayLabel ? (
                                              <TextField
                                                value={dayLabel}
                                                onChange={(event) =>
                                                  handleUpdateDay(day.uiId, { label: event.target.value })
                                                }
                                                onBlur={handleDayFieldBlur(day.uiId, 'label')}
                                                onKeyDown={handleDayFieldInputKeyDown(day.uiId, 'label')}
                                                size="small"
                                                variant="standard"
                                                fullWidth
                                                inputRef={registerDayFieldRef(day.uiId, 'label')}
                                                inputProps={{ 'aria-label': builderCopy.structure.title }}
                                              />
                                            ) : (
                                              <Typography
                                                variant="subtitle1"
                                                sx={{
                                                  fontWeight: 600,
                                                  ...interactiveSurfaceSx,
                                                  display: 'inline-flex',
                                                  alignItems: 'center',
                                                  gap: 0.5,
                                                  flexGrow: 1,
                                                  minWidth: 0,
                                                }}
                                                onClick={() => handleStartDayFieldEdit(day.uiId, 'label', dayLabel)}
                                                onKeyDown={handleDayFieldDisplayKeyDown(day.uiId, 'label', dayLabel)}
                                                tabIndex={0}
                                                role="button"
                                                aria-label={builderCopy.structure.title}
                                              >
                                                <Edit fontSize="inherit" color="disabled" />
                                                <Box
                                                  component="span"
                                                  sx={{
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                    flexGrow: 1,
                                                  }}
                                                >
                                                  {trimmedDayLabel.length > 0 ? dayLabel : builderCopy.structure.title}
                                                </Box>
                                              </Typography>
                                            )}
                                          </Box>
                                          <Stack direction="row" spacing={0.5}>
                                            <Tooltip title={builderCopy.structure.move_day_up_label}>
                                              <span>
                                                <IconButton
                                                  onClick={handleMoveDay('up', day.uiId)}
                                                  size="small"
                                                  disabled={index === 0}
                                                >
                                                  <ArrowUpward fontSize="small" />
                                                </IconButton>
                                              </span>
                                            </Tooltip>
                                            <Tooltip title={builderCopy.structure.move_day_down_label}>
                                              <span>
                                                <IconButton
                                                  onClick={handleMoveDay('down', day.uiId)}
                                                  size="small"
                                                  disabled={index === days.length - 1}
                                                >
                                                  <ArrowDownward fontSize="small" />
                                                </IconButton>
                                              </span>
                                            </Tooltip>
                                            <Tooltip title={builderCopy.structure.remove_day_label}>
                                              <span>
                                                <IconButton onClick={handleRemoveDayClick(day.uiId)} size="small">
                                                  <Delete fontSize="small" />
                                                </IconButton>
                                              </span>
                                            </Tooltip>
                                          </Stack>
                                        </Stack>
                                        {isEditingDayDescription ? (
                                          <TextField
                                            value={dayDescription}
                                            onChange={(event) =>
                                              handleUpdateDay(day.uiId, { description: event.target.value })
                                            }
                                            onBlur={handleDayFieldBlur(day.uiId, 'description')}
                                            onKeyDown={handleDayFieldInputKeyDown(day.uiId, 'description')}
                                            size="small"
                                            variant="standard"
                                            fullWidth
                                            multiline
                                            minRows={2}
                                            inputRef={registerDayFieldRef(day.uiId, 'description')}
                                            inputProps={{ 'aria-label': builderCopy.structure.description_placeholder }}
                                          />
                                        ) : (
                                          <Typography
                                            variant="body2"
                                            color={trimmedDayDescription.length > 0 ? 'text.primary' : 'text.secondary'}
                                            sx={{
                                              ...interactiveSurfaceSx,
                                              display: 'flex',
                                              alignItems: 'flex-start',
                                              gap: 0.5,
                                              width: '100%',
                                            }}
                                            onClick={() =>
                                              handleStartDayFieldEdit(day.uiId, 'description', dayDescription)
                                            }
                                            onKeyDown={handleDayFieldDisplayKeyDown(day.uiId, 'description', dayDescription)}
                                            tabIndex={0}
                                            role="button"
                                            aria-label={builderCopy.structure.description_placeholder}
                                          >
                                            <Edit fontSize="small" color="disabled" />
                                            <Box component="span" sx={{ whiteSpace: 'pre-wrap' }}>
                                              {trimmedDayDescription.length > 0
                                                ? dayDescription
                                                : builderCopy.structure.description_placeholder}
                                            </Box>
                                          </Typography>
                                        )}
                                        <Divider flexItem sx={{ my: 1 }} />
                                        <Stack spacing={1.5}>
                                          {day.meals.length === 0 ? (
                                            <Typography color="text.secondary" variant="body2">
                                              {builderCopy.structure.add_meal_placeholder}
                                            </Typography>
                                          ) : (
                                            day.meals.map((meal, mealIndex) => renderMealCard(day, meal, mealIndex))
                                          )}
                                        </Stack>
                                      </CardContent>
                                    </Card>
                                  );
                                })}
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
                              const mealIconReference = meal.id ?? meal.uiId ?? meal.label;
                              const MealIcon = getMealIcon(mealIconReference);
                              const isMealPublic = meal.visibility === 'PUBLIC';
                              const isMealOwnedByCurrentUser =
                                !isMealPublic && currentUserId !== null && meal.createdBy === currentUserId;
                              const isDeletingThisMeal = deletingMealId === meal.id;

                              return (
                                <Card
                                  key={meal.id ?? meal.uiId}
                                  variant="outlined"
                                  sx={{
                                    position: 'relative',
                                    overflow: 'visible',
                                    transition: theme.transitions.create(
                                    ['background-color', 'border-color', 'box-shadow'],
                                    {
                                      duration: theme.transitions.duration.shortest,
                                    },
                                  ),
                                  '&:hover': {
                                    backgroundColor: alpha(theme.palette.warning.main, 0.08),
                                    borderColor: alpha(theme.palette.warning.main, 0.24),
                                  },
                                }}
                              >
                                  <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                                    <Stack spacing={0.75}>
                                      <Stack direction="row" spacing={0.75} alignItems="center">
                                        {meal.type?.label ? (
                                          <Tooltip title={meal.type.label}>
                                            <span style={{ display: 'inline-flex' }}>
                                              <MealIcon fontSize="small" sx={{ color: mealIconColor }} />
                                            </span>
                                          </Tooltip>
                                        ) : (
                                          <MealIcon fontSize="small" sx={{ color: mealIconColor }} />
                                        )}
                                        {isMealOwnedByCurrentUser ? (
                                          <Tooltip title={builderCopy.meal_library.edit_tooltip ?? ''} arrow>
                                            <span style={{ display: 'inline-flex' }}>
                                              <IconButton
                                                size="small"
                                                onClick={() => handleOpenEditMealDialog(meal)}
                                                aria-label="edit-meal-template"
                                                sx={{ p: 0.25 }}
                                              >
                                                <Edit fontSize="small" />
                                              </IconButton>
                                            </span>
                                          </Tooltip>
                                        ) : null}
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                          {meal.label}
                                        </Typography>
                                      </Stack>
                                      <Typography variant="caption" color="text.secondary">
                                        {formatMealSummary(meal)}
                                      </Typography>
                                    </Stack>
                                  </CardContent>
                                  {(isMealPublic || isMealOwnedByCurrentUser) && (
                                    <Box
                                      sx={{
                                        position: 'absolute',
                                        bottom: (theme) => theme.spacing(1),
                                        right: (theme) => theme.spacing(1),
                                        display: 'flex',
                                        alignItems: 'center',
                                      }}
                                    >
                                      {isMealPublic ? (
                                        <Tooltip
                                          title={builderCopy.meal_library.public_tooltip ?? ''}
                                          arrow
                                          placement="left"
                                        >
                                          <Box
                                            sx={{
                                              display: 'flex',
                                              alignItems: 'center',
                                              color: (theme) => theme.palette.text.disabled,
                                            }}
                                          >
                                            <Public fontSize="small" aria-hidden />
                                          </Box>
                                        </Tooltip>
                                      ) : (
                                        <Tooltip
                                          title={builderCopy.meal_library.delete_tooltip ?? ''}
                                          arrow
                                          placement="left"
                                        >
                                          <span style={{ display: 'inline-flex' }}>
                                            <IconButton
                                              size="small"
                                              color="error"
                                              onClick={handleDeleteMealTemplate(meal.id)}
                                              disabled={isDeletingThisMeal}
                                              aria-label="delete-meal-template"
                                            >
                                              <Delete fontSize="small" />
                                            </IconButton>
                                          </span>
                                        </Tooltip>
                                      )}
                                    </Box>
                                  )}
                                  <Box
                                    sx={{
                                      position: 'absolute',
                                      top: (theme) => theme.spacing(1),
                                      right: (theme) => theme.spacing(1),
                                  }}
                                >
                                  <Tooltip title={builderCopy.meal_library.add_tooltip} arrow placement="left">
                                    <span style={{ display: 'inline-flex' }}>
                                      <IconButton
                                        size="small"
                                        onClick={handleOpenMealMenu(meal)}
                                        disabled={days.length === 0}
                                        aria-label="add-meal-to-day"
                                      >
                                        <Add fontSize="small" />
                                      </IconButton>
                                    </span>
                                  </Tooltip>
                                </Box>
                                </Card>
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
