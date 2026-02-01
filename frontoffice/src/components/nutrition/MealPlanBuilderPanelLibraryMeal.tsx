// src/components/nutrition/MealPlanBuilderPanelLibraryMeal.tsx
import * as React from 'react';
import { Edit } from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';
import { IconButton, Stack, Tooltip } from '@mui/material';

import { LibraryCard } from '../common/LibraryCard';
import { TextWithTooltip } from '../common/TextWithTooltip';

import type { Meal } from '@hooks/nutrition/useMeals';
import { useMealTypeIcon } from '@hooks/nutrition/useMealTypeIcon';

import type { MealPlanBuilderCopy } from './mealPlanBuilderTypes';
import { formatMealSummary } from './mealPlanBuilderUtils';

type MealPlanBuilderPanelLibraryMealProps = {
  meal: Meal;
  builderCopy: MealPlanBuilderCopy;
  disableAdd: boolean;
  isDeleting: boolean;
  isPublic: boolean;
  isOwnedByCurrentUser: boolean;
  onOpenMenu: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onDelete?: (mealId: string) => void | Promise<void>;
  onEdit?: (meal: Meal) => void;
};

export const MealPlanBuilderPanelLibraryMeal = React.memo(function MealPlanBuilderPanelLibraryMeal({
  meal,
  builderCopy,
  disableAdd,
  isDeleting,
  isPublic,
  isOwnedByCurrentUser,
  onOpenMenu,
  onDelete,
  onEdit,
}: MealPlanBuilderPanelLibraryMealProps): React.JSX.Element {
  const theme = useTheme();
  const secondaryMain = theme.palette.secondary.main;
  const mealIconColor = React.useMemo(
    () => alpha(secondaryMain, 0.5),
    [secondaryMain],
  );

  const MealIcon = useMealTypeIcon(meal.type?.icon);

  const handleDeleteClick = React.useCallback(() => {
    onDelete?.(meal.id);
  }, [meal.id, onDelete]);

  return (
    <LibraryCard
      onAdd={onOpenMenu}
      addTooltip={builderCopy.meal_library.add_tooltip}
      addDisabled={disableAdd}
      addAriaLabel="add-meal-to-day"
      isPublic={isPublic}
      publicTooltip={builderCopy.meal_library.public_tooltip ?? 'Public'}
      deleteTooltip={builderCopy.meal_library.delete_tooltip}
      onDelete={isOwnedByCurrentUser && onDelete ? handleDeleteClick : undefined}
      deleteDisabled={isDeleting}
    >
      {/* Title with meal type icon and edit button */}
      <Stack
        direction="row"
        spacing={0.75}
        alignItems="center"
        sx={{ flexWrap: 'wrap', rowGap: 0.5 }}
      >
        {meal.type?.label ? (
          <Tooltip title={meal.type.label} placement="bottom-start" arrow>
            <span style={{ display: 'inline-flex' }}>
              <MealIcon fontSize="small" sx={{ color: mealIconColor }} />
            </span>
          </Tooltip>
        ) : (
          <MealIcon fontSize="small" sx={{ color: mealIconColor }} />
        )}
        {isOwnedByCurrentUser && onEdit ? (
          <Tooltip title={builderCopy.meal_library.edit_tooltip ?? ''} arrow placement="bottom-start">
            <span style={{ display: 'inline-flex' }}>
              <IconButton
                size="small"
                onClick={() => onEdit(meal)}
                aria-label="edit-meal-template"
                sx={{ p: 0.25 }}
              >
                <Edit fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        ) : null}

        <TextWithTooltip
          tooltipTitle={meal.label ?? ''}
          variant="subtitle2"
          sx={{
            fontWeight: 600,
            flex: 1,
            minWidth: 0,
          }}
        />
      </Stack>

      {/* Meal summary */}
      <TextWithTooltip
        tooltipTitle={formatMealSummary(meal)}
        variant="caption"
        color="text.secondary"
      />
    </LibraryCard>
  );
});
