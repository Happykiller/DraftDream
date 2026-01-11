import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Stack, Typography } from '@mui/material';

import type { ProgramSession } from '@hooks/programs/usePrograms';

import { ProgramSessionCard } from './ProgramSessionCard';

interface ProgramSessionsTabProps {
    sessions: ProgramSession[];
}

export function ProgramSessionsTab({ sessions }: ProgramSessionsTabProps): React.JSX.Element {
    const { t } = useTranslation();

    const formatRestDuration = React.useCallback(
        (restSeconds?: number | null) => {
            if (!restSeconds || restSeconds <= 0) {
                return null;
            }

            const minutes = Math.floor(restSeconds / 60);
            const seconds = restSeconds % 60;

            if (minutes > 0 && seconds > 0) {
                return t('programs-coatch.view.exercises.rest_duration.minutes_seconds', { minutes, seconds });
            }

            if (minutes > 0) {
                return t('programs-coatch.view.exercises.rest_duration.minutes', { count: minutes });
            }

            return t('programs-coatch.view.exercises.rest_duration.seconds', { count: seconds });
        },
        [t],
    );

    if (sessions.length === 0) {
        return (
            <Typography variant="body2" color="text.secondary">
                {t('programs-coatch.list.no_sessions')}
            </Typography>
        );
    }

    return (
        <Stack spacing={2.5}>
            {sessions.map((session, sessionIndex) => (
                <ProgramSessionCard
                    key={session.id}
                    session={session}
                    sessionIndex={sessionIndex}
                    formatRestDuration={formatRestDuration}
                />
            ))}
        </Stack>
    );
}
