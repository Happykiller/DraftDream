// src/pages/Prospects.tsx
import * as React from 'react';
import { Stack, Tab, Tabs } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { ActivityPreferencesPanel } from '@pages/prospects/ActivityPreferencesPanel';
import { ObjectivesPanel } from '@pages/prospects/ObjectivesPanel';

export function Prospects(): React.JSX.Element {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const tab = (params.get('tab') || 'objectives') as string;

  const setTab = (val: string) =>
    setParams((prev) => {
      const sp = new URLSearchParams(prev);
      sp.set('tab', val);
      return sp;
    }, { replace: true });

  return (
    <Stack spacing={3} sx={{ mt: 3, width: '100%' }}>
      {/* General information */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        aria-label={t('prospects.tabs.aria_label')}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab value="objectives" label={t('prospects.tabs.objectives')} />
        <Tab value="activity-preferences" label={t('prospects.tabs.activity_preferences')} />
      </Tabs>

      {tab === 'objectives' && <ObjectivesPanel />}
      {tab === 'activity-preferences' && <ActivityPreferencesPanel />}
    </Stack>
  );
}
