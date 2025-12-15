import React, { useMemo } from 'react';
import { Box, Typography, Button, useTheme, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
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
    return getDistributionData(programs, 'visibility', { 'PUBLIC': 'Public', 'PRIVATE': 'Private' });
  }, [programs]);

  const userDistribution = [
    { name: 'Coaches', value: totalCoaches, color: theme.palette.secondary.main },
    { name: 'Athletes', value: totalAthletes, color: theme.palette.primary.main },
  ];


  return (
    <React.Fragment>

      <DashboardLayout>

        {/* --- Row 1: High Level Stats --- */}

        {/* Total Users & Split */}
        <StatCard
          title="Total Users"
          value={totalCoaches + totalAthletes}
          icon={People}
          colSpan={1}
          trend={{ value: 12, label: 'vs last month' }}
          color={theme.palette.info.main}
        >
          {/* Tiny Pie Chart for Ratio */}
          <Box sx={{ height: 150, mt: 2 }}>
            <DistributionChartWidget data={userDistribution} height={150} />
          </Box>
        </StatCard>

        {/* Prospects A Faire */}
        {/* Prospects A Faire */}
        <StatCard
          title="A faire"
          value={myProspects.length}
          icon={TrendingUp}
          colSpan={1}
          color={theme.palette.warning.main}
        >
          <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
            <ProspectsListWidget prospects={myProspects} />
            <Button size="small" fullWidth onClick={() => navigate('/prospects')} sx={{ mt: 1 }}>
              Voir prospects
            </Button>
          </Box>
        </StatCard>

        {/* Total Prospects Trend */}
        <StatCard
          title="Total Prospects"
          value={totalProspects}
          icon={People}
          colSpan={1}
        >
          <GrowthChartWidget data={prospectsGrowth} height={80} color={theme.palette.success.main} />
        </StatCard>


        {/* --- Row 2: Content Stats --- */}

        {/* Programs */}
        <StatCard
          title="Programs"
          value={totalPrograms}
          icon={FitnessCenter}
          colSpan={1}
          color={theme.palette.primary.main}
        >
          <Box sx={{ display: 'flex', gap: 1, mt: 1, mb: 1 }}>
            <Chip label={`${programDistribution.find(d => d.name === 'Public')?.value || 0} Public`} size="small" variant="outlined" />
            <Chip label={`${programDistribution.find(d => d.name === 'Private')?.value || 0} Private`} size="small" variant="outlined" />
          </Box>
          <GrowthChartWidget data={programsGrowth} height={60} color={theme.palette.primary.main} />
        </StatCard>

        {/* Nutrition Plans */}
        <StatCard
          title="Nutrition Plans"
          value={totalMealPlans}
          icon={Restaurant}
          colSpan={1}
          color={theme.palette.secondary.main}
        >
          <GrowthChartWidget data={nutritionGrowth} height={80} color={theme.palette.secondary.main} />
        </StatCard>


        {/* --- Row 3: Detail / Volume --- */}

        {/* Sessions */}
        <StatCard
          title="Sessions (Private)"
          value={totalSessions}
          icon={Timer}
          colSpan={1}
          color={theme.palette.error.main}
        />

        {/* Exercises */}
        <StatCard
          title="Exercises Library"
          value={totalExercises}
          icon={SportsGymnastics}
          colSpan={1}
        />

        {/* Meal Days */}
        <StatCard
          title="Day Meals (Private)"
          value={totalMealDays}
          icon={RestaurantMenu}
          colSpan={1}
        />

        {/* Empty / Placeholder for Layout Balance or Future Widget */}
        <StatCard
          title="Completion"
          value="98%"
          icon={EventNote}
          colSpan={1}
          color={theme.palette.success.light}
        >
          <Typography variant="caption" color="text.secondary">System Health</Typography>
        </StatCard>

      </DashboardLayout>
    </React.Fragment>
  );
}
