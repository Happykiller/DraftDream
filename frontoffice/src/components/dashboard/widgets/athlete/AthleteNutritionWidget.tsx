import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Stack, Typography } from '@mui/material';
import RestaurantMenuOutlinedIcon from '@mui/icons-material/RestaurantMenuOutlined';

import { useMealPlans } from '@hooks/nutrition/useMealPlans';
import { GlassCard } from '../../../common/GlassCard';

export function AthleteNutritionWidget(): React.JSX.Element {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const { total, loading } = useMealPlans({
        page: 1,
        limit: 1,
        q: '',
    });

    return (
        <GlassCard onClick={() => navigate('/nutrition-athlete')}>
            <Stack direction="row" alignItems="center" spacing={2}>
                <RestaurantMenuOutlinedIcon sx={{ color: 'success.main', fontSize: 40 }} />
                <Stack>
                    <Typography variant="subtitle2" color="text.secondary" noWrap>
                        {t('dashboard.summary.nutrition')}
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                        {loading ? '-' : total}
                    </Typography>
                </Stack>
            </Stack>
        </GlassCard>
    );
}
