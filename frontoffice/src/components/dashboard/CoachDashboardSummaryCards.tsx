import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, Stack, Typography } from '@mui/material';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import QueryStatsOutlinedIcon from '@mui/icons-material/QueryStatsOutlined';
import SportsGymnasticsOutlinedIcon from '@mui/icons-material/SportsGymnasticsOutlined';
import RestaurantMenuOutlinedIcon from '@mui/icons-material/RestaurantMenuOutlined';
import FitnessCenterOutlinedIcon from '@mui/icons-material/FitnessCenterOutlined';

import { UserType } from '@src/commons/enums';
import { ProspectStatus } from '@src/commons/prospects/status';
import { useCoachAthletes } from '@hooks/athletes/useCoachAthletes';
import { useMealPlans } from '@hooks/nutrition/useMealPlans';
import { usePrograms } from '@hooks/programs/usePrograms';
import { useProspects } from '@hooks/prospects/useProspects';
import { session } from '@stores/session';

/** Summary cards tailored for coaches and admins. */
export function CoachDashboardSummaryCards(): React.JSX.Element {
  const { t } = useTranslation();
  const coachId = session((state) => state.id);
  const role = session((state) => state.role);
  const canSeeLeadData = role === UserType.Admin || role === UserType.Coach;

  // 1. Athletes count (Coach-Athlete links)
  const { total: athleteCount, loading: athletesLoading } = useCoachAthletes({
    coachId,
    page: 1,
    limit: 1,
    enabled: canSeeLeadData,
  });

  // 2. Clients count (Prospects with status CLIENT)
  const { total: clientCount, loading: clientsLoading } = useProspects({
    page: 1,
    limit: 1,
    status: ProspectStatus.CLIENT,
    enabled: canSeeLeadData,
  });

  // 3. Prospects count (All prospects - Clients)
  // We fetch total prospects (no status filter) and subtract clients.
  // Note: This assumes "total" includes all statuses.
  const { total: totalProspectsCount, loading: totalProspectsLoading } = useProspects({
    page: 1,
    limit: 1,
    // No status filter to get all
    enabled: canSeeLeadData,
  });

  // 4. Sports Programs count
  const { total: programsCount, loading: programsLoading } = usePrograms({
    page: 1,
    limit: 1,
    q: '',
  });

  // 5. Nutrition Plans count
  const { total: mealPlansCount, loading: mealPlansLoading } = useMealPlans({
    page: 1,
    limit: 1,
    q: '',
  });

  const prospectCount = Math.max(0, totalProspectsCount - clientCount);
  const prospectsLoading = totalProspectsLoading || clientsLoading;

  const cards = [] as Array<{
    label: string;
    value: number;
    loading: boolean;
    icon: React.ReactNode;
  }>;

  if (canSeeLeadData) {
    cards.push(
      {
        label: t('dashboard.summary.athletes'),
        value: athleteCount,
        loading: athletesLoading,
        icon: <SportsGymnasticsOutlinedIcon sx={{ color: 'primary.main', fontSize: 40 }} />,
      },
      {
        label: t('dashboard.summary.clients'),
        value: clientCount,
        loading: clientsLoading,
        icon: <PersonOutlineOutlinedIcon sx={{ color: 'info.main', fontSize: 40 }} />,
      },
      {
        label: t('dashboard.summary.prospects'),
        value: prospectCount,
        loading: prospectsLoading,
        icon: <QueryStatsOutlinedIcon sx={{ color: 'secondary.main', fontSize: 40 }} />,
      },
    );
  }

  cards.push(
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
  );

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
