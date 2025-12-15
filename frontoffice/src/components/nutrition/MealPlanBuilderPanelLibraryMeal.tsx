// src/components/nutrition/MealPlanBuilderPanelLibraryMeal.tsx
import * as React from 'react';
import { Add, Delete, Edit, Public } from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';
import {
  Box,
  Card,
  CardContent,
  IconButton,
  Stack,
  Tooltip,
} from '@mui/material';

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

  return (
    <Card
      variant="outlined"
      sx={{
        position: 'relative',
        overflow: 'visible',
        transition: theme.transitions.create(['background-color', 'border-color', 'box-shadow'], {
          duration: theme.transitions.duration.shortest,
        }),
        '&:hover': {
          backgroundColor: alpha(theme.palette.warning.main, 0.08),
          borderColor: alpha(theme.palette.warning.main, 0.24),
        },
      }}
    >
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
        <Stack spacing={0.75}>
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
                pr: 4,
              }}
            />
          </Stack>
          <TextWithTooltip
            tooltipTitle={formatMealSummary(meal)}
            variant="caption"
            color="text.secondary"
            maxLines={2}
          />
        </Stack>
      </CardContent>
      {(isPublic || isOwnedByCurrentUser) && (
        <Box
          sx={{
            position: 'absolute',
            bottom: (theme) => theme.spacing(1),
            right: (theme) => theme.spacing(1),
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {isPublic ? (
            <Tooltip title={builderCopy.meal_library.public_tooltip ?? ''} arrow placement="left">
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
            <Tooltip title={builderCopy.meal_library.delete_tooltip ?? ''} arrow placement="left">
              <span style={{ display: 'inline-flex' }}>
                <IconButton
                  size="small"
                  onClick={() => onDelete?.(meal.id)}
                  disabled={isDeleting}
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
              onClick={onOpenMenu}
              disabled={disableAdd}
              aria-label="add-meal-to-day"
            >
              <Add fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </Box>
    </Card >
  );
});
