// src/pages/Athletes.tsx
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Refresh } from '@mui/icons-material';
import { IconButton, Stack, Tooltip, Typography } from '@mui/material';

import { AthleteLinkList } from '@components/athletes/AthleteLinkList';
import { useCoachAthletes } from '@hooks/athletes/useCoachAthletes';
import { session } from '@stores/session';

/** Coach view displaying linked athletes with quick filtering. */
export function Athletes(): React.JSX.Element {
  const { t } = useTranslation();
  const coachId = session((state) => state.id);
  const { items, loading, reload } = useCoachAthletes({ coachId });
  const [searchQuery, setSearchQuery] = React.useState('');

  return (
    <Stack spacing={3} sx={{ width: '100%', mt: 2, px: { xs: 1, sm: 2 } }}>
      {/* General information */}
      <Stack spacing={1}>
        <Stack alignItems="center" direction="row" flexWrap="wrap" justifyContent="space-between" spacing={2}>
          <Stack spacing={0.5}>
            <Typography variant="h5">{t('athletes.subtitle')}</Typography>
            <Typography color="text.secondary" variant="body2">
              {t('athletes.helper')}
            </Typography>
          </Stack>
          <Tooltip title={t('athletes.actions.refresh')}>
            <IconButton aria-label="refresh-athletes" color="primary" onClick={() => void reload()} size="small">
              <Refresh fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      <AthleteLinkList
        links={items}
        loading={loading}
        searchQuery={searchQuery}
        searchPlaceholder={t('athletes.list.search_placeholder')}
        searchAriaLabel={t('athletes.list.search_aria')}
        emptyTitle={t('athletes.list.empty_title')}
        emptyDescription={t('athletes.list.empty_description')}
        onSearchChange={setSearchQuery}
      />
    </Stack>
  );
}
