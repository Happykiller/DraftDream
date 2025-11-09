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

import type {
  MealPlanBuilderCopy,
  MealPlanBuilderDay,
  MealPlanBuilderMeal,
} from './mealPlanBuilderTypes';
import { MealPlanBuilderCreateMealDialog } from './MealPlanBuilderCreateMealDialog';

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
    reloadMealDays,
    updatePlanName,
  } = useMealPlanBuilder(builderCopy, {
    onCancel,
    onCreated,
    onUpdated,
    mealPlan,
  });

  const [isMealDialogOpen, setIsMealDialogOpen] = React.useState(false);

  const panelTitle = mode === 'edit' ? builderCopy.edit_title ?? builderCopy.title : builderCopy.title;
  const panelSubtitle =
    mode === 'edit' ? builderCopy.edit_subtitle ?? builderCopy.subtitle : builderCopy.subtitle;
  const submitLabel = mode === 'edit' ? builderCopy.footer.update ?? builderCopy.footer.submit : builderCopy.footer.submit;
  const mealIconColor = alpha(theme.palette.secondary.main, 0.5);
  const warningMain = theme.palette.warning.main;

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
    setIsMealDialogOpen(true);
  }, []);

  const handleCloseMealDialog = React.useCallback(() => {
    setIsMealDialogOpen(false);
  }, []);

  const handleMealCreated = React.useCallback(async () => {
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

  const mealDialog = (
    <MealPlanBuilderCreateMealDialog
      open={isMealDialogOpen}
      onClose={handleCloseMealDialog}
      onCreated={handleMealCreated}
      createMeal={createMeal}
    />
  );

  const renderMealCard = React.useCallback(
    (day: MealPlanBuilderDay, meal: MealPlanBuilderMeal, index: number) => (
      <Card key={meal.uiId} variant="outlined">
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {builderCopy.structure.meal_prefix} {index + 1}
            </Typography>
            <Stack direction="row" spacing={0.5}>
              <Tooltip title={builderCopy.structure.remove_meal_label}>
                <span>
                  <IconButton onClick={handleRemoveMealClick(day.uiId, meal.uiId)} size="small">
                    <Delete fontSize="small" />
                  </IconButton>
                </span>
              </Tooltip>
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
            </Stack>
          </Stack>

          <TextField
            label={builderCopy.structure.meal_prefix}
            value={meal.label}
            onChange={(event) => handleUpdateMeal(day.uiId, meal.uiId, { label: event.target.value })}
            size="small"
          />
          <TextField
            label={builderCopy.structure.foods_label}
            value={meal.foods}
            onChange={(event) => handleUpdateMeal(day.uiId, meal.uiId, { foods: event.target.value })}
            size="small"
            multiline
            minRows={2}
          />
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
              gap: 1,
            }}
          >
            <TextField
              label={builderCopy.structure.calories_label}
              value={meal.calories}
              onChange={(event) => handleUpdateMeal(day.uiId, meal.uiId, { calories: Number(event.target.value) })}
              type="number"
              size="small"
            />
            <TextField
              label={builderCopy.structure.protein_label}
              value={meal.proteinGrams}
              onChange={(event) =>
                handleUpdateMeal(day.uiId, meal.uiId, { proteinGrams: Number(event.target.value) })
              }
              type="number"
              size="small"
            />
            <TextField
              label={builderCopy.structure.carbs_label}
              value={meal.carbGrams}
              onChange={(event) => handleUpdateMeal(day.uiId, meal.uiId, { carbGrams: Number(event.target.value) })}
              type="number"
              size="small"
            />
            <TextField
              label={builderCopy.structure.fats_label}
              value={meal.fatGrams}
              onChange={(event) => handleUpdateMeal(day.uiId, meal.uiId, { fatGrams: Number(event.target.value) })}
              type="number"
              size="small"
            />
          </Box>

          {meal.type?.label ? <Chip label={meal.type.label} variant="outlined" size="small" /> : null}

          <Typography variant="caption" color="text.secondary">
            {formatMealSummary(meal)}
          </Typography>
        </CardContent>
      </Card>
    ),
    [builderCopy, handleMoveMeal, handleRemoveMealClick, handleUpdateMeal],
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
                                {days.map((day, index) => (
                                  <Card
                                    key={day.uiId}
                                    variant={selectedDayId === day.uiId ? 'outlined' : 'elevation'}
                                    onClick={() => handleSelectDay(day.uiId)}
                                    sx={{
                                      borderColor:
                                        selectedDayId === day.uiId
                                          ? theme.palette.warning.main
                                          : undefined,
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
                                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                          {builderCopy.structure.day_prefix} {index + 1}
                                        </Typography>
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
                                      <TextField
                                        label={builderCopy.structure.title}
                                        value={day.label}
                                        onChange={(event) => handleUpdateDay(day.uiId, { label: event.target.value })}
                                        size="small"
                                      />
                                      <TextField
                                        label={builderCopy.structure.description_placeholder}
                                        value={day.description}
                                        onChange={(event) => handleUpdateDay(day.uiId, { description: event.target.value })}
                                        size="small"
                                        multiline
                                        minRows={2}
                                      />
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
                              const mealIconReference = meal.id ?? meal.uiId ?? meal.label;
                              const MealIcon = getMealIcon(mealIconReference);
                              const isMealPublic = meal.visibility === 'PUBLIC';

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
                                      <Stack direction="row" spacing={1} alignItems="center">
                                        {meal.type?.label ? (
                                          <Tooltip title={meal.type.label}>
                                            <span style={{ display: 'inline-flex' }}>
                                              <MealIcon fontSize="small" sx={{ color: mealIconColor }} />
                                            </span>
                                          </Tooltip>
                                        ) : (
                                          <MealIcon fontSize="small" sx={{ color: mealIconColor }} />
                                        )}
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                          {meal.label}
                                        </Typography>
                                      </Stack>
                                      <Typography variant="caption" color="text.secondary">
                                        {formatMealSummary(meal)}
                                      </Typography>
                                    </Stack>
                                  </CardContent>
                                  {isMealPublic ? (
                                    <Tooltip title={builderCopy.meal_library.public_tooltip ?? ''} arrow placement="left">
                                      <Box
                                        sx={{
                                          position: 'absolute',
                                          bottom: (theme) => theme.spacing(1),
                                          right: (theme) => theme.spacing(1),
                                          display: 'flex',
                                          alignItems: 'center',
                                          color: (theme) => theme.palette.text.disabled,
                                        }}
                                      >
                                        <Public fontSize="small" aria-hidden />
                                      </Box>
                                    </Tooltip>
                                  ) : null}
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
    </>
  );
}
