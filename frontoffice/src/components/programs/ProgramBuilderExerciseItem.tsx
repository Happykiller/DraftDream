import * as React from 'react';
import { DeleteOutline, DragIndicator } from '@mui/icons-material';
import {
  Box,
  Chip,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';

import type {
  ExerciseLibraryItem,
  ProgramExercise,
} from './programBuilderTypes';
import { logWithTimestamp } from './programBuilderUtils';

type ProgramBuilderExerciseItemProps = {
  exerciseItem: ProgramExercise;
  exercise: ExerciseLibraryItem;
  index: number;
  onRemove: (exerciseId: string) => void;
  onLabelChange: (label: string) => void;
  onDragStart?: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd?: () => void;
};

export const ProgramBuilderExerciseItem = React.memo(function ProgramBuilderExerciseItem({
  exerciseItem,
  exercise,
  index,
  onRemove,
  onLabelChange,
  onDragStart,
  onDragEnd,
}: ProgramBuilderExerciseItemProps): React.JSX.Element {
  const theme = useTheme();

  const [isEditingLabel, setIsEditingLabel] = React.useState(false);
  const displayLabel = exerciseItem.customLabel ?? exercise.label;
  const [labelDraft, setLabelDraft] = React.useState(displayLabel);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (!isEditingLabel) {
      setLabelDraft(displayLabel);
    }
  }, [displayLabel, isEditingLabel]);

  React.useEffect(() => {
    if (isEditingLabel && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditingLabel]);

  const commitLabelChange = React.useCallback(() => {
    const trimmed = labelDraft.trim();
    const nextLabel = trimmed || exercise.label;
    setIsEditingLabel(false);
    if (nextLabel !== displayLabel) {
      onLabelChange(nextLabel);
    }
  }, [displayLabel, exercise.label, labelDraft, onLabelChange]);

  const cancelLabelEdition = React.useCallback(() => {
    setIsEditingLabel(false);
    setLabelDraft(displayLabel);
  }, [displayLabel]);

  const handleLabelDoubleClick = React.useCallback(
    (event: React.MouseEvent<HTMLSpanElement | HTMLParagraphElement>) => {
      event.stopPropagation();
      setLabelDraft(displayLabel);
      setIsEditingLabel(true);
    },
    [displayLabel],
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

  const handleRemoveClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    logWithTimestamp('log', '[ProgramBuilder][ExerciseItem] remove exercise clicked', {
      parentSessionExerciseId: exerciseItem.id,
      exerciseId: exercise.id,
    });
    onRemove(exerciseItem.id);
  };

  const handleDragStart = (event: React.DragEvent<HTMLDivElement>) => {
    if (isEditingLabel) {
      logWithTimestamp('log', '[ProgramBuilder][ExerciseItem] drag prevented while editing label', {
        parentSessionExerciseId: exerciseItem.id,
        exerciseId: exercise.id,
      });
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    event.stopPropagation();
    logWithTimestamp('log', '[ProgramBuilder][ExerciseItem] drag start', {
      parentSessionExerciseId: exerciseItem.id,
      exerciseId: exercise.id,
    });
    onDragStart?.(event);
  };

  const handleDragEnd = (event: React.DragEvent<HTMLDivElement>) => {
    event.stopPropagation();
    logWithTimestamp('log', '[ProgramBuilder][ExerciseItem] drag end', {
      parentSessionExerciseId: exerciseItem.id,
      exerciseId: exercise.id,
    });
    onDragEnd?.();
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLSpanElement>) => {
    logWithTimestamp('log', '[ProgramBuilder][ExerciseItem] mouse down on drag handle', {
      parentSessionExerciseId: exerciseItem.id,
      exerciseId: exercise.id,
      button: event.button,
    });
  };

  const handleMouseUp = (event: React.MouseEvent<HTMLSpanElement>) => {
    logWithTimestamp('log', '[ProgramBuilder][ExerciseItem] mouse up on drag handle', {
      parentSessionExerciseId: exerciseItem.id,
      exerciseId: exercise.id,
      button: event.button,
    });
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.5,
        borderRadius: 2,
        cursor: 'default',
        '&:hover': {
          borderColor: theme.palette.primary.main,
          boxShadow: theme.shadows[1],
        },
      }}
    >
      <Stack
        direction="row"
        alignItems="flex-start"
        spacing={1}
        justifyContent="space-between"
      >
        <Stack direction="row" spacing={1} alignItems="flex-start">
          <Box
            component="span"
            draggable={!isEditingLabel}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            sx={{
              cursor: isEditingLabel ? 'not-allowed' : 'grab',
              display: 'flex',
              alignItems: 'center',
              paddingTop: '2px',
            }}
          >
            <DragIndicator fontSize="small" color="disabled" />
          </Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, minWidth: 24 }}>
            {index + 1}.
          </Typography>

          <Stack spacing={0.5}>
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
                  'aria-label': 'exercise-label',
                  sx: { fontWeight: 600 },
                }}
                sx={{ minWidth: 160 }}
              />
            ) : (
              <Typography
                variant="subtitle2"
                sx={{ fontWeight: 600, cursor: 'text' }}
                onDoubleClick={handleLabelDoubleClick}
              >
                {displayLabel}
              </Typography>
            )}
            <Typography variant="caption" color="text.secondary">
              {exerciseItem.sets} x {exerciseItem.reps} - {exerciseItem.rest}
            </Typography>
            {exercise.muscles.length > 0 ? (
              <Stack direction="row" spacing={0.5} flexWrap="wrap">
                {exercise.muscles.map((muscle) => (
                  <Chip
                    key={`${exercise.id}-muscle-${muscle.id}`}
                    label={muscle.label}
                    size="small"
                    color={muscle.role === 'primary' ? 'primary' : 'default'}
                    variant={muscle.role === 'primary' ? 'filled' : 'outlined'}
                  />
                ))}
              </Stack>
            ) : null}
            {exercise.tags.length > 0 ? (
              <Stack direction="row" spacing={0.5} flexWrap="wrap">
                {exercise.tags.map((tag) => (
                  <Chip
                    key={`${exercise.id}-tag-${tag.id}`}
                    label={tag.label}
                    size="small"
                    color="secondary"
                    variant="outlined"
                  />
                ))}
              </Stack>
            ) : null}
            {exercise.equipment.length > 0 ? (
              <Stack direction="row" spacing={0.5} flexWrap="wrap">
                {exercise.equipment.map((eq) => (
                  <Chip
                    key={`${exercise.id}-equipment-${eq.id}`}
                    label={eq.label}
                    size="small"
                    variant="outlined"
                  />
                ))}
              </Stack>
            ) : null}
          </Stack>
        </Stack>

        <IconButton
          size="small"
          onClick={handleRemoveClick}
          aria-label="delete-exercise"
        >
          <DeleteOutline fontSize="small" />
        </IconButton>
      </Stack>
    </Paper>
  );
});
