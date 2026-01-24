// src/components/nutrition/MealPlanBuilderPanelDraftDay.tsx
import * as React from 'react';
import {
  ArrowDownward,
  ArrowUpward,
  DeleteOutline,
  Edit,
  Save,
} from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';
import {
  Box,
  Card,
  CardContent,
  Divider,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';

import type {
  MealPlanBuilderCopy,
  MealPlanBuilderDay,
  MealPlanBuilderMeal,
} from './mealPlanBuilderTypes';
import { MealPlanBuilderPanelDraftMeal } from './MealPlanBuilderPanelDraftMeal';
import { computeDayNutritionSummary } from './mealPlanBuilderUtils';

type DayPatch = Partial<Pick<MealPlanBuilderDay, 'label' | 'description'>>;

type MealPlanBuilderPanelDraftDayProps = {
  day: MealPlanBuilderDay;
  index: number;
  totalDays: number;
  builderCopy: MealPlanBuilderCopy;
  onUpdateDay: (dayId: string, patch: DayPatch) => void;
  onRemoveDay: (dayId: string) => void;
  onMoveDayUp: (dayId: string) => void;
  onMoveDayDown: (dayId: string) => void;
  onSaveDay: (dayId: string) => void;
  onRemoveMeal: (dayId: string, mealId: string) => void;
  onMoveMealUp: (dayId: string, mealId: string) => void;
  onMoveMealDown: (dayId: string, mealId: string) => void;
  onUpdateMeal: (
    dayId: string,
    mealId: string,
    patch: Partial<MealPlanBuilderMeal>,
  ) => void;
  onEditMeal: (day: MealPlanBuilderDay, meal: MealPlanBuilderMeal, position: number) => void;
};

export const MealPlanBuilderPanelDraftDay = React.memo(function MealPlanBuilderPanelDraftDay({
  day,
  index,
  totalDays,
  builderCopy,
  onUpdateDay,
  onRemoveDay,
  onMoveDayUp,
  onMoveDayDown,
  onSaveDay,
  onRemoveMeal,
  onMoveMealUp,
  onMoveMealDown,
  onUpdateMeal,
  onEditMeal,
}: MealPlanBuilderPanelDraftDayProps): React.JSX.Element {
  const theme = useTheme();
  const warningMain = theme.palette.warning.main;
  const summaryBackground = React.useMemo(
    () => alpha(theme.palette.primary.main, 0.04),
    [theme.palette.primary.main],
  );
  const summaryBorder = React.useMemo(
    () => alpha(theme.palette.primary.main, 0.16),
    [theme.palette.primary.main],
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

  const [isEditingLabel, setIsEditingLabel] = React.useState(false);
  const [labelDraft, setLabelDraft] = React.useState(day.label ?? '');
  const labelInputRef = React.useRef<HTMLInputElement | null>(null);
  const previousLabelRef = React.useRef(day.label ?? '');

  const [isEditingDescription, setIsEditingDescription] = React.useState(false);
  const [descriptionDraft, setDescriptionDraft] = React.useState(day.description ?? '');
  const descriptionInputRef = React.useRef<HTMLTextAreaElement | null>(null);
  const previousDescriptionRef = React.useRef(day.description ?? '');

  React.useEffect(() => {
    if (!isEditingLabel) {
      setLabelDraft(day.label ?? '');
    }
  }, [day.label, isEditingLabel]);

  React.useEffect(() => {
    if (!isEditingDescription) {
      setDescriptionDraft(day.description ?? '');
    }
  }, [day.description, isEditingDescription]);

  React.useEffect(() => {
    if (isEditingLabel && labelInputRef.current) {
      labelInputRef.current.focus();
      labelInputRef.current.select();
    }
  }, [isEditingLabel]);

  React.useEffect(() => {
    if (isEditingDescription && descriptionInputRef.current) {
      descriptionInputRef.current.focus();
      descriptionInputRef.current.select();
    }
  }, [isEditingDescription]);

  const handleLabelChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const nextValue = event.target.value;
      setLabelDraft(nextValue);
      onUpdateDay(day.uiId, { label: nextValue });
    },
    [day.uiId, onUpdateDay],
  );

  const commitLabel = React.useCallback(() => {
    const trimmed = labelDraft.trim();
    onUpdateDay(day.uiId, { label: trimmed });
    setIsEditingLabel(false);
  }, [day.uiId, labelDraft, onUpdateDay]);

  const cancelLabelEdition = React.useCallback(() => {
    const previous = previousLabelRef.current;
    setIsEditingLabel(false);
    setLabelDraft(previous);
    onUpdateDay(day.uiId, { label: previous });
  }, [day.uiId, onUpdateDay]);

  const handleLabelBlur = React.useCallback(() => {
    if (!isEditingLabel) {
      return;
    }

    commitLabel();
  }, [commitLabel, isEditingLabel]);

  const handleLabelKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        commitLabel();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        cancelLabelEdition();
      }
    },
    [cancelLabelEdition, commitLabel],
  );

  const startLabelEdition = React.useCallback(() => {
    const currentLabel = day.label ?? '';
    previousLabelRef.current = currentLabel;
    setLabelDraft(currentLabel);
    setIsEditingLabel(true);
  }, [day.label]);

  const handleLabelDisplayKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        startLabelEdition();
      }
    },
    [startLabelEdition],
  );

  const handleDescriptionChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const nextValue = event.target.value;
      setDescriptionDraft(nextValue);
      onUpdateDay(day.uiId, { description: nextValue });
    },
    [day.uiId, onUpdateDay],
  );

  const commitDescription = React.useCallback(() => {
    const trimmed = descriptionDraft.trim();
    onUpdateDay(day.uiId, { description: trimmed });
    setIsEditingDescription(false);
  }, [day.uiId, descriptionDraft, onUpdateDay]);

  const cancelDescriptionEdition = React.useCallback(() => {
    const previous = previousDescriptionRef.current;
    setIsEditingDescription(false);
    setDescriptionDraft(previous);
    onUpdateDay(day.uiId, { description: previous });
  }, [day.uiId, onUpdateDay]);

  const handleDescriptionBlur = React.useCallback(() => {
    if (!isEditingDescription) {
      return;
    }

    commitDescription();
  }, [commitDescription, isEditingDescription]);

  const handleDescriptionKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        cancelDescriptionEdition();
        return;
      }

      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        commitDescription();
      }
    },
    [cancelDescriptionEdition, commitDescription],
  );

  const startDescriptionEdition = React.useCallback(() => {
    const currentDescription = day.description ?? '';
    previousDescriptionRef.current = currentDescription;
    setDescriptionDraft(currentDescription);
    setIsEditingDescription(true);
  }, [day.description]);

  const handleDescriptionDisplayKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        startDescriptionEdition();
      }
    },
    [startDescriptionEdition],
  );

  const trimmedDayLabel = (day.label ?? '').trim();
  const trimmedDayDescription = (day.description ?? '').trim();
  const macroFormatter = React.useMemo(
    () =>
      new Intl.NumberFormat(undefined, {
        maximumFractionDigits: 1,
        minimumFractionDigits: 0,
      }),
    [],
  );
  const daySummary = React.useMemo(
    () => computeDayNutritionSummary(day),
    [day],
  );
  const daySummaryEntries = React.useMemo(
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
          value: macroFormatter.format(daySummary.calories),
          unit: summaryCopy?.calories_unit ?? 'kcal',
          color: theme.palette.primary.main,
        },
        {
          key: 'protein' as const,
          label: proteinLabel,
          value: macroFormatter.format(daySummary.proteinGrams),
          unit: summaryCopy?.protein_unit ?? 'g',
          color: theme.palette.info.main,
        },
        {
          key: 'carbs' as const,
          label: carbsLabel,
          value: macroFormatter.format(daySummary.carbGrams),
          unit: summaryCopy?.carbs_unit ?? 'g',
          color: theme.palette.success.main,
        },
        {
          key: 'fats' as const,
          label: fatsLabel,
          value: macroFormatter.format(daySummary.fatGrams),
          unit: summaryCopy?.fats_unit ?? 'g',
          color: theme.palette.warning.main,
        },
      ];
    },
    [
      builderCopy.structure,
      builderCopy.summary,
      daySummary.calories,
      daySummary.carbGrams,
      daySummary.fatGrams,
      daySummary.proteinGrams,
      macroFormatter,
      theme.palette.info.main,
      theme.palette.primary.main,
      theme.palette.success.main,
      theme.palette.warning.main,
    ],
  );
  const daySummaryTitle = React.useMemo(
    () => builderCopy.summary?.day_title ?? builderCopy.summary?.nutrition_title,
    [builderCopy.summary?.day_title, builderCopy.summary?.nutrition_title],
  );
  const saveDayLabel = builderCopy.structure.save_day;

  const handleSaveDay = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      onSaveDay(day.uiId);
    },
    [day.uiId, onSaveDay],
  );

  return (
    <Card
      variant="outlined"
      sx={{
        borderColor: alpha(theme.palette.warning.main, 0.24),
        transition: theme.transitions.create(['border-color', 'box-shadow'], {
          duration: theme.transitions.duration.shortest,
        }),
        '&:hover': {
          backgroundColor: alpha(warningMain, 0.08),
          borderColor: alpha(warningMain, 0.24),
        },
      }}
    >
      {/* General information */}
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
            {isEditingLabel ? (
              <TextField
                value={labelDraft}
                onChange={handleLabelChange}
                onBlur={handleLabelBlur}
                onKeyDown={handleLabelKeyDown}
                size="small"
                variant="standard"
                fullWidth
                inputRef={labelInputRef}
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
                onClick={startLabelEdition}
                onKeyDown={handleLabelDisplayKeyDown}
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
                  {trimmedDayLabel.length > 0 ? day.label : builderCopy.structure.title}
                </Box>
              </Typography>
            )}
          </Box>
          <Stack direction="row" spacing={0.5}>
            <Tooltip title={saveDayLabel}>
              <span>
                <IconButton onClick={handleSaveDay} size="small">
                  <Save fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title={builderCopy.structure.move_day_up_label}>
              <span>
                <IconButton onClick={() => onMoveDayUp(day.uiId)} size="small" disabled={index === 0}>
                  <ArrowUpward fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title={builderCopy.structure.move_day_down_label}>
              <span>
                <IconButton onClick={() => onMoveDayDown(day.uiId)} size="small" disabled={index === totalDays - 1}>
                  <ArrowDownward fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title={builderCopy.structure.remove_day_label}>
              <span>
                <IconButton onClick={() => onRemoveDay(day.uiId)} size="small">
                  <DeleteOutline fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        </Stack>
        {isEditingDescription ? (
          <TextField
            value={descriptionDraft}
            onChange={handleDescriptionChange}
            onBlur={handleDescriptionBlur}
            onKeyDown={handleDescriptionKeyDown}
            size="small"
            variant="standard"
            fullWidth
            multiline
            minRows={2}
            inputRef={descriptionInputRef}
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
            onClick={startDescriptionEdition}
            onKeyDown={handleDescriptionDisplayKeyDown}
            tabIndex={0}
            role="button"
            aria-label={builderCopy.structure.description_placeholder}
          >
            <Edit fontSize="small" color="disabled" />
            <Box component="span" sx={{ whiteSpace: 'pre-wrap' }}>
              {trimmedDayDescription.length > 0
                ? day.description
                : builderCopy.structure.description_placeholder}
            </Box>
          </Typography>
        )}
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
            {daySummaryTitle ? (
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                {daySummaryTitle}
              </Typography>
            ) : null}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={{ xs: 1.5, sm: 3 }}
              useFlexGap
              flexWrap="wrap"
            >
              {daySummaryEntries.map((entry) => {
                const displayValue = entry.unit ? `${entry.value}\u00a0${entry.unit}` : entry.value;

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
        <Divider flexItem sx={{ my: 1 }} />
        <Stack spacing={1.5}>
          {day.meals.length === 0 ? (
            <Typography color="text.secondary" variant="body2">
              {builderCopy.structure.add_meal_placeholder}
            </Typography>
          ) : (
            day.meals.map((meal, mealIndex) => (
              <MealPlanBuilderPanelDraftMeal
                key={meal.uiId}
                meal={meal}
                index={mealIndex}
                builderCopy={builderCopy}
                disableMoveUp={mealIndex === 0}
                disableMoveDown={mealIndex === day.meals.length - 1}
                onMoveUp={() => onMoveMealUp(day.uiId, meal.uiId)}
                onMoveDown={() => onMoveMealDown(day.uiId, meal.uiId)}
                onEdit={() => onEditMeal(day, meal, mealIndex + 1)}
                onRemove={() => onRemoveMeal(day.uiId, meal.uiId)}
                onUpdate={(patch) => onUpdateMeal(day.uiId, meal.uiId, patch)}
              />
            ))
          )}
        </Stack>
      </CardContent>
    </Card>
  );
});
