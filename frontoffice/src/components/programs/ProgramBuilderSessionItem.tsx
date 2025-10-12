import * as React from 'react';
import { DeleteOutline, DragIndicator } from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';
import { Chip, IconButton, Paper, Stack, Typography } from '@mui/material';

import type {
  BuilderCopy,
  ExerciseLibraryItem,
  ProgramSession,
} from './ProgramBuilderPanel';
import { ProgramBuilderExerciseItem } from './ProgramBuilderExerciseItem';
import { ProgramBuilderExerciseDropZone } from './ProgramBuilderExerciseDropZone';

type ProgramBuilderSessionItemProps = {
  session: ProgramSession;
  index: number;
  builderCopy: BuilderCopy;
  onRemoveSession: () => void;
  onRemoveExercise: (exerciseId: string) => void;
  onDragStart: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd?: () => void;
  getExerciseById: (exerciseId: string) => ExerciseLibraryItem | undefined;
  isDraggingExercise: boolean;
  exerciseDropLabel: string;
  onExerciseDrop: (
    sessionId: string,
    position: number,
    event: React.DragEvent<HTMLDivElement>,
  ) => void;
  onExerciseDragStart: (
    sessionId: string,
    exerciseId: string,
    event: React.DragEvent<HTMLDivElement>,
  ) => void;
  onExerciseDragEnd: () => void;
};

export function ProgramBuilderSessionItem({
  session,
  index,
  builderCopy,
  onRemoveSession,
  onRemoveExercise,
  onDragStart,
  onDragEnd,
  getExerciseById,
  isDraggingExercise,
  exerciseDropLabel,
  onExerciseDrop,
  onExerciseDragStart,
  onExerciseDragEnd,
}: ProgramBuilderSessionItemProps): React.JSX.Element {
  const theme = useTheme();

  const handleRemoveSession = (
    event: React.MouseEvent<HTMLButtonElement>,
  ): void => {
    event.stopPropagation();
    onRemoveSession();
  };

  const handleRemoveExercise = (exerciseId: string): void => {
    onRemoveExercise(exerciseId);
  };

  return (
    <Paper
      variant="outlined"
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      sx={{
        p: 1.5,
        borderRadius: 2,
        cursor: 'grab',
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
            <DragIndicator fontSize="small" color="disabled" />
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {builderCopy.structure.session_prefix} {index + 1} - {session.label}
            </Typography>
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
                    onDragStart={(event) =>
                      onExerciseDragStart(session.id, exerciseItem.id, event)
                    }
                    onDragEnd={onExerciseDragEnd}
                  />
                  {isDraggingExercise && (
                    <ProgramBuilderExerciseDropZone
                      label={exerciseDropLabel}
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
}
