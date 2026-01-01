// src/pages/Programs.tsx
import * as React from 'react';
import { Stack, Tabs, Tab } from '@mui/material';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { TagsPanel } from '@pages/programs/TagsPanel';
import { MusclesPanel } from '@pages/programs/MusclesPanel';
import { SessionsPanel } from '@pages/programs/SessionsPanel';
import { EquipmentPanel } from '@pages/programs/EquipmentPanel';
import { ExercisesPanel } from '@pages/programs/ExercisesPanel';
import { CategoriesPanel } from '@pages/programs/CategoriesPanel';
import { ProgramsPanel } from '@pages/programs/ProgramsPanel';
import { ProgramRecordsPanel } from '@pages/programs/ProgramRecordsPanel';

export function Programs(): React.JSX.Element {
  const { t } = useTranslation();
  const [params, setParams] = useSearchParams();
  const tab = (params.get('tab') || 'programs') as string;

  const setTab = (val: string) =>
    setParams(prev => {
      const sp = new URLSearchParams(prev);
      sp.set('tab', val);
      return sp;
    }, { replace: true });

  return (
    <Stack spacing={3} sx={{ mt: 3, width: '100%' }}>
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        aria-label={t('programs.tabs.aria_label')}
        variant="scrollable"
        scrollButtons="auto"
      >
        <Tab value="programs" label={t('programs.tabs.programs')} />
        <Tab value="records" label={t('programs.tabs.records')} />
        <Tab value="sessions" label={t('programs.tabs.sessions')} />
        <Tab value="exercices" label={t('programs.tabs.exercises')} />
        <Tab value="categories" label={t('programs.tabs.categories')} />
        <Tab value="muscles" label={t('programs.tabs.muscles')} />
        <Tab value="equipment" label={t('programs.tabs.equipment')} />
        <Tab value="tags" label={t('programs.tabs.tags')} />
      </Tabs>

      {tab === 'categories' && <CategoriesPanel />}
      {tab === 'muscles' && <MusclesPanel />}
      {tab === 'equipment' && <EquipmentPanel />}
      {tab === 'tags' && <TagsPanel />}
      {tab === 'exercices' && <ExercisesPanel />}
      {tab === 'sessions' && <SessionsPanel />}
      {tab === 'programs' && <ProgramsPanel />}
      {tab === 'records' && <ProgramRecordsPanel />}
    </Stack>
  );
}
