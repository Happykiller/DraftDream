import * as React from 'react';
import { Search } from '@mui/icons-material';
import {
  CircularProgress,
  Grid,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

import type { MealPlan } from '@hooks/nutrition/useMealPlans';

import { MealPlanCard, type MealPlanActionKey } from './MealPlanCard';

export interface MealPlanListProps {
  mealPlans: MealPlan[];
  loading: boolean;
  placeholderTitle: string;
  placeholderSubtitle?: string;
  placeholderHelper?: string;
  actionSlot?: React.ReactNode;
  onViewMealPlan?: (mealPlan: MealPlan) => void;
  onEditMealPlan?: (mealPlan: MealPlan) => void;
  onDeleteMealPlan?: (mealPlan: MealPlan) => Promise<void> | void;
  onCloneMealPlan?: (
    mealPlan: MealPlan,
    payload: { label: string; athleteId: string | null; openBuilder: boolean },
  ) => Promise<void>;
  onPrefetch?: (action: 'view' | 'edit') => void;
  dayCountFormatter: (dayCount: number) => string;
  macroLabels: {
    calories: string;
    protein: string;
    carbs: string;
    fats: string;
  };
  allowedActions?: MealPlanActionKey[];
  onSearchChange?: (query: string) => void;
  searchPlaceholder?: string;
  searchAriaLabel?: string;
  searchQuery?: string;
  searchDebounceMs?: number;
}

/**
 * Displays nutrition meal plans with macro highlights using a grid layout similar to program cards.
 */
export const MealPlanList = React.memo(function MealPlanList({
  mealPlans,
  loading,
  placeholderTitle,
  placeholderSubtitle,
  placeholderHelper,
  actionSlot,
  onViewMealPlan,
  onEditMealPlan,
  onDeleteMealPlan,
  onCloneMealPlan,
  onPrefetch,
  dayCountFormatter,
  macroLabels,
  allowedActions,
  onSearchChange,
  searchPlaceholder,
  searchAriaLabel,
  searchQuery,
  searchDebounceMs = 400,
}: MealPlanListProps): React.JSX.Element {
  const theme = useTheme();
  const showPlaceholder = !loading && mealPlans.length === 0;
  const [searchValue, setSearchValue] = React.useState(searchQuery ?? '');

  React.useEffect(() => {
    setSearchValue(searchQuery ?? '');
  }, [searchQuery]);

  React.useEffect(() => {
    if (!onSearchChange) {
      return undefined;
    }

    const normalizedNext = searchValue.trim();
    const normalizedPrevious = (searchQuery ?? '').trim();

    if (normalizedNext === normalizedPrevious) {
      return undefined;
    }

    const handler = window.setTimeout(() => {
      onSearchChange(normalizedNext);
    }, searchDebounceMs);

    return () => {
      window.clearTimeout(handler);
    };
  }, [onSearchChange, searchDebounceMs, searchQuery, searchValue]);

  return (
    <Stack spacing={3} sx={{ width: '100%' }}>
      {/* General information */}
      {onSearchChange || actionSlot ? (
        <Stack
          alignItems="stretch"
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          sx={{ width: '100%' }}
        >
          {onSearchChange ? (
            <TextField
              fullWidth
              inputProps={{ 'aria-label': searchAriaLabel ?? searchPlaceholder }}
              onChange={(event) => {
                setSearchValue(event.target.value);
              }}
              placeholder={searchPlaceholder}
              size="small"
              value={searchValue}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="action" fontSize="small" />
                  </InputAdornment>
                ),
              }}
              sx={{ bgcolor: 'common.white' }}
            />
          ) : null}

          {actionSlot ? (
            <Stack
              alignItems="center"
              direction="row"
              justifyContent="flex-end"
              spacing={1}
              sx={{ ml: { xs: 0, sm: 'auto' } }}
            >
              {actionSlot}
            </Stack>
          ) : null}
        </Stack>
      ) : null}

      {loading ? (
        <Stack alignItems="center" justifyContent="center" sx={{ py: 6 }}>
          <CircularProgress size={32} />
        </Stack>
      ) : mealPlans.length > 0 ? (
        <Grid container spacing={3}>
          {mealPlans.map((plan) => (
            <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={plan.id}>
              <MealPlanCard
                mealPlan={plan}
                dayCountFormatter={dayCountFormatter}
                macroLabels={macroLabels}
                onView={onViewMealPlan}
                onEdit={onEditMealPlan}
                onDelete={onDeleteMealPlan}
                onClone={onCloneMealPlan}
                onPrefetch={onPrefetch}
                allowedActions={allowedActions}
              />
            </Grid>
          ))}
        </Grid>
      ) : null}

      {showPlaceholder ? (
        <Paper
          sx={{
            borderRadius: 3,
            p: { xs: 3, md: 5 },
            textAlign: 'center',
            bgcolor: alpha(theme.palette.primary.light, 0.08),
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            {placeholderTitle}
          </Typography>
          {placeholderSubtitle ? (
            <Typography variant="body2" color="text.secondary">
              {placeholderSubtitle}
            </Typography>
          ) : null}
          {placeholderHelper ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {placeholderHelper}
            </Typography>
          ) : null}
        </Paper>
      ) : null}
    </Stack>
  );
});
