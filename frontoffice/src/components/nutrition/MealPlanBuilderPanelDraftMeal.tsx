// src/components/nutrition/MealPlanBuilderPanelDraftMeal.tsx
import * as React from 'react';
import { ArrowDownward, ArrowUpward, Delete, Edit } from '@mui/icons-material';
import {
  Card,
  CardContent,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';

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
}: MealPlanBuilderPanelDraftMealProps): React.JSX.Element {
  const trimmedMealLabel = meal.label.trim();
  const displayMealLabel = trimmedMealLabel.length > 0 ? meal.label : builderCopy.structure.meal_prefix;

  return (
    <Card variant="outlined">
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {builderCopy.structure.meal_prefix} {index + 1}
          </Typography>
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
});
