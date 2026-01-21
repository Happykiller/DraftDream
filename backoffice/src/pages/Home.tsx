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
import { SessionsWidget } from '@components/dashboard/widgets/home/SessionsWidget';
import { DayMealsWidget } from '@components/dashboard/widgets/home/DayMealsWidget';
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
  const { items: sessions, total: totalSessions } = useSessions({ page: 1, limit: PAGE_SIZE, q: '' });
  const { items: exercises, total: totalExercises } = useExercises({ page: 1, limit: PAGE_SIZE, q: '' });
  const { items: mealPlans, total: totalMealPlans } = useMealPlans({ page: 1, limit: PAGE_SIZE, q: '' });
  const { items: mealDays, total: totalMealDays } = useMealDays({ page: 1, limit: PAGE_SIZE, q: '' });

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

  const sessionDistribution = useMemo(() => {
    return getDistributionData(sessions, 'visibility', {
      PUBLIC: t('common.visibility.public'),
      PRIVATE: t('common.visibility.private'),
    });
  }, [sessions, t]);

  const sessionVisibility = useMemo(() => {
    const publicLabel = t('common.visibility.public');
    const privateLabel = t('common.visibility.private');

    return {
      publicLabel,
      privateLabel,
      publicCount: sessionDistribution.find((item) => item.name === publicLabel)?.value ?? 0,
      privateCount: sessionDistribution.find((item) => item.name === privateLabel)?.value ?? 0,
    };
  }, [sessionDistribution, t]);

  const exerciseDistribution = useMemo(() => {
    return getDistributionData(exercises, 'visibility', {
      PUBLIC: t('common.visibility.public'),
      PRIVATE: t('common.visibility.private'),
    });
  }, [exercises, t]);

  const exerciseVisibility = useMemo(() => {
    const publicLabel = t('common.visibility.public');
    const privateLabel = t('common.visibility.private');

    return {
      publicLabel,
      privateLabel,
      publicCount: exerciseDistribution.find((item) => item.name === publicLabel)?.value ?? 0,
      privateCount: exerciseDistribution.find((item) => item.name === privateLabel)?.value ?? 0,
    };
  }, [exerciseDistribution, t]);

  const mealDayDistribution = useMemo(() => {
    return getDistributionData(mealDays, 'visibility', {
      PUBLIC: t('common.visibility.public'),
      PRIVATE: t('common.visibility.private'),
    });
  }, [mealDays, t]);

  const mealDayVisibility = useMemo(() => {
    const publicLabel = t('common.visibility.public');
    const privateLabel = t('common.visibility.private');

    return {
      publicLabel,
      privateLabel,
      publicCount: mealDayDistribution.find((item) => item.name === publicLabel)?.value ?? 0,
      privateCount: mealDayDistribution.find((item) => item.name === privateLabel)?.value ?? 0,
    };
  }, [mealDayDistribution, t]);

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

        {/* Sessions */}
        <SessionsWidget
          totalSessions={totalSessions}
          publicCount={sessionVisibility.publicCount}
          privateCount={sessionVisibility.privateCount}
          publicLabel={sessionVisibility.publicLabel}
          privateLabel={sessionVisibility.privateLabel}
        />

        {/* Exercises */}
        <ExercisesLibraryWidget
          totalExercises={totalExercises}
          publicCount={exerciseVisibility.publicCount}
          privateCount={exerciseVisibility.privateCount}
          publicLabel={exerciseVisibility.publicLabel}
          privateLabel={exerciseVisibility.privateLabel}
        />

        {/* Nutrition Plans */}
        <NutritionPlansWidget
          totalMealPlans={totalMealPlans}
          publicCount={mealPlanVisibility.publicCount}
          privateCount={mealPlanVisibility.privateCount}
          publicLabel={mealPlanVisibility.publicLabel}
          privateLabel={mealPlanVisibility.privateLabel}
        />

        {/* Meal Days */}
        <DayMealsWidget
          totalMealDays={totalMealDays}
          publicCount={mealDayVisibility.publicCount}
          privateCount={mealDayVisibility.privateCount}
          publicLabel={mealDayVisibility.publicLabel}
          privateLabel={mealDayVisibility.privateLabel}
        />

      </DashboardLayout>
    </React.Fragment>
  );
}
