// src/pages/Profile.tsx
import * as React from 'react';
import {
  Container,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

import type { SessionStoreModel } from '@stores/session';
import { session } from '@stores/session';

/** Profile page rendering the persisted session store snapshot. */
export function Profile(): React.JSX.Element {
  const { t } = useTranslation();
  const snapshot = session();

  const sessionData = React.useMemo<Omit<SessionStoreModel, 'reset'>>(() => {
    const { reset, ...rest } = snapshot;

    return rest;
  }, [snapshot]);

  const formattedSnapshot = React.useMemo(() => JSON.stringify(sessionData, null, 2), [sessionData]);

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 6 }}>
      {/* General information */}
      <Stack spacing={3}>
        <Stack spacing={1}>
          <Typography variant="h4">{t('profile.title')}</Typography>
          <Typography variant="body1" color="text.secondary">
            {t('profile.subtitle')}
          </Typography>
        </Stack>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Stack spacing={1.5}>
            <Stack spacing={0.5}>
              <Typography variant="h6">{t('profile.snapshot.title')}</Typography>
              <Typography variant="body2" color="text.secondary">
                {t('profile.snapshot.description')}
              </Typography>
            </Stack>

            <Typography
              component="pre"
              variant="body2"
              sx={{
                m: 0,
                p: 0,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {formattedSnapshot}
            </Typography>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
