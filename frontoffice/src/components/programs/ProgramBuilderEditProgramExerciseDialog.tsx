import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { Edit } from '@mui/icons-material';
import { Button, Stack, TextField, Typography } from '@mui/material';

import { ProgramDialogLayout } from '@components/programs/ProgramDialogLayout';

import type {
  ExerciseLibraryItem,
  ProgramExercise,
  ProgramExercisePatch,
} from './programBuilderTypes';
import { parseSeriesCount } from './programBuilderUtils';

type ProgramBuilderEditProgramExerciseDialogProps = {
  open: boolean;
  exerciseItem: ProgramExercise | null;
  exercise: ExerciseLibraryItem | null;
  onClose: () => void;
  onSubmit: (patch: ProgramExercisePatch) => Promise<void> | void;
};

type DialogCopy = {
  title: string;
  subtitle?: string;
  fields: {
    sets: string;
    reps: string;
    rest: string;
    notes: string;
    notes_placeholder: string;
  };
  actions: {
    cancel: string;
    submit: string;
    submitting: string;
  };
};

/**
 * ProgramBuilderEditProgramExerciseDialog lets coaches adjust session-specific exercise metadata
 * without mutating the underlying library template.
 */
export function ProgramBuilderEditProgramExerciseDialog({
  open,
  exerciseItem,
  exercise,
  onClose,
  onSubmit,
}: ProgramBuilderEditProgramExerciseDialogProps): React.JSX.Element {
  const { t } = useTranslation();
  const dialogCopy = React.useMemo<DialogCopy>(
    () =>
      t('programs-coatch.builder.program_exercise_dialog', {
        returnObjects: true,
      }) as DialogCopy,
    [t],
  );

  const [setsDraft, setSetsDraft] = React.useState('');
  const [repsDraft, setRepsDraft] = React.useState('');
  const [restDraft, setRestDraft] = React.useState('');
  const [notesDraft, setNotesDraft] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!open || !exerciseItem) {
      return;
    }
    setSetsDraft(String(exerciseItem.sets));
    setRepsDraft(exerciseItem.reps);
    setRestDraft(exerciseItem.rest);
    setNotesDraft(exerciseItem.customDescription ?? '');
  }, [exerciseItem, open]);

  const isFormEnabled = Boolean(exerciseItem && exercise);
  const submitLabel = submitting
    ? dialogCopy.actions.submitting
    : dialogCopy.actions.submit;

  const handleSubmit = React.useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!exerciseItem || !exercise) {
        return;
      }

      setSubmitting(true);
      try {
        const parsedSets = parseSeriesCount(setsDraft);
        const nextSets = Math.max(1, Number.isFinite(parsedSets) ? parsedSets : exerciseItem.sets);
        const nextReps = repsDraft.trim() || exerciseItem.reps;
        const nextRest = restDraft.trim() || exerciseItem.rest;
        const nextNotes = notesDraft.trim();

        await onSubmit({
          sets: nextSets,
          reps: nextReps,
          rest: nextRest,
          customDescription: nextNotes,
        });
      } finally {
        setSubmitting(false);
      }
    },
    [exercise, exerciseItem, notesDraft, onSubmit, repsDraft, restDraft, setsDraft],
  );

  return (
    <ProgramDialogLayout
      open={open}
      onClose={onClose}
      title={dialogCopy.title}
      description={dialogCopy.subtitle}
      icon={<Edit fontSize="small" />}
      actions={
        <Stack direction="row" spacing={1} justifyContent="flex-end" width="100%">
          <Button variant="text" onClick={onClose} disabled={submitting}>
            {dialogCopy.actions.cancel}
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="success"
            disabled={!isFormEnabled || submitting}
          >
            {submitLabel}
          </Button>
        </Stack>
      }
      formComponent="form"
      formProps={{ onSubmit: handleSubmit }}
      contentProps={{ dividers: false }}
    >
      {/* General information */}
      <Stack spacing={2}>
        <Stack spacing={0.5}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {exercise?.label ?? ''}
          </Typography>
          {exercise?.description ? (
            <Typography variant="body2" color="text.secondary">
              {exercise.description}
            </Typography>
          ) : null}
        </Stack>

        <Stack spacing={1.5}>
          <TextField
            label={dialogCopy.fields.sets}
            value={setsDraft}
            onChange={(event) => setSetsDraft(event.target.value)}
            type="number"
            inputProps={{ min: 1 }}
            fullWidth
            disabled={!isFormEnabled || submitting}
          />
          <TextField
            label={dialogCopy.fields.reps}
            value={repsDraft}
            onChange={(event) => setRepsDraft(event.target.value)}
            fullWidth
            disabled={!isFormEnabled || submitting}
          />
          <TextField
            label={dialogCopy.fields.rest}
            value={restDraft}
            onChange={(event) => setRestDraft(event.target.value)}
            fullWidth
            disabled={!isFormEnabled || submitting}
          />
          <TextField
            label={dialogCopy.fields.notes}
            value={notesDraft}
            onChange={(event) => setNotesDraft(event.target.value)}
            placeholder={dialogCopy.fields.notes_placeholder}
            multiline
            minRows={3}
            fullWidth
            disabled={!isFormEnabled || submitting}
          />
        </Stack>
      </Stack>
    </ProgramDialogLayout>
  );
}
