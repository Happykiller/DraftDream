import React, { useMemo } from 'react';
import { Box, Button, Chip, Typography, useTheme } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  People,
  SportsGymnastics,
  FitnessCenter,
  Restaurant,
  EventNote,
  Timer,
  RestaurantMenu,
  TrendingUp
} from '@mui/icons-material';

import { ProspectStatus } from '@commons/prospects/status';

import { useProspects } from '@hooks/useProspects';
import { useUsers } from '@hooks/useUsers';
import { usePrograms } from '@hooks/usePrograms';
import { useSessions } from '@hooks/useSessions';
import { useExercises } from '@hooks/useExercises';
import { useMealPlans } from '@hooks/useMealPlans';
import { useMealDays } from '@hooks/useMealDays';

import { DashboardLayout } from '@components/dashboard/DashboardLayout';
import { StatCard } from '@components/dashboard/widgets/StatCard';
import { GrowthChartWidget } from '@components/dashboard/widgets/GrowthChartWidget';
import { DistributionChartWidget } from '@components/dashboard/widgets/DistributionChartWidget';
import { ProspectsListWidget } from '@components/dashboard/widgets/ProspectsListWidget';

import {
  getGrowthData,
  getDistributionData,
  PAGE_SIZE
} from './Home.utils';

export function Home(): React.JSX.Element {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();

  const { items: prospects, total: totalProspects } = useProspects({ page: 1, limit: PAGE_SIZE, q: '' });
  const { total: totalCoaches } = useUsers({ page: 1, limit: PAGE_SIZE, q: '', type: 'coach' });
  const { total: totalAthletes } = useUsers({ page: 1, limit: PAGE_SIZE, q: '', type: 'athlete' });
  const { items: programs, total: totalPrograms } = usePrograms({ page: 1, limit: PAGE_SIZE, q: '' });
  const { total: totalSessions } = useSessions({ page: 1, limit: PAGE_SIZE, q: '' });
  const { total: totalExercises } = useExercises({ page: 1, limit: PAGE_SIZE, q: '' });
  const { items: mealPlans, total: totalMealPlans } = useMealPlans({ page: 1, limit: PAGE_SIZE, q: '' });
  const { total: totalMealDays } = useMealDays({ page: 1, limit: PAGE_SIZE, q: '' });

  // Keep the list limited to actionable prospects.
  const myProspects = useMemo(() => {
    return prospects.filter((prospect) => prospect.status === ProspectStatus.TODO).slice(0, 5);
  }, [prospects]);

  const prospectsGrowth = useMemo(() => getGrowthData(prospects), [prospects]);
  const programsGrowth = useMemo(() => getGrowthData(programs), [programs]);
  const nutritionGrowth = useMemo(() => getGrowthData(mealPlans), [mealPlans]);

  const programDistribution = useMemo(() => {
    return getDistributionData(programs, 'visibility', {
      PUBLIC: t('common.visibility.public'),
      PRIVATE: t('common.visibility.private'),
    });
  }, [programs, t]);

  const programVisibility = useMemo(() => {
    const publicLabel = t('common.visibility.public');
    const privateLabel = t('common.visibility.private');

    return {
      publicLabel,
      privateLabel,
      publicCount: programDistribution.find((item) => item.name === publicLabel)?.value ?? 0,
      privateCount: programDistribution.find((item) => item.name === privateLabel)?.value ?? 0,
    };
  }, [programDistribution, t]);

  const userDistribution = [
    { name: t('users.types.coach'), value: totalCoaches, color: theme.palette.secondary.main },
    { name: t('users.types.athlete'), value: totalAthletes, color: theme.palette.primary.main },
  ];

  return (
    <React.Fragment>
      {/* General information */}
      <DashboardLayout>

        {/* --- Row 1: High Level Stats --- */}

        {/* Total Users & Split */}
        <DistributionChartWidget
          title={t('home.widgets.total_users')}
          value={totalCoaches + totalAthletes}
          icon={People}
          colSpan={1}
          color={theme.palette.info.main}
          data={userDistribution}
          height={150}
        />

        {/* Prospects A Faire */}
        <ProspectsListWidget
          title={t('home.widgets.prospects_todo')}
          value={myProspects.length}
          icon={TrendingUp}
          colSpan={1}
          color={theme.palette.warning.main}
          prospects={myProspects}
        >
          <Button size="small" fullWidth onClick={() => navigate('/prospects')} sx={{ mt: 1 }}>
            {t('home.widgets.view_prospects')}
          </Button>
        </ProspectsListWidget>

        {/* Total Prospects Trend */}
        <GrowthChartWidget
          title={t('home.widgets.total_prospects')}
          value={totalProspects}
          icon={People}
          colSpan={1}
          data={prospectsGrowth}
          height={80}
          color={theme.palette.success.main}
        />


        {/* --- Row 2: Content Stats --- */}

        {/* Programs */}
        <GrowthChartWidget
          title={t('home.widgets.programs')}
          value={totalPrograms}
          icon={FitnessCenter}
          colSpan={1}
          color={theme.palette.primary.main}
          data={programsGrowth}
          height={60}
        >
          <Box sx={{ display: 'flex', gap: 1, mt: 1, mb: 1 }}>
            <Chip
              label={`${programVisibility.publicCount} ${programVisibility.publicLabel}`}
              size="small"
              variant="outlined"
            />
            <Chip
              label={`${programVisibility.privateCount} ${programVisibility.privateLabel}`}
              size="small"
              variant="outlined"
            />
          </Box>
        </GrowthChartWidget>

        {/* Nutrition Plans */}
        <GrowthChartWidget
          title={t('home.widgets.nutrition_plans')}
          value={totalMealPlans}
          icon={Restaurant}
          colSpan={1}
          color={theme.palette.secondary.main}
          data={nutritionGrowth}
          height={80}
        />


        {/* --- Row 3: Detail / Volume --- */}

        {/* Sessions */}
        <StatCard
          title={t('home.widgets.sessions_private')}
          value={totalSessions}
          icon={Timer}
          colSpan={1}
          color={theme.palette.error.main}
        />

        {/* Exercises */}
        <StatCard
          title={t('home.widgets.exercises_library')}
          value={totalExercises}
          icon={SportsGymnastics}
          colSpan={1}
        />

        {/* Meal Days */}
        <StatCard
          title={t('home.widgets.day_meals_private')}
          value={totalMealDays}
          icon={RestaurantMenu}
          colSpan={1}
        />

        {/* Empty / Placeholder for Layout Balance or Future Widget */}
        <StatCard
          title={t('home.widgets.completion')}
          value="98%"
          icon={EventNote}
          colSpan={1}
          color={theme.palette.success.light}
        >
          <Typography variant="caption" color="text.secondary">{t('home.widgets.system_health')}</Typography>
        </StatCard>

      </DashboardLayout>
    </React.Fragment>
  );
}
