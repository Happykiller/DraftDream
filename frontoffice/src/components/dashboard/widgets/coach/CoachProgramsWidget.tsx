import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Stack, Typography } from '@mui/material';
import FitnessCenterOutlinedIcon from '@mui/icons-material/FitnessCenterOutlined';

import { usePrograms } from '@hooks/programs/usePrograms';
import { GlassCard } from '../../../common/GlassCard';

export function CoachProgramsWidget(): React.JSX.Element {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const { total, loading } = usePrograms({
        page: 1,
        limit: 1,
        q: '',
    });

    return (
        <GlassCard onClick={() => navigate('/programs-coach')}>
            <Stack direction="row" alignItems="center" spacing={2}>
                <FitnessCenterOutlinedIcon sx={{ color: 'warning.main', fontSize: 40 }} />
                <Stack>
                    <Typography variant="subtitle2" color="text.secondary" noWrap>
                        {t('dashboard.summary.programs')}
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                        {loading ? '-' : total}
                    </Typography>
                </Stack>
            </Stack>
        </GlassCard>
    );
}
