// src/components/nutrition/MealPlanBuilderPanelDraftMeal.tsx
import * as React from 'react';
import { ArrowDownward, ArrowUpward, Delete, Edit } from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';
import {
  Box,
  Card,
  CardContent,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';

import { useMealTypeIcon } from '@hooks/nutrition/useMealTypeIcon';

import type {
  MealPlanBuilderCopy,
  MealPlanBuilderMeal,
} from './mealPlanBuilderTypes';
import { formatMealSummary } from './mealPlanBuilderUtils';

type MealPlanBuilderPanelDraftMealProps = {
  meal: MealPlanBuilderMeal;
  index: number;
  builderCopy: MealPlanBuilderCopy;
  disableMoveUp: boolean;
  disableMoveDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onEdit: () => void;
  onRemove: () => void;
  onUpdate: (patch: Partial<MealPlanBuilderMeal>) => void;
};

export const MealPlanBuilderPanelDraftMeal = React.memo(function MealPlanBuilderPanelDraftMeal({
  meal,
  index,
  builderCopy,
  disableMoveUp,
  disableMoveDown,
  onMoveUp,
  onMoveDown,
  onEdit,
  onRemove,
  onUpdate,
}: MealPlanBuilderPanelDraftMealProps): React.JSX.Element {
  const theme = useTheme();
  const warningMain = theme.palette.warning.main;
  const secondaryMain = theme.palette.secondary.main;

  const mealIconColor = React.useMemo(
    () => alpha(secondaryMain, 0.5),
    [secondaryMain],
  );

  const trimmedMealLabel = (meal.label ?? '').trim();
  const displayMealLabel = trimmedMealLabel.length > 0 ? meal.label : builderCopy.structure.meal_prefix;

  const [isEditingLabel, setIsEditingLabel] = React.useState(false);
  const [labelDraft, setLabelDraft] = React.useState(meal.label ?? '');
  const labelInputRef = React.useRef<HTMLInputElement | null>(null);
  const previousLabelRef = React.useRef(meal.label ?? '');

  const interactiveSurfaceSx = React.useMemo(
    () => ({
      cursor: 'pointer',
      borderRadius: 1,
      px: 0.5,
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

  const MealIcon = useMealTypeIcon(meal.type?.icon);

  React.useEffect(() => {
    if (!isEditingLabel) {
      setLabelDraft(meal.label ?? '');
    }
  }, [isEditingLabel, meal.label]);

  React.useEffect(() => {
    if (isEditingLabel && labelInputRef.current) {
      labelInputRef.current.focus();
      labelInputRef.current.select();
    }
  }, [isEditingLabel]);

  const handleLabelChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const nextValue = event.target.value;
      setLabelDraft(nextValue);
      onUpdate({ label: nextValue });
    },
    [onUpdate],
  );

  const commitLabel = React.useCallback(() => {
    const trimmed = labelDraft.trim();
    onUpdate({ label: trimmed });
    setIsEditingLabel(false);
  }, [labelDraft, onUpdate]);

  const cancelLabelEdition = React.useCallback(() => {
    const previous = previousLabelRef.current ?? '';
    setIsEditingLabel(false);
    setLabelDraft(previous);
    onUpdate({ label: previous });
  }, [onUpdate]);

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
    const currentLabel = meal.label ?? '';
    previousLabelRef.current = currentLabel;
    setLabelDraft(currentLabel);
    setIsEditingLabel(true);
  }, [meal.label]);

  const handleLabelDisplayKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        startLabelEdition();
      }
    },
    [startLabelEdition],
  );

  return (
    <Card variant="outlined">
      {/* General information */}
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
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
              {builderCopy.structure.meal_prefix} {index + 1}
            </Typography>
            <Typography variant="subtitle2" color="text.disabled">
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
                inputProps={{ 'aria-label': builderCopy.structure.meal_prefix }}
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
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                onClick={startLabelEdition}
                onKeyDown={handleLabelDisplayKeyDown}
                tabIndex={0}
                role="button"
                aria-label={builderCopy.structure.meal_prefix}
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
                  {displayMealLabel}
                </Box>
              </Typography>
            )}
          </Box>
          <Stack direction="row" spacing={0.5}>
            <Tooltip title={builderCopy.structure.move_meal_up_label}>
              <span>
                <IconButton onClick={onMoveUp} size="small" disabled={disableMoveUp}>
                  <ArrowUpward fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title={builderCopy.structure.move_meal_down_label}>
              <span>
                <IconButton onClick={onMoveDown} size="small" disabled={disableMoveDown}>
                  <ArrowDownward fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title={builderCopy.structure.edit_meal_label}>
              <span>
                <IconButton onClick={onEdit} size="small" aria-label="edit-draft-meal">
                  <Edit fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title={builderCopy.structure.remove_meal_label}>
              <span>
                <IconButton onClick={onRemove} size="small">
                  <Delete fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        </Stack>

        <Stack spacing={0.75}>
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
});
