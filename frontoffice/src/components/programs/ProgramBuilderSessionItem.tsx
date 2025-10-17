import * as React from 'react';
import { DeleteOutline, DragIndicator } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { Box, Chip, IconButton, Paper, Stack, TextField, Typography } from '@mui/material';

import type {
  BuilderCopy,
  ExerciseLibraryItem,
  ProgramSession,
} from './programBuilderTypes';
import { ProgramBuilderExerciseItem } from './ProgramBuilderExerciseItem';
import { ProgramBuilderExerciseDropZone } from './ProgramBuilderExerciseDropZone';
import { logWithTimestamp } from './programBuilderUtils';

type ProgramBuilderSessionItemProps = {
  session: ProgramSession;
  index: number;
  builderCopy: BuilderCopy;
  onLabelChange: (sessionId: string, label: string) => void;
  onRemoveSession: () => void;
  onRemoveExercise: (exerciseId: string) => void;
  onDragStart: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd?: () => void;
  getExerciseById: (exerciseId: string) => ExerciseLibraryItem | undefined;
  isDraggingExercise: boolean;
  exerciseDropLabel: string;
  exerciseDropEffect: 'copy' | 'move';
  onExerciseDrop: (
    sessionId: string,
    position: number,
    event: React.DragEvent<HTMLDivElement>,
  ) => void;
  onExerciseLabelChange: (
    sessionId: string,
    exerciseId: string,
    label: string,
  ) => void;
  onExerciseDragStart: (
    sessionId: string,
    exerciseId: string,
    event: React.DragEvent<HTMLDivElement>,
  ) => void;
  onExerciseDragEnd: () => void;
};

export const ProgramBuilderSessionItem = React.memo(function ProgramBuilderSessionItem({
  session,
  index,
  builderCopy,
  onLabelChange,
  onRemoveSession,
  onRemoveExercise,
  onDragStart,
  onDragEnd,
  getExerciseById,
  isDraggingExercise,
  exerciseDropLabel,
  exerciseDropEffect,
  onExerciseDrop,
  onExerciseLabelChange,
  onExerciseDragStart,
  onExerciseDragEnd,
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

  const handleDragStartInternal = React.useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.stopPropagation();
      if (isEditingLabel) {
        logWithTimestamp('log', '[ProgramBuilder][SessionItem] drag prevented while editing label', {
          sessionId: session.id,
        });
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      logWithTimestamp('log', '[ProgramBuilder][SessionItem] drag start', {
        sessionId: session.id,
        sessionLabel: session.label,
      });
      onDragStart(event);
    },
    [isEditingLabel, onDragStart, session.id, session.label],
  );

  const handleDragEndInternal = React.useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.stopPropagation();
      logWithTimestamp('log', '[ProgramBuilder][SessionItem] drag end', {
        sessionId: session.id,
        sessionLabel: session.label,
        dropEffect: event.dataTransfer.dropEffect,
      });
      onDragEnd?.();
    },
    [onDragEnd, session.id, session.label],
  );

  const handleMouseDown = React.useCallback(
    (event: React.MouseEvent<HTMLSpanElement>) => {
      logWithTimestamp('log', '[ProgramBuilder][SessionItem] mouse down on drag handle', {
        sessionId: session.id,
        button: event.button,
      });
    },
    [session.id],
  );

  const handleMouseUp = React.useCallback(
    (event: React.MouseEvent<HTMLSpanElement>) => {
      logWithTimestamp('log', '[ProgramBuilder][SessionItem] mouse up on drag handle', {
        sessionId: session.id,
        button: event.button,
      });
    },
    [session.id],
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
          <Stack direction="row" spacing={1} alignItems="center">
            <Box
              component="span"
              draggable={!isEditingLabel}
              onDragStart={handleDragStartInternal}
              onDragEnd={handleDragEndInternal}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              sx={{
                cursor: isEditingLabel ? 'not-allowed' : 'grab',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <DragIndicator fontSize="small" color="disabled" />
            </Box>
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
          <ProgramBuilderExerciseDropZone
            label={exerciseDropLabel}
            dropEffect={exerciseDropEffect}
            onDrop={(event) => onExerciseDrop(session.id, 0, event)}
            isVisible={isDraggingExercise}
          />
          {session.exercises.length === 0 ? (
            !isDraggingExercise && (
              <Typography variant="body2" color="text.secondary">
                {builderCopy.library.subtitle}
              </Typography>
            )
          ) : (
            session.exercises.map((exerciseItem, exerciseIndex) => {
              const exercise = getExerciseById(exerciseItem.exerciseId);
              if (!exercise) {
                return null;
              }

              return (
                <React.Fragment key={exerciseItem.id}>
                  <ProgramBuilderExerciseItem
                    exerciseItem={exerciseItem}
                    exercise={exercise}
                    index={exerciseIndex}
                    onRemove={handleRemoveExercise}
                    onLabelChange={(nextLabel) =>
                      onExerciseLabelChange(session.id, exerciseItem.id, nextLabel)
                    }
                    onDragStart={(event) =>
                      onExerciseDragStart(session.id, exerciseItem.id, event)
                    }
                    onDragEnd={onExerciseDragEnd}
                  />
                  <ProgramBuilderExerciseDropZone
                    label={exerciseDropLabel}
                    dropEffect={exerciseDropEffect}
                    onDrop={(event) =>
                      onExerciseDrop(session.id, exerciseIndex + 1, event)
                    }
                    isVisible={isDraggingExercise}
                  />
                </React.Fragment>
              );
            })
          )}
        </Stack>
      </Stack>
    </Paper>
  );
});
