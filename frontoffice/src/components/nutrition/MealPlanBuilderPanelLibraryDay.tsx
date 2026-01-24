// src/components/nutrition/MealPlanBuilderPanelLibraryDay.tsx
import * as React from 'react';
import { Edit } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { Chip, IconButton, Stack, Tooltip } from '@mui/material';

import { LibraryCard } from '../common/LibraryCard';
import { TextWithTooltip } from '../common/TextWithTooltip';

import type { MealDay } from '@hooks/nutrition/useMealDays';

import type { MealPlanBuilderCopy } from './mealPlanBuilderTypes';

type MealPlanBuilderPanelLibraryDayProps = {
  day: MealDay;
  builderCopy: MealPlanBuilderCopy;
  onAdd: (day: MealDay) => void;
  onEdit?: () => void | Promise<void>;
  onDelete?: () => void | Promise<void>;
};

export const MealPlanBuilderPanelLibraryDay = React.memo(function MealPlanBuilderPanelLibraryDay({
  day,
  builderCopy,
  onAdd,
  onEdit,
  onDelete,
}: MealPlanBuilderPanelLibraryDayProps): React.JSX.Element {
  const theme = useTheme();

  const visibleMeals = React.useMemo(
    () => (day.meals ?? []).slice(0, 3),
    [day.meals],
  );

  const handleAddClick = React.useCallback(() => {
    onAdd(day);
  }, [day, onAdd]);

  const handleEditClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      onEdit?.();
    },
    [onEdit],
  );

  const handleDeleteClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      event.stopPropagation();
      onDelete?.();
    },
    [onDelete],
  );

  const isPrivateTemplate = day.visibility === 'PRIVATE';
  const canEdit = isPrivateTemplate && Boolean(onEdit);
  const canDelete = isPrivateTemplate && Boolean(onDelete);

  return (
    <LibraryCard
      onAdd={handleAddClick}
      addTooltip={builderCopy.day_library.add_label}
      addAriaLabel="add-meal-day-template"
      isPublic={!isPrivateTemplate}
      publicTooltip={builderCopy.day_library.public_tooltip ?? 'Public'}
      deleteTooltip={builderCopy.day_library.delete_day_template}
      onDelete={canDelete ? handleDeleteClick : undefined}
    >
      {/* Title with edit icon */}
      <Stack direction="row" spacing={0.5} alignItems="center">
        {canEdit ? (
          <Tooltip title={builderCopy.day_library.edit_day_template} arrow>
            <span style={{ display: 'inline-flex' }}>
              <IconButton size="small" onClick={handleEditClick} sx={{ p: 0.25 }}>
                <Edit fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        ) : null}
        <TextWithTooltip tooltipTitle={day.label} variant="subtitle2" sx={{ fontWeight: 600 }} />
      </Stack>

      {/* Description */}
      {day.description ? (
        <TextWithTooltip
          tooltipTitle={day.description}
          variant="caption"
          color="text.secondary"
          maxLines={2}
        />
      ) : null}

      {/* Meal badges */}
      {(day.meals?.length ?? 0) > 0 ? (
        <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ rowGap: 0.5 }}>
          {visibleMeals.map((meal) => (
            <Chip
              key={`${day.id}-${meal.id}`}
              label={meal.label}
              size="small"
              variant="outlined"
            />
          ))}
          {(day.meals?.length ?? 0) > 3 ? (
            <Chip
              label={`+${(day.meals?.length ?? 0) - 3}`}
              size="small"
              variant="outlined"
              sx={{ borderColor: theme.palette.divider }}
            />
          ) : null}
        </Stack>
      ) : null}
    </LibraryCard>
  );
});
