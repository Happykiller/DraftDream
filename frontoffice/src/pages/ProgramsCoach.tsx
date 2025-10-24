// src/pages/ProgramsCoach.tsx
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { ProgramBuilderPanel, type BuilderCopy } from '@src/components/programs/ProgramBuilderPanel';
import { ProgramList } from '@src/components/programs/ProgramList';

import { usePrograms, type Program } from '@src/hooks/usePrograms';

export function ProgramsCoach(): React.JSX.Element {
  const { t } = useTranslation();

  const [builderOpen, setBuilderOpen] = React.useState<boolean>(false);
  const [editingProgram, setEditingProgram] = React.useState<Program | null>(null);

  const builderCopy = t('programs-coatch.builder', {
    returnObjects: true,
  }) as unknown as BuilderCopy;

  const { items: programs, loading, reload, remove } = usePrograms({
    page: 1,
    limit: 12,
    q: '',
  });

  const handleProgramSaved = React.useCallback(() => {
    void reload();
  }, [reload]);

  const handleDeleteProgram = React.useCallback(
    (programId: string) => {
      void remove(programId);
    },
    [remove],
  );

  const handleOpenBuilderForCreate = React.useCallback(() => {
    setEditingProgram(null);
    setBuilderOpen(true);
  }, []);

  const handleEditProgram = React.useCallback((program: Program) => {
    setEditingProgram(program);
    setBuilderOpen(true);
  }, []);

  const handleCloseBuilder = React.useCallback(() => {
    setBuilderOpen(false);
    setEditingProgram(null);
  }, []);

  return (
    <>
      {builderOpen ? (
        <ProgramBuilderPanel
          builderCopy={builderCopy}
          onCancel={handleCloseBuilder}
          onCreated={handleProgramSaved}
          onUpdated={handleProgramSaved}
          program={editingProgram ?? undefined}
        />
      ) : (
        <ProgramList
          programs={programs}
          loading={loading}
          placeholderTitle={t('programs-coatch.placeholder')}
          placeholderSubtitle={builderCopy.subtitle}
          openBuilderLabel={t('programs-coatch.actions.open_builder')}
          onOpenBuilder={handleOpenBuilderForCreate}
          onDeleteProgram={handleDeleteProgram}
          onEditProgram={handleEditProgram}
        />
      )}
    </>
  );
}
