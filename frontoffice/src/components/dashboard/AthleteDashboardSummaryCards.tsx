import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, Stack, Typography } from '@mui/material';
import RestaurantMenuOutlinedIcon from '@mui/icons-material/RestaurantMenuOutlined';
import FitnessCenterOutlinedIcon from '@mui/icons-material/FitnessCenterOutlined';

import { useMealPlans } from '@hooks/nutrition/useMealPlans';
import { usePrograms } from '@hooks/programs/usePrograms';

/** Summary cards dedicated to athletes. */
export function AthleteDashboardSummaryCards(): React.JSX.Element {
  const { t } = useTranslation();

  const { total: programsCount, loading: programsLoading } = usePrograms({
    page: 1,
    limit: 1,
    q: '',
  });

  const { total: mealPlansCount, loading: mealPlansLoading } = useMealPlans({
    page: 1,
    limit: 1,
    q: '',
  });

  const cards = [
    {
      label: t('dashboard.summary.programs'),
      value: programsCount,
      loading: programsLoading,
      icon: <FitnessCenterOutlinedIcon sx={{ color: 'warning.main', fontSize: 40 }} />,
    },
    {
      label: t('dashboard.summary.nutrition'),
      value: mealPlansCount,
      loading: mealPlansLoading,
      icon: <RestaurantMenuOutlinedIcon sx={{ color: 'success.main', fontSize: 40 }} />,
    },
  ];

  return (
    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} flexWrap="wrap" useFlexGap>
      {/* General information */}
      {cards.map((card, index) => (
        <Card
          key={index}
          elevation={0}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            flex: { xs: '1 1 100%', sm: '1 1 45%', md: '1 1 0' },
            minWidth: 0,
          }}
        >
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              {card.icon}
              <Stack>
                <Typography variant="subtitle2" color="text.secondary" noWrap>
                  {card.label}
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {card.loading ? '-' : card.value}
                </Typography>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}
