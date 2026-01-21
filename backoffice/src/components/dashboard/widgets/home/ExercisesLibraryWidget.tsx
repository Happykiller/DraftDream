import React from 'react';
import { SportsGymnastics } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

import { StatCard } from '@components/dashboard/widgets/StatCard';

interface ExercisesLibraryWidgetProps {
    totalExercises: number;
}

// Dashboard widget for exercise library size.
export const ExercisesLibraryWidget: React.FC<ExercisesLibraryWidgetProps> = ({ totalExercises }) => {
    const { t } = useTranslation();

    return (
        <React.Fragment>
            {/* General information */}
            <StatCard
                title={t('home.widgets.exercises_library')}
                tooltip={t('home.widgets.exercises_library_tooltip')}
                value={totalExercises}
                icon={SportsGymnastics}
                colSpan={1}
            />
        </React.Fragment>
    );
};
