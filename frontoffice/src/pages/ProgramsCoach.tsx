// src/pages/ProgramsCoach.tsx
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { ProgramList } from '@src/components/programs/ProgramList';
import { type BuilderCopy } from '@src/components/programs/ProgramBuilderPanel';

import { usePrograms, type Program } from '@src/hooks/usePrograms';
import { slugify } from '@src/utils/slugify';

/** Coach-facing program management dashboard. */
export function ProgramsCoach(): React.JSX.Element {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const builderCopy = React.useMemo(
    () =>
      t('programs-coatch.builder', {
        returnObjects: true,
      }) as unknown as BuilderCopy,
    [t],
  );

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

  const handleCreateProgram = React.useCallback(() => {
    navigate('/programs-coach/create');
  }, [navigate]);

  const handleEditProgram = React.useCallback(
    (program: Program) => {
      navigate(`/programs-coach/edit/${program.id}`);
    },
    [navigate],
  );

  const handleViewProgram = React.useCallback(
    (program: Program) => {
      navigate(`/programs-coach/view/${program.id}`);
    },
    [navigate],
  );

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
        navigate(`/programs-coach/edit/${cloned.id}`);
        return;
      }

      handleProgramSaved();
    },
    [create, handleProgramSaved, i18n.language, navigate],
  );

  return (
    <>
      {/* General information */}
      <ProgramList
        programs={programs}
        loading={loading}
        placeholderTitle={t('programs-coatch.placeholder')}
        placeholderSubtitle={builderCopy.subtitle}
        openBuilderLabel={t('programs-coatch.actions.open_builder')}
        onOpenBuilder={handleCreateProgram}
        onDeleteProgram={handleDeleteProgram}
        onEditProgram={handleEditProgram}
        onCloneProgram={handleCloneProgram}
        onViewProgram={handleViewProgram}
      />
    </>
  );
}
