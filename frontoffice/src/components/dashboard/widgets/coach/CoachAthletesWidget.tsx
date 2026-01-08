import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Stack, Typography } from '@mui/material';
import SportsGymnasticsOutlinedIcon from '@mui/icons-material/SportsGymnasticsOutlined';

import { UserType } from '@src/commons/enums';
import { useCoachAthletes } from '@hooks/athletes/useCoachAthletes';
import { session } from '@stores/session';
import { GlassCard } from '../../../common/GlassCard';

export function CoachAthletesWidget(): React.JSX.Element | null {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const coachId = session((state) => state.id);
    const role = session((state) => state.role);
    const canSeeLeadData = role === UserType.Admin || role === UserType.Coach;

    const { total, loading } = useCoachAthletes({
        coachId,
        page: 1,
        limit: 1,
        enabled: canSeeLeadData,
    });

    if (!canSeeLeadData) {
        return null;
    }

    return (
        <GlassCard onClick={() => navigate('/athletes')}>
            <Stack direction="row" alignItems="center" spacing={2}>
                <SportsGymnasticsOutlinedIcon sx={{ color: 'primary.main', fontSize: 40 }} />
                <Stack>
                    <Typography variant="subtitle2" color="text.secondary" noWrap>
                        {t('dashboard.summary.athletes')}
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                        {loading ? '-' : total}
                    </Typography>
                </Stack>
            </Stack>
        </GlassCard>
    );
}
