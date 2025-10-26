// src/pages/Profile.tsx
import * as React from 'react';
import {
  Card,
  CardContent,
  Container,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';

import { shallow } from 'zustand/shallow';

import { session } from '@stores/session';

/** Display a single label/value row inside the profile details card. */
function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={500} sx={{ ml: 2 }}>
        {value}
      </Typography>
    </Stack>
  );
}

/** Profile page summarising the authenticated session snapshot. */
export function Profile(): React.JSX.Element {
  const { t } = useTranslation();
  // Subscribe with shallow equality to avoid redundant renders when the session remains unchanged.
  const snapshot = session(
    (state) => ({
      id: state.id,
      accessToken: state.access_token,
      firstName: state.name_first,
      lastName: state.name_last,
      role: state.role,
    }),
    shallow,
  );

  const fullName = React.useMemo(() => {
    const first = snapshot.firstName?.trim() ?? '';
    const last = snapshot.lastName?.trim() ?? '';
    const combined = `${first} ${last}`.trim();

    if (combined.length === 0) {
      return t('profile.session_card.empty');
    }

    return combined;
  }, [snapshot.firstName, snapshot.lastName, t]);

  const maskedToken = React.useMemo(() => {
    const token = snapshot.accessToken?.trim();
    if (!token) {
      return t('profile.session_card.empty');
    }

    if (token.length <= 12) {
      return token;
    }

    return `${token.slice(0, 6)}…${token.slice(-4)}`;
  }, [snapshot.accessToken, t]);

  const role = React.useMemo(() => snapshot.role ?? t('profile.session_card.empty'), [snapshot.role, t]);
  const identifier = React.useMemo(() => snapshot.id ?? t('profile.session_card.empty'), [snapshot.id, t]);

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

        <Card>
          <CardContent>
            <Stack spacing={2}>
              <Stack spacing={0.5}>
                <Typography variant="h6">{t('profile.session_card.title')}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {t('profile.session_card.description')}
                </Typography>
              </Stack>

              <Divider />

              <Stack spacing={1.5}>
                <ProfileField label={t('profile.session_card.fields.full_name')} value={fullName} />
                <ProfileField label={t('profile.session_card.fields.role')} value={role} />
                <ProfileField label={t('profile.session_card.fields.identifier')} value={identifier} />
                <ProfileField label={t('profile.session_card.fields.access_token')} value={maskedToken} />
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Container>
  );
}
