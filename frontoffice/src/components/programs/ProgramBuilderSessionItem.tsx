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
    onRemoveSession();
  };

  const handleRemoveExercise = (exerciseId: string): void => {
    onRemoveExercise(exerciseId);
  };

  const handleDragStartInternal = React.useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      if (isEditingLabel) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }
      onDragStart(event);
    },
    [isEditingLabel, onDragStart],
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
              onDragEnd={onDragEnd}
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
          {isDraggingExercise && (
            <ProgramBuilderExerciseDropZone
              label={exerciseDropLabel}
              dropEffect={exerciseDropEffect}
              onDrop={(event) => onExerciseDrop(session.id, 0, event)}
            />
          )}
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
                  {isDraggingExercise && (
                    <ProgramBuilderExerciseDropZone
                      label={exerciseDropLabel}
                      dropEffect={exerciseDropEffect}
                      onDrop={(event) =>
                        onExerciseDrop(session.id, exerciseIndex + 1, event)
                      }
                    />
                  )}
                </React.Fragment>
              );
            })
          )}
        </Stack>
      </Stack>
    </Paper>
  );
});
