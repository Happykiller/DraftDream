import * as React from 'react';
import {
  DeleteOutline,
  KeyboardArrowDown,
  KeyboardArrowUp,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { Chip, IconButton, Paper, Stack, TextField, Typography } from '@mui/material';

import type {
  BuilderCopy,
  ExerciseLibraryItem,
  ProgramSession,
} from './programBuilderTypes';
import { ProgramBuilderExerciseItem } from './ProgramBuilderExerciseItem';
import { logWithTimestamp } from './programBuilderUtils';

type ProgramBuilderSessionItemProps = {
  session: ProgramSession;
  index: number;
  totalSessions: number;
  builderCopy: BuilderCopy;
  onLabelChange: (sessionId: string, label: string) => void;
  onRemoveSession: () => void;
  onRemoveExercise: (exerciseId: string) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  getExerciseById: (exerciseId: string) => ExerciseLibraryItem | undefined;
  onExerciseLabelChange: (
    sessionId: string,
    exerciseId: string,
    label: string,
  ) => void;
  onMoveExerciseUp: (exerciseId: string) => void;
  onMoveExerciseDown: (exerciseId: string) => void;
};

export const ProgramBuilderSessionItem = React.memo(function ProgramBuilderSessionItem({
  session,
  index,
  totalSessions,
  builderCopy,
  onLabelChange,
  onRemoveSession,
  onRemoveExercise,
  onMoveUp,
  onMoveDown,
  getExerciseById,
  onExerciseLabelChange,
  onMoveExerciseUp,
  onMoveExerciseDown,
}: ProgramBuilderSessionItemProps): React.JSX.Element {
  const theme = useTheme();

  const [isEditingLabel, setIsEditingLabel] = React.useState(false);
  const [labelDraft, setLabelDraft] = React.useState(session.label);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (!isEditingLabel) {
      setLabelDraft(session.label);
    }
  }, [session.label, isEditingLabel]);

  React.useEffect(() => {
    if (isEditingLabel && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingLabel]);

  const commitLabelChange = React.useCallback(() => {
    const trimmed = labelDraft.trim();
    const nextLabel = trimmed || builderCopy.structure.custom_session_label;
    setIsEditingLabel(false);
    if (nextLabel !== session.label) {
      onLabelChange(session.id, nextLabel);
    }
  }, [
    builderCopy.structure.custom_session_label,
    labelDraft,
    onLabelChange,
    session.id,
    session.label,
  ]);

  const cancelLabelEdition = React.useCallback(() => {
    setIsEditingLabel(false);
    setLabelDraft(session.label);
  }, [session.label]);

  const handleLabelDoubleClick = React.useCallback(
    (event: React.MouseEvent<HTMLSpanElement | HTMLParagraphElement>) => {
      event.stopPropagation();
      setLabelDraft(session.label);
      setIsEditingLabel(true);
    },
    [session.label],
  );

  const handleLabelKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        commitLabelChange();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        cancelLabelEdition();
      }
    },
    [cancelLabelEdition, commitLabelChange],
  );

  const handleLabelBlur = React.useCallback(() => {
    if (isEditingLabel) {
      commitLabelChange();
    }
  }, [commitLabelChange, isEditingLabel]);

  const handleRemoveSession = (
    event: React.MouseEvent<HTMLButtonElement>,
  ): void => {
    event.stopPropagation();
    logWithTimestamp('log', '[ProgramBuilder][SessionItem] remove session clicked', {
      sessionId: session.id,
      label: session.label,
    });
    onRemoveSession();
  };

  const handleRemoveExercise = (exerciseId: string): void => {
    logWithTimestamp('log', '[ProgramBuilder][SessionItem] remove exercise clicked', {
      sessionId: session.id,
      exerciseId,
    });
    onRemoveExercise(exerciseId);
  };

  const canMoveUp = index > 0;
  const canMoveDown = index < totalSessions - 1;

  const handleMoveUpClick = React.useCallback(() => {
    if (!canMoveUp) {
      return;
    }
    logWithTimestamp('log', '[ProgramBuilder][SessionItem] move session up', {
      sessionId: session.id,
      fromIndex: index,
    });
    onMoveUp();
  }, [canMoveUp, index, onMoveUp, session.id]);

  const handleMoveDownClick = React.useCallback(() => {
    if (!canMoveDown) {
      return;
    }
    logWithTimestamp('log', '[ProgramBuilder][SessionItem] move session down', {
      sessionId: session.id,
      fromIndex: index,
    });
    onMoveDown();
  }, [canMoveDown, index, onMoveDown, session.id]);

  const handleMoveExerciseUp = React.useCallback(
    (exerciseId: string, position: number) => {
      if (position === 0) {
        return;
      }
      logWithTimestamp('log', '[ProgramBuilder][SessionItem] move exercise up', {
        sessionId: session.id,
        exerciseId,
        fromIndex: position,
      });
      onMoveExerciseUp(exerciseId);
    },
    [onMoveExerciseUp, session.id],
  );

  const handleMoveExerciseDown = React.useCallback(
    (exerciseId: string, position: number, lastIndex: number) => {
      if (position >= lastIndex) {
        return;
      }
      logWithTimestamp('log', '[ProgramBuilder][SessionItem] move exercise down', {
        sessionId: session.id,
        exerciseId,
        fromIndex: position,
      });
      onMoveExerciseDown(exerciseId);
    },
    [onMoveExerciseDown, session.id],
  );

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.5,
        borderRadius: 2,
        cursor: 'default',
        transition: 'border-color 150ms ease, background-color 150ms ease',
        '&:hover': {
          borderColor: theme.palette.secondary.main,
          boxShadow: theme.shadows[2],
        },
      }}
    >
      <Stack spacing={1.5}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Stack spacing={0.5} alignItems="center">
              <IconButton
                size="small"
                onClick={handleMoveUpClick}
                disabled={!canMoveUp}
                aria-label="move-session-up"
              >
                <KeyboardArrowUp fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={handleMoveDownClick}
                disabled={!canMoveDown}
                aria-label="move-session-down"
              >
                <KeyboardArrowDown fontSize="small" />
              </IconButton>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {builderCopy.structure.session_prefix} {index + 1} -
              </Typography>
              {isEditingLabel ? (
                <TextField
                  inputRef={inputRef}
                  value={labelDraft}
                  onChange={(event) => setLabelDraft(event.target.value)}
                  onBlur={handleLabelBlur}
                  onKeyDown={handleLabelKeyDown}
                  size="small"
                  variant="standard"
                  inputProps={{
                    'aria-label': 'session-label',
                    sx: { fontWeight: 600 },
                  }}
                  sx={{ minWidth: 120 }}
                />
              ) : (
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 600, cursor: 'text' }}
                  onDoubleClick={handleLabelDoubleClick}
                >
                  {session.label}
                </Typography>
              )}
            </Stack>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Chip
              label={`${session.duration} ${builderCopy.structure.duration_unit}`}
              size="small"
            />
            <IconButton
              size="small"
              onClick={handleRemoveSession}
              aria-label="delete-session"
            >
              <DeleteOutline fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>

        <Stack direction="row" spacing={0.5} flexWrap="wrap">
          {session.tags.map((tag) => (
            <Chip key={tag} label={tag} size="small" variant="outlined" />
          ))}
        </Stack>

        <Stack spacing={1}>
          {session.exercises.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              {builderCopy.library.subtitle}
            </Typography>
          ) : (
            session.exercises.map((exerciseItem, exerciseIndex) => {
              const exercise = getExerciseById(exerciseItem.exerciseId);
              if (!exercise) {
                return null;
              }

              return (
                <ProgramBuilderExerciseItem
                  key={exerciseItem.id}
                  exerciseItem={exerciseItem}
                  exercise={exercise}
                  index={exerciseIndex}
                  totalExercises={session.exercises.length}
                  onRemove={handleRemoveExercise}
                  onLabelChange={(nextLabel) =>
                    onExerciseLabelChange(session.id, exerciseItem.id, nextLabel)
                  }
                  onMoveUp={() => handleMoveExerciseUp(exerciseItem.id, exerciseIndex)}
                  onMoveDown={() =>
                    handleMoveExerciseDown(
                      exerciseItem.id,
                      exerciseIndex,
                      session.exercises.length - 1,
                    )
                  }
                />
              );
            })
          )}
        </Stack>
      </Stack>
    </Paper>
  );
});
