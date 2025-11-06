// src/pages/ProgramsCoach.tsx
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { ProgramBuilderPanel, type BuilderCopy } from '@src/components/programs/ProgramBuilderPanel';
import { ProgramList } from '@src/components/programs/ProgramList';

import { usePrograms, type Program } from '@src/hooks/usePrograms';
import { slugify } from '@src/utils/slugify';

/** Coach-facing program management dashboard. */
export function ProgramsCoach(): React.JSX.Element {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [builderOpen, setBuilderOpen] = React.useState<boolean>(false);
  const [editingProgram, setEditingProgram] = React.useState<Program | null>(null);

  const builderCopy = t('programs-coatch.builder', {
    returnObjects: true,
  }) as unknown as BuilderCopy;

  const { items: programs, loading, reload, remove, create } = usePrograms({
    page: 1,
    limit: 12,
    q: '',
  });

  const handleProgramSaved = React.useCallback(() => {
    void reload();
  }, [reload]);

  const handleDeleteProgram = React.useCallback(
    async (programId: string) => {
      await remove(programId);
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

  const handleViewProgram = React.useCallback((program: Program) => {
    setBuilderOpen(false);
    setEditingProgram(null);
    navigate(`/programs-coach/${program.id}`);
  }, [navigate]);

  const handleCloneProgram = React.useCallback(
    async (
      baseProgram: Program,
      payload: { label: string; athleteId: string | null; openBuilder: boolean },
    ) => {
      const sessionSnapshots = baseProgram.sessions.map((session) => ({
        id: session.id,
        templateSessionId: session.templateSessionId ?? undefined,
        label: session.label,
        durationMin: session.durationMin,
        description: session.description ?? undefined,
        exercises: session.exercises.map((exercise) => ({
          id: exercise.id,
          templateExerciseId: exercise.templateExerciseId ?? undefined,
          label: exercise.label,
          series: exercise.series ?? undefined,
          repetitions: exercise.repetitions ?? undefined,
          restSeconds: exercise.restSeconds ?? undefined,
          description: exercise.description ?? undefined,
          instructions: exercise.instructions ?? undefined,
          charge: exercise.charge ?? undefined,
          videoUrl: exercise.videoUrl ?? undefined,
          level: exercise.level ?? undefined,
        })),
      }));

      const cloned = await create({
        slug: slugify(payload.label, String(Date.now()).slice(-5)),
        locale: baseProgram.locale || i18n.language,
        label: payload.label,
        duration: baseProgram.duration,
        frequency: baseProgram.frequency,
        description: baseProgram.description ?? '',
        sessions: sessionSnapshots,
        sessionIds: baseProgram.sessions.map((session) => session.id),
        userId: payload.athleteId,
      });

      if (payload.openBuilder) {
        setEditingProgram(cloned);
        setBuilderOpen(true);
        return;
      }

      setEditingProgram(null);
      setBuilderOpen(false);
    },
    [create, i18n.language],
  );

  const handleCloseBuilder = React.useCallback(() => {
    setBuilderOpen(false);
    setEditingProgram(null);
  }, []);

  if (builderOpen) {
    return (
      <>
        {/* General information */}
        <ProgramBuilderPanel
          builderCopy={builderCopy}
          onCancel={handleCloseBuilder}
          onCreated={handleProgramSaved}
          onUpdated={handleProgramSaved}
          program={editingProgram ?? undefined}
        />
      </>
    );
  }

  return (
    <>
      {/* General information */}
      <ProgramList
        programs={programs}
        loading={loading}
        placeholderTitle={t('programs-coatch.placeholder')}
        placeholderSubtitle={builderCopy.subtitle}
        openBuilderLabel={t('programs-coatch.actions.open_builder')}
        onOpenBuilder={handleOpenBuilderForCreate}
        onDeleteProgram={handleDeleteProgram}
        onEditProgram={handleEditProgram}
        onCloneProgram={handleCloneProgram}
        onViewProgram={handleViewProgram}
      />
    </>
  );
}
