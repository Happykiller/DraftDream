import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Box, Stack, Typography } from '@mui/material';
import RestaurantMenuOutlinedIcon from '@mui/icons-material/RestaurantMenuOutlined';
import FitnessCenterOutlinedIcon from '@mui/icons-material/FitnessCenterOutlined';

import { useMealPlans } from '@hooks/nutrition/useMealPlans';
import { usePrograms } from '@hooks/programs/usePrograms';
import { GlassCard } from '../common/GlassCard';

/** Summary cards dedicated to athletes. */
export function AthleteDashboardSummaryCards(): React.JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();

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
      path: '/programs-athlete',
    },
    {
      label: t('dashboard.summary.nutrition'),
      value: mealPlansCount,
      loading: mealPlansLoading,
      icon: <RestaurantMenuOutlinedIcon sx={{ color: 'success.main', fontSize: 40 }} />,
      path: '/nutrition-athlete',
    },
  ];

  return (
    <Box
      display="grid"
      gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }}
      gap={3}
    >
      {cards.map((card, index) => (
        <GlassCard key={index} onClick={() => navigate(card.path)}>
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
        </GlassCard>
      ))}
    </Box>
  );
}
