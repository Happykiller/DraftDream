import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { ProspectStatus } from '@commons/prospects/status';

import { useUsers } from '@hooks/useUsers';
import { usePrograms } from '@hooks/usePrograms';
import { useSessions } from '@hooks/useSessions';
import { useMealDays } from '@hooks/useMealDays';
import { useProspects } from '@hooks/useProspects';
import { useExercises } from '@hooks/useExercises';
import { useMealPlans } from '@hooks/useMealPlans';

import { DashboardLayout } from '@components/dashboard/DashboardLayout';
import { TotalUsersWidget } from '@components/dashboard/widgets/home/TotalUsersWidget';
import { ProgramsWidget } from '@components/dashboard/widgets/home/ProgramsWidget';
import { ProspectsWidget } from '@components/dashboard/widgets/home/ProspectsWidget';
import { ProspectsTodoWidget } from '@components/dashboard/widgets/home/ProspectsTodoWidget';
import { SessionsPrivateWidget } from '@components/dashboard/widgets/home/SessionsPrivateWidget';
import { DayMealsPrivateWidget } from '@components/dashboard/widgets/home/DayMealsPrivateWidget';
import { NutritionPlansWidget } from '@components/dashboard/widgets/home/NutritionPlansWidget';
import { ExercisesLibraryWidget } from '@components/dashboard/widgets/home/ExercisesLibraryWidget';

import {
  getDistributionData,
  PAGE_SIZE
} from './Home.utils';

export function Home(): React.JSX.Element {
  const { t } = useTranslation();
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

  const mealPlanDistribution = useMemo(() => {
    return getDistributionData(mealPlans, 'visibility', {
      PUBLIC: t('common.visibility.public'),
      PRIVATE: t('common.visibility.private'),
    });
  }, [mealPlans, t]);

  const mealPlanVisibility = useMemo(() => {
    const publicLabel = t('common.visibility.public');
    const privateLabel = t('common.visibility.private');

    return {
      publicLabel,
      privateLabel,
      publicCount: mealPlanDistribution.find((item) => item.name === publicLabel)?.value ?? 0,
      privateCount: mealPlanDistribution.find((item) => item.name === privateLabel)?.value ?? 0,
    };
  }, [mealPlanDistribution, t]);

  return (
    <React.Fragment>
      {/* General information */}
      <DashboardLayout>

        {/* --- Row 1: High Level Stats --- */}

        {/* Total Users & Split */}
        <TotalUsersWidget totalCoaches={totalCoaches} totalAthletes={totalAthletes} />

        {/* Prospects A Faire */}
        <ProspectsTodoWidget
          prospects={myProspects}
          onViewProspects={() => navigate('/prospects')}
        />

        {/* Total Prospects Trend */}
        <ProspectsWidget prospects={prospects} totalProspects={totalProspects} />


        {/* --- Row 2: Content Stats --- */}

        {/* Programs */}
        <ProgramsWidget
          totalPrograms={totalPrograms}
          publicCount={programVisibility.publicCount}
          privateCount={programVisibility.privateCount}
          publicLabel={programVisibility.publicLabel}
          privateLabel={programVisibility.privateLabel}
        />

        {/* Nutrition Plans */}
        <NutritionPlansWidget
          totalMealPlans={totalMealPlans}
          publicCount={mealPlanVisibility.publicCount}
          privateCount={mealPlanVisibility.privateCount}
          publicLabel={mealPlanVisibility.publicLabel}
          privateLabel={mealPlanVisibility.privateLabel}
        />


        {/* --- Row 3: Detail / Volume --- */}

        {/* Sessions */}
        <SessionsPrivateWidget totalSessions={totalSessions} />

        {/* Exercises */}
        <ExercisesLibraryWidget totalExercises={totalExercises} />

        {/* Meal Days */}
        <DayMealsPrivateWidget totalMealDays={totalMealDays} />

      </DashboardLayout>
    </React.Fragment>
  );
}
