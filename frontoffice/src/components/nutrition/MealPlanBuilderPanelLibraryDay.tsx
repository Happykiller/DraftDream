// src/components/nutrition/MealPlanBuilderPanelLibraryDay.tsx
import * as React from 'react';
import { Add, CalendarMonth } from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';
import {
  Box,
  Card,
  CardContent,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';

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

  return (
    <Card
      variant="outlined"
      sx={{
        cursor: 'pointer',
        transition: theme.transitions.create(['background-color', 'border-color', 'box-shadow'], {
          duration: theme.transitions.duration.shortest,
        }),
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
              <CalendarMonth fontSize="small" sx={{ color: alpha(theme.palette.secondary.main, 0.5) }} />
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
              <IconButton onClick={() => onAdd(day)} size="small" aria-label="add-meal-day-template">
                <Add fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </CardContent>
    </Card>
  );
});
