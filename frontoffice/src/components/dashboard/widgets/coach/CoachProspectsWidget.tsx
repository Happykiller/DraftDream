import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Stack, Typography } from '@mui/material';
import QueryStatsOutlinedIcon from '@mui/icons-material/QueryStatsOutlined';

import { UserType } from '@src/commons/enums';
import { ProspectStatus } from '@src/commons/prospects/status';
import { useProspects } from '@hooks/prospects/useProspects';
import { session } from '@stores/session';
import { GlassCard } from '../../../common/GlassCard';

export function CoachProspectsWidget(): React.JSX.Element | null {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const role = session((state) => state.role);
    const canSeeLeadData = role === UserType.Admin || role === UserType.Coach;

    // 1. Clients count
    const { total: clientCount, loading: clientsLoading } = useProspects({
        page: 1,
        limit: 1,
        status: ProspectStatus.CLIENT,
        enabled: canSeeLeadData,
    });

    // 2. All prospects count
    const { total: totalProspectsCount, loading: totalProspectsLoading } = useProspects({
        page: 1,
        limit: 1,
        enabled: canSeeLeadData,
    });

    const prospectCount = Math.max(0, totalProspectsCount - clientCount);
    const loading = totalProspectsLoading || clientsLoading;

    if (!canSeeLeadData) {
        return null;
    }

    return (
        <GlassCard onClick={() => navigate('/prospects')}>
            <Stack direction="row" alignItems="center" spacing={2}>
                <QueryStatsOutlinedIcon sx={{ color: 'secondary.main', fontSize: 40 }} />
                <Stack>
                    <Typography variant="subtitle2" color="text.secondary" noWrap>
                        {t('dashboard.summary.prospects')}
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                        {loading ? '-' : prospectCount}
                    </Typography>
                </Stack>
            </Stack>
        </GlassCard>
    );
}
