import React from 'react';
import { RestaurantMenu } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

import { StatCard } from '@components/dashboard/widgets/StatCard';

interface DayMealsPrivateWidgetProps {
    totalMealDays: number;
}

// Dashboard widget for private meal days.
export const DayMealsPrivateWidget: React.FC<DayMealsPrivateWidgetProps> = ({ totalMealDays }) => {
    const { t } = useTranslation();

    return (
        <React.Fragment>
            {/* General information */}
            <StatCard
                title={t('home.widgets.day_meals_private')}
                tooltip={t('home.widgets.day_meals_private_tooltip')}
                value={totalMealDays}
                icon={RestaurantMenu}
                colSpan={1}
            />
        </React.Fragment>
    );
};
