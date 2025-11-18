// src/pages/Prospects.tsx
import * as React from 'react';
import { Stack, Tab, Tabs } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { ActivityPreferencesPanel } from '@pages/prospects/ActivityPreferencesPanel';
import { ClientsPanel } from '@pages/prospects/ClientsPanel';
import { LevelsPanel } from '@pages/prospects/LevelsPanel';
import { ObjectivesPanel } from '@pages/prospects/ObjectivesPanel';
import { SourcesPanel } from '@pages/prospects/SourcesPanel';
import { StatusesPanel } from '@pages/prospects/StatusesPanel';

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
        <Tab value="clients" label={t('prospects.tabs.clients')} />
        <Tab value="objectives" label={t('prospects.tabs.objectives')} />
        <Tab value="activity-preferences" label={t('prospects.tabs.activity_preferences')} />
        <Tab value="statuses" label={t('prospects.tabs.statuses')} />
        <Tab value="levels" label={t('prospects.tabs.levels')} />
        <Tab value="sources" label={t('prospects.tabs.sources')} />
      </Tabs>

      {tab === 'clients' && <ClientsPanel />}
      {tab === 'objectives' && <ObjectivesPanel />}
      {tab === 'activity-preferences' && <ActivityPreferencesPanel />}
      {tab === 'statuses' && <StatusesPanel />}
      {tab === 'levels' && <LevelsPanel />}
      {tab === 'sources' && <SourcesPanel />}
    </Stack>
  );
}
