// src/components/nutrition/MealPlanBuilderPanelLibraryDay.tsx
import * as React from 'react';
import { Add } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { Chip, IconButton, Paper, Stack, Tooltip, Typography } from '@mui/material';

import { TextWithTooltip } from '../common/TextWithTooltip';

import type { MealDay } from '@hooks/nutrition/useMealDays';

import type { MealPlanBuilderCopy } from './mealPlanBuilderTypes';

type MealPlanBuilderPanelLibraryDayProps = {
  day: MealDay;
  builderCopy: MealPlanBuilderCopy;
  onAdd: (day: MealDay) => void;
};

export const MealPlanBuilderPanelLibraryDay = React.memo(function MealPlanBuilderPanelLibraryDay({
  day,
  builderCopy,
  onAdd,
}: MealPlanBuilderPanelLibraryDayProps): React.JSX.Element {
  const theme = useTheme();



  const visibleMeals = React.useMemo(
    () => (day.meals ?? []).slice(0, 3),
    [day.meals],
  );

  const handleAddClick = React.useCallback(() => {
    onAdd(day);
  }, [day, onAdd]);

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.5,
        borderRadius: 2,
        cursor: 'default',
        transition: 'border-color 150ms ease, background-color 150ms ease',
        width: '100%',
        maxWidth: '100%',
        '&:hover': {
          borderColor: theme.palette.success.main,
          boxShadow: theme.shadows[2],
        },
      }}
    >
      {/* Day template */}
      <Stack spacing={1.25}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems="flex-start"
          columnGap={1}
          rowGap={1}
        >
          <Stack spacing={0.5} flexGrow={1} minWidth={0}>
            <TextWithTooltip tooltipTitle={day.label} variant="subtitle1" sx={{ fontWeight: 600 }} />
            {day.description ? (
              <TextWithTooltip
                tooltipTitle={day.description}
                variant="body2"
                color="text.secondary"
                maxLines={2}
              />
            ) : null}
          </Stack>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
          >
            {/* Note: No duration for MealDay, so we skip that Chip present in ProgramSession */}

            {/* Add template */}
            <Tooltip title={builderCopy.day_library.add_label} arrow>
              <span style={{ display: 'inline-flex' }}>
                <IconButton
                  size="small"
                  onClick={handleAddClick}
                  aria-label="add-meal-day-template"
                >
                  <Add fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        </Stack>

        {/* Note: No tags for MealDay, skipping tags section */}

        {(day.meals?.length ?? 0) === 0 ? (
          <Typography variant="caption" color="text.secondary">
            {/* Empty state or label could go here if needed, currently empty as per request to remove count */}
          </Typography>
        ) : (
          /* Meal chips */
          <Stack spacing={0.5} sx={{ width: '100%' }}>
            <Stack direction="row" spacing={0.5} flexWrap="wrap">
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
          </Stack>
        )}
      </Stack>
    </Paper>
  );
});
