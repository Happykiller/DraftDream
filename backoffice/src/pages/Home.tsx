import React, { useMemo } from 'react';
import { Box, Typography, Button, useTheme, Chip } from '@mui/material';
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

// Hooks

import { useProspects } from '@hooks/useProspects';
import { useUsers } from '@hooks/useUsers';
import { usePrograms } from '@hooks/usePrograms';
import { useSessions } from '@hooks/useSessions';
import { useExercises } from '@hooks/useExercises';
import { useMealPlans } from '@hooks/useMealPlans';
import { useMealDays } from '@hooks/useMealDays';
// import { ProspectStatus } from '@src/commons/prospects/status';

// Components
import { DashboardLayout } from '@components/dashboard/DashboardLayout';
import { StatCard } from '@components/dashboard/widgets/StatCard';
import { GrowthChartWidget } from '@components/dashboard/widgets/GrowthChartWidget';
import { DistributionChartWidget } from '@components/dashboard/widgets/DistributionChartWidget';
import { ProspectsListWidget } from '@components/dashboard/widgets/ProspectsListWidget';

// Utility for aggregation (simple version)
const getGrowthData = (items: any[], dateKey = 'createdAt') => {
  if (!items || items.length === 0) return [];

  // Sort by date
  const sorted = [...items].sort((a, b) => new Date(a[dateKey]).getTime() - new Date(b[dateKey]).getTime());

  // Take last 30 items or so for the trend
  const recent = sorted.slice(-30);

  return recent.map((item, index) => ({
    name: new Date(item[dateKey]).toLocaleDateString(),
    value: index + 1, // Cumulative count
  }));
};

const getDistributionData = (items: any[], key: string, labelMap?: Record<string, string>) => {
  const counts: Record<string, number> = {};
  items.forEach(item => {
    const val = item[key] || 'Unknown';
    counts[val] = (counts[val] || 0) + 1;
  });

  return Object.keys(counts).map(k => ({
    name: labelMap?.[k] || k,
    value: counts[k]
  }));
};

export function Home(): React.JSX.Element {
  const { t } = useTranslation();
  const theme = useTheme();
  const navigate = useNavigate();
  // const { user: currentUser } = useUser();

  // -- Data Fetching --

  // Prospects
  const { items: prospects, total: totalProspects } = useProspects({ page: 1, limit: 100, q: '' });

  // Users
  const { total: totalCoaches } = useUsers({ page: 1, limit: 100, q: '', type: 'coach' });
  const { total: totalAthletes } = useUsers({ page: 1, limit: 100, q: '', type: 'athlete' });

  // Content
  const { items: programs, total: totalPrograms } = usePrograms({ page: 1, limit: 100, q: '' });
  const { total: totalSessions } = useSessions({ page: 1, limit: 100, q: '' });
  const { total: totalExercises } = useExercises({ page: 1, limit: 100, q: '' });
  const { items: mealPlans, total: totalMealPlans } = useMealPlans({ page: 1, limit: 100, q: '' });
  const { total: totalMealDays } = useMealDays({ page: 1, limit: 100, q: '' });

  // -- Derived Data for Widgets --

  // "My Prospects" -> "A faire"
  const myProspects = useMemo(() => {
    // User requested "prospects au status 'todo'"
    // We remove the check on currentUser?.id because we don't actually filter by user ownership yet
    // and we want to show the prospects as soon as they are loaded.
    return prospects.filter(p => p.status === 'TODO').slice(0, 5);
  }, [prospects]);

  // Charts Data
  const prospectsGrowth = useMemo(() => getGrowthData(prospects), [prospects]);
  const programsGrowth = useMemo(() => getGrowthData(programs), [programs]);
  const nutritionGrowth = useMemo(() => getGrowthData(mealPlans), [mealPlans]);

  // Breakdowns
  const programDistribution = useMemo(() => {
    return getDistributionData(programs, 'visibility', { 'PUBLIC': t('common.visibility.public'), 'PRIVATE': t('common.visibility.private') });
  }, [programs, t]);

  const userDistribution = [
    { name: t('users.types.coach'), value: totalCoaches, color: theme.palette.secondary.main },
    { name: t('users.types.athlete'), value: totalAthletes, color: theme.palette.primary.main },
  ];


  return (
    <React.Fragment>

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
            <Chip label={`${programDistribution.find(d => d.name === t('common.visibility.public'))?.value || 0} ${t('common.visibility.public')}`} size="small" variant="outlined" />
            <Chip label={`${programDistribution.find(d => d.name === t('common.visibility.private'))?.value || 0} ${t('common.visibility.private')}`} size="small" variant="outlined" />
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
