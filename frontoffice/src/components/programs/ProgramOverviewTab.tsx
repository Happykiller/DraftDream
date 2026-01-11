import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Chip, Paper, Stack, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import type { OverviewInfoItem, ProgramStatItem } from './programViewUtils';

interface ProgramOverviewTabProps {
    overviewInfoItems: OverviewInfoItem[];
    statsItems: ProgramStatItem[];
    description: string;
}

export function ProgramOverviewTab({
    overviewInfoItems,
    statsItems,
    description,
}: ProgramOverviewTabProps): React.JSX.Element {
    const { t } = useTranslation();

    return (
        <Stack spacing={3}>
            <Stack spacing={2}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {t('programs-coatch.view.sections.overview')}
                </Typography>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <Paper
                        variant="outlined"
                        sx={{
                            flex: 1,
                            borderRadius: 2,
                            p: 2.5,
                        }}
                    >
                        <Stack spacing={2}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {t('programs-coatch.view.sections.information')}
                            </Typography>
                            <Stack spacing={1.5}>
                                {overviewInfoItems.map(({ key, label, value, fallback, Icon, isChip }) => (
                                    <Stack key={key} spacing={1}>
                                        <Typography variant="body2" color="text.secondary">
                                            {label}
                                        </Typography>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <Icon fontSize="small" color="action" />
                                            {isChip && value ? (
                                                <Chip
                                                    size="small"
                                                    label={value}
                                                    sx={(theme) => ({
                                                        bgcolor: alpha(theme.palette.success.main, 0.16),
                                                        color: theme.palette.success.main,
                                                        fontWeight: 600,
                                                    })}
                                                />
                                            ) : (
                                                <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                                    {value ?? fallback}
                                                </Typography>
                                            )}
                                        </Stack>
                                    </Stack>
                                ))}
                            </Stack>
                        </Stack>
                    </Paper>
                    <Paper
                        variant="outlined"
                        sx={{
                            flex: 1,
                            borderRadius: 2,
                            p: 2.5,
                        }}
                    >
                        <Stack spacing={2}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                                {t('programs-coatch.view.sections.stats')}
                            </Typography>
                            <Stack spacing={1.5}>
                                {statsItems.map(({ key, label, value }) => (
                                    <Stack key={key} spacing={1}>
                                        <Typography variant="body2" color="text.secondary">
                                            {label}
                                        </Typography>
                                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                            {value}
                                        </Typography>
                                    </Stack>
                                ))}
                            </Stack>
                        </Stack>
                    </Paper>
                </Stack>
            </Stack>

            <Paper
                variant="outlined"
                sx={{
                    borderRadius: 2,
                    p: 2.5,
                }}
            >
                <Stack spacing={2}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        {t('programs-coatch.view.sections.description')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {description}
                    </Typography>
                </Stack>
            </Paper>
        </Stack>
    );
}
