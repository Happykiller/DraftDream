import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';

import { UserType } from '@src/commons/enums';
import { ProspectStatus } from '@src/commons/prospects/status';
import { useProspects } from '@hooks/prospects/useProspects';
import { session } from '@stores/session';
import { GlassCard } from '../../../common/GlassCard';

export function CoachClientsWidget(): React.JSX.Element | null {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const theme = useTheme();
    const role = session((state) => state.role);
    const canSeeLeadData = role === UserType.Admin || role === UserType.Coach;

    const { total, loading } = useProspects({
        page: 1,
        limit: 1,
        status: ProspectStatus.CLIENT,
        enabled: canSeeLeadData,
    });

    if (!canSeeLeadData) {
        return null;
    }

    return (
        <GlassCard
            onClick={() => navigate('/prospects')}
            accentColor={theme.palette.error.main}
        >
            <Stack direction="row" alignItems="center" spacing={2}>
                <PersonOutlineOutlinedIcon sx={{ color: 'error.main', fontSize: 40 }} />
                <Stack>
                    <Typography variant="subtitle2" color="text.secondary" noWrap>
                        {t('dashboard.summary.clients')}
                    </Typography>
                    <Typography variant="h4" fontWeight="bold">
                        {loading ? '-' : total}
                    </Typography>
                </Stack>
            </Stack>
        </GlassCard>
    );
}
