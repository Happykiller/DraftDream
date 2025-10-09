// src/pages/Programs.tsx
import * as React from 'react';
import { Stack, Tabs, Tab } from '@mui/material';
import { useSearchParams } from 'react-router-dom';

import { TagsPanel } from '@pages/programs/TagsPanel';
import { MusclesPanel } from '@pages/programs/MusclesPanel';
import { SessionsPanel } from '@pages/programs/SessionsPanel';
import { EquipmentPanel } from '@pages/programs/EquipmentPanel';
import { ExercisesPanel } from '@pages/programs/ExercisesPanel';
import { CategoriesPanel } from '@pages/programs/CategoriesPanel';
import { ProgramsPanel } from '@pages/programs/ProgramsPanel';

export function Programs(): React.JSX.Element {
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
      <Tabs value={tab} onChange={(_, v) => setTab(v)} aria-label="Programs domain tabs" variant="scrollable" scrollButtons="auto">
        <Tab value="programs" label="Programs" />
        <Tab value="sessions" label="Sessions" />
        <Tab value="exercices" label="Exercices" />
        <Tab value="categories" label="Categories" />
        <Tab value="muscles" label="Muscles" />
        <Tab value="tags" label="Tags" />
        <Tab value="equipment" label="Equipment" />
      </Tabs>

      {tab === 'categories' && <CategoriesPanel />}
      {tab === 'muscles' && <MusclesPanel />}
      {tab === 'equipment' && <EquipmentPanel />}
      {tab === 'tags' && <TagsPanel />}
      {tab === 'exercices' && <ExercisesPanel />}
      {tab === 'sessions' && <SessionsPanel />}
      {tab === 'programs' && <ProgramsPanel />}
    </Stack>
  );
}
