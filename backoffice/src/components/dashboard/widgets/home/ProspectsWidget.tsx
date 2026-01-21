import React, { useMemo } from 'react';
import { PersonSearch } from '@mui/icons-material';
import { useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import {
    Bar,
    BarChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

import { ProspectStatus } from '@commons/prospects/status';
import type { Prospect } from '@hooks/useProspects';

import { StatCard } from '@components/dashboard/widgets/StatCard';

interface ProspectsWidgetProps {
    prospects: Prospect[];
    totalProspects: number;
}

const STATUS_ORDER = [
    ProspectStatus.LEAD,
    ProspectStatus.CONTACTED,
    ProspectStatus.MEETING_SCHEDULED,
    ProspectStatus.OFFER,
    ProspectStatus.NEGOTIATION,
    ProspectStatus.WON,
    ProspectStatus.LOST,
    ProspectStatus.TODO,
    ProspectStatus.CLIENT,
];

// Dashboard widget for total prospects and status distribution.
export const ProspectsWidget: React.FC<ProspectsWidgetProps> = ({
    prospects,
    totalProspects,
}) => {
    const { t } = useTranslation();
    const theme = useTheme();

    const statusLabels = useMemo(() => ({
        [ProspectStatus.LEAD]: t('prospects.statuses.values.lead'),
        [ProspectStatus.CONTACTED]: t('prospects.statuses.values.contacted'),
        [ProspectStatus.MEETING_SCHEDULED]: t('prospects.statuses.values.meeting_scheduled'),
        [ProspectStatus.OFFER]: t('prospects.statuses.values.offer'),
        [ProspectStatus.NEGOTIATION]: t('prospects.statuses.values.negotiation'),
        [ProspectStatus.WON]: t('prospects.statuses.values.won'),
        [ProspectStatus.LOST]: t('prospects.statuses.values.lost'),
        [ProspectStatus.TODO]: t('prospects.statuses.values.todo'),
        [ProspectStatus.CLIENT]: t('prospects.statuses.values.client'),
    }), [t]);

    const statusData = useMemo(() => {
        const counts = prospects.reduce<Record<string, number>>((accumulator, prospect) => {
            const status = prospect.status ?? ProspectStatus.LEAD;
            accumulator[status] = (accumulator[status] ?? 0) + 1;
            return accumulator;
        }, {});

        return STATUS_ORDER.map((status) => ({
            name: statusLabels[status] ?? status,
            value: counts[status] ?? 0,
        }));
    }, [prospects, statusLabels]);

    return (
        <React.Fragment>
            {/* General information */}
            <StatCard
                title={t('home.widgets.total_prospects')}
                tooltip={t('home.widgets.total_prospects_tooltip')}
                value={totalProspects}
                icon={PersonSearch}
                colSpan={1}
                color={theme.palette.error.main}
            >
                <div style={{ width: '100%', height: 140 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={statusData} margin={{ top: 8, right: 12, left: 0, bottom: 28 }}>
                            <XAxis
                                dataKey="name"
                                interval={0}
                                angle={-45}
                                textAnchor="end"
                                tick={{ fontSize: 10 }}
                                height={60}
                                tickMargin={8}
                                tickLine={false}
                                axisLine={false}
                            />
                            <YAxis
                                allowDecimals={false}
                                tickLine={false}
                                axisLine={false}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: theme.palette.background.paper,
                                    border: `1px solid ${theme.palette.divider}`,
                                    borderRadius: 8,
                                }}
                                cursor={{ fill: theme.palette.action.hover }}
                            />
                            <Bar dataKey="value" fill={theme.palette.error.main} radius={[6, 6, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </StatCard>
        </React.Fragment>
    );
};
